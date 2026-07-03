# DataWhisper Pipelines

This directory contains the AI workflows for DataWhisper, authored using the RocketRide framework.

## Architecture

The pipelines define the cognitive orchestration logic that translates a user's natural language question into actionable data analysis.

### Diagram

```text
           [ BACKEND API ]                [ BACKEND API ]
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

### Core Pipelines
- `analyze.pipe`: The primary orchestration file for DataWhisper. 
  - **Inputs**: `schema_str` (the dataset schema), `sample_str` (top rows of data), and `user_question`.
  - **Agent Setup**: Uses `DataAnalysisAgent`, initialized with a Gemini Flash model and system instructions. 
  - **Tools Provided**: 
    - `python_eval`: Allows the agent to write and execute python code (e.g. Pandas) dynamically to compute answers or transform the dataset based on the user's query.
  - **Output Parsing**: If the agent's response indicates a chart should be displayed, the agent is instructed to format the output string exactly as `[CHART:<type>|<data_json>]` so the frontend can intercept and render the visual.

## Running / Modifying

Pipelines are loaded automatically by the RocketRide Engine when called from the Python Backend (`rocketride_client.py`).

To modify a pipeline's behavior:
1. Open `.pipe` files in your IDE.
2. Update the agent prompts, temperature, or available tools.
3. The changes take effect dynamically the next time the pipeline is invoked by the client—no backend restart is strictly necessary, but ensuring your RocketRide Engine is running is required.
