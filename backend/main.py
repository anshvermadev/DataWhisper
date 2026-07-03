from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import uuid
import json
import io

from executor import execute_plan
from rocketride_client import run_analyze_pipeline
from dotenv import load_dotenv
import os

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

app = FastAPI(title="DataWhisper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for datasets and compute results (for demo purposes)
DATASETS = {}
LATEST_COMPUTE = {}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")
        
    dataset_id = str(uuid.uuid4())
    DATASETS[dataset_id] = df
    
    columns = [{"name": col, "type": str(dtype)} for col, dtype in df.dtypes.items()]
    sample_df = df.head(3).astype(object).where(pd.notna(df.head(3)), None)
    sample = sample_df.to_dict(orient="records")
    
    return {
        "dataset_id": dataset_id,
        "columns": columns,
        "row_count": len(df),
        "sample": sample
    }

class AskRequest(BaseModel):
    dataset_id: str
    question: str

@app.post("/ask")
async def ask_question(request: AskRequest):
    if request.dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = DATASETS[request.dataset_id]
    
    # Prepare context for the pipeline
    columns = [{"name": col, "type": str(dtype)} for col, dtype in df.dtypes.items()]
    schema_str = json.dumps(columns)
    sample_str = json.dumps(df.head(3).to_dict(orient="records"))
    
    # Run the pipeline
    try:
        answer_raw = await run_analyze_pipeline(request.dataset_id, schema_str, sample_str, request.question)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    if not answer_raw:
        raise HTTPException(status_code=500, detail="Pipeline failed to return an answer (Agent hit max waves or returned empty).")
        
    answer_raw = str(answer_raw).strip()
    if answer_raw.startswith("LLM error:"):
        raise HTTPException(status_code=429, detail=answer_raw)
        
    # Get the latest compute result that the LLM triggered
    compute_data = LATEST_COMPUTE.get(request.dataset_id, {})
    plan = compute_data.get("plan", {})
    
    # Parse the LLM's returned JSON
    answer_text = answer_raw
    parsed_json = {}
    if answer_raw.startswith('{'):
        try:
            parsed_json = json.loads(answer_raw)
            answer_text = parsed_json.get("answer", answer_raw)
        except:
            pass

    # Merge chart info
    chart = parsed_json.get("chart")
    
    op_name = plan.get("operation", "").lower()
    is_groupby = "group" in op_name
    
    # Fuzzy extract metric and group_by
    group_cols = plan.get("group_by") or plan.get("groupby") or plan.get("by")
    if isinstance(group_cols, str):
        group_cols = [group_cols]
        
    metric_col = plan.get("metric") or plan.get("column")
    agg_val = plan.get("aggregate") or plan.get("agg")
    if isinstance(agg_val, dict) and not metric_col:
        metric_col = list(agg_val.keys())[0]
        
    if not chart and is_groupby and group_cols and metric_col:
        x_col = group_cols[0]
        y_col = metric_col
        
        chart_type = "bar"
        x_col_lower = x_col.lower()
        if any(keyword in x_col_lower for keyword in ["date", "time", "month", "year", "quarter"]):
            chart_type = "line"
        elif compute_data.get("numbers") and isinstance(compute_data["numbers"], list) and len(compute_data["numbers"]) <= 4:
            chart_type = "pie"
            
        chart = {
            "type": chart_type,
            "x": x_col,
            "y": y_col
        }
        
    # Generate deterministic follow-up questions
    import random
    follow_ups = []
    numeric_cols = [col for col, dtype in df.dtypes.items() if "int" in str(dtype) or "float" in str(dtype)]
    string_cols = [col for col, dtype in df.dtypes.items() if "object" in str(dtype) or "str" in str(dtype)]
    
    if numeric_cols and string_cols:
        nc = random.choice(numeric_cols)
        sc = random.choice(string_cols)
        follow_ups.append(f"Which {sc} had the highest {nc}?")
        follow_ups.append(f"Show me the total {nc} by {sc}.")
    if numeric_cols:
        nc = random.choice(numeric_cols)
        follow_ups.append(f"What is the average {nc} overall?")
        
    # Determine numbers payload
    final_numbers = compute_data.get("numbers")
    llm_numbers = parsed_json.get("numbers")
    
    # If the LLM returned a custom array, use it. Otherwise, always prefer the backend's array so comparative charts work!
    if llm_numbers is not None:
        if isinstance(llm_numbers, list):
            final_numbers = llm_numbers
        elif not isinstance(final_numbers, list):
            # Both are scalars, just use LLM's
            final_numbers = llm_numbers

    # Construct the final JSON response directly in the backend
    return {
        "answer": answer_text,
        "numbers": final_numbers,
        "columns_used": parsed_json.get("columns_used") or (plan.get("group_by", []) + [plan.get("metric")] if plan.get("metric") else []),
        "operation": parsed_json.get("operation", compute_data.get("operation", "unknown")),
        "chart": chart,
        "plan": parsed_json.get("plan", plan),
        "follow_ups": list(set(follow_ups))
    }

@app.post("/internal/compute")
async def internal_compute(plan: dict):
    """
    Internal endpoint called by the RocketRide tool_http_request.
    """
    dataset_id = plan.get('dataset_id')
    if not dataset_id:
        if not DATASETS:
            return {"error": "No datasets available"}
        dataset_id = list(DATASETS.keys())[-1]
        
    if dataset_id not in DATASETS:
        return {"error": "Dataset not found"}
        
    df = DATASETS[dataset_id]
    
    try:
        result = execute_plan(df, plan)
        # Store for the frontend response
        LATEST_COMPUTE[dataset_id] = {
            "numbers": result["value"],
            "operation": result["operation_used"],
            "plan": plan
        }
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
def health_check():
    return {"ok": True}



