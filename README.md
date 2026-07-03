# ⚡ DataWhisper

**An AI-powered conversational data analysis platform.**  
*Upload raw CSV datasets and interactively "talk" to your data using natural language.*

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Red Line GIF" width="100%"/>
</div>

## 🌍 The Real-World Problem We Were Facing

In modern enterprises, data is abundant, but actionable insights are scarce. The traditional data analysis workflow is fundamentally broken and creates massive inefficiencies:

1. **The Technical Bottleneck**: Business leaders, marketers, and product managers constantly have urgent, data-driven questions (e.g., *"Why did our churn rate spike in Q3?"*). However, they lack the SQL or Python skills required to query the database themselves.
2. **The Ticketing Nightmare**: Non-technical users are forced to submit IT or Jira tickets to a centralized Data/BI (Business Intelligence) team. These requests pile up in a massive backlog.
3. **The Feedback Loop of Death**: Days or weeks later, the data team delivers a static dashboard or a CSV. Often, seeing the data spawns a *new* follow-up question (*"Actually, can we see that filtered by region?"*), sending the stakeholder right back to the end of the ticketing queue.
4. **The LLM Hallucination Flaw**: People try to solve this using standard AI chatbots. However, if you paste a massive dataset into a standard LLM, it attempts to guess the math, hallucinates numbers, and cannot be trusted for mission-critical business decisions.

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Red Line GIF" width="100%"/>
</div>

## 🛠️ How We Solve It

DataWhisper democratizes data analysis by leveraging Large Language Models (LLMs) paired with a **deterministic execution sandbox**. 

Instead of teaching users how to code, DataWhisper translates their natural language questions directly into executable Pandas DataFrame operations. 

Crucially, we solve the "hallucination" problem by **not** asking the LLM to guess the final answer. Instead, the LLM acts purely as a **planner and coder**:
- It writes the Python code required to find the answer.
- The **RocketRide engine** executes that code on the actual raw data locally.
- The LLM observes the exact output and narrates the **100% mathematically accurate, deterministic result**.

### 🚀 Real-World Impact
- **Democratized Insights**: Anyone in an organization can ask questions like *"What were the top 5 regions by sales last quarter?"* and instantly receive accurate answers and charts.
- **Speed to Decision**: Eliminates the backlog of data requests, empowering teams to make data-driven decisions in real-time.
- **Cost Efficiency**: Reduces the overhead of building massive, inflexible BI dashboards by allowing users to explore data dynamically without engineering support.

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Red Line GIF" width="100%"/>
</div>

## 🏗️ System Architecture

Our application is cleanly decoupled into three primary components: a **Next.js Frontend**, a **FastAPI Backend**, and a **RocketRide Cognitive Pipeline**.

```text
 _______________________________________________________________________
|                           BROWSER (Next.js)                           |
| Upload CSV   |   Ask question   |   Answer + numbers + CHART          |
|______________|__________________|_____________________________________|
               | POST /upload                 | POST /ask
               ▼                              ▼
 _______________________________________________________________________
|                    BACKEND API (FastAPI + pandas)                     |
| - load CSV into a DataFrame (keyed by dataset_id)                     |
| - invoke RocketRide pipeline for the PLAN                             |
| - EXECUTE the plan with pandas (deterministic math)                   |
| - never exposes GEMINI_API_KEY to client                              |
|_______________________________________________________________________|
               | ANALYZE pipeline             | (compute happens in code)
               ▼                              ▼
 _______________________________________________________________________
|                  ROCKETRIDE PIPELINE (local runtime)                  |
|                                                                       |
| ANALYZE:  [Input: schema + sample rows + question] →                  |
|           [Gemini plan node → structured op spec] →                   |
|           [Validate op spec against schema] →                         |
|           (compute in backend) →                                      |
|           [Gemini narrate node → plain-English answer] →              |
|           [Recommend chart type] → [Output JSON]                      |
|_______________________________________________________________________|
                               |
                               ▼
                        ________________
                       |   Gemini API   |
                       | (plan + narrate)|
                       |________________|
```

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Red Line GIF" width="100%"/>
</div>

## 🔄 User Flow

The complete journey of a user interacting with DataWhisper:

```text
      [ User ]
         │
         │ 1. Drag & Drop CSV
         ▼
     [ Frontend UI ] ─── 2. POST /upload ──▶ [ FastAPI Backend ]
         │                                           │
         │ 3. Type natural query                     │ 4. Extract Schema & Load Pandas DataFrame
         ▼                                           ▼
     [ Frontend UI ] ─── 5. POST /ask ─────▶ [ FastAPI Backend ]
                                                     │
                                                     │ 6. Send Question + Schema + Sample Rows
                                                     ▼
                                             [ RocketRide Engine ]
                                                     │
                                                     │ 7. Execute `analyze.pipe`
                                                     ▼
                                            [ DataAnalysis Agent ]
                                                     │
                                                     │ 8. Write & Run Python Code
                                                     ▼
                                         [ Execution Sandbox (Local) ]
                                                     │
                                                     │ 9. Return raw deterministic output
                                                     ▼
     [ Frontend UI ] ◀── 11. Stream Result ── [ FastAPI Backend ] ◀── 10. Narrate output & format charts
         │
         │ 12. Parse JSON
         ▼
[ Recharts Visualization ]
```

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Red Line GIF" width="100%"/>
</div>

## ⚙️ Pipeline Orchestration (`analyze.pipe`)

DataWhisper utilizes the **RocketRide Engine** to orchestrate the AI workflow seamlessly:

1. **Context Injection**: The `DataAnalysisAgent` receives the user prompt, dataset schema, and a few sample rows to understand the shape of the data.
2. **Code Generation**: The agent uses the `python_eval` tool to write Pandas script that addresses the user's specific query.
3. **Sandboxed Evaluation**: The RocketRide engine evaluates the Python script locally, insulated from the LLM, ensuring strict security and zero data exfiltration.
4. **Observation**: The agent observes the exact, deterministic output of the executed code.
5. **Synthesis & Formatting**: The agent formats a final, plain-English response. If a visual representation is appropriate, it appends a special `[CHART:<type>|<data>]` payload which the frontend intercepts and renders dynamically.

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Red Line GIF" width="100%"/>
</div>

## 📸 Screenshots

*(Screenshots will be added here later)*


