# DataWhisper Backend

This is the backend service for DataWhisper, an AI-powered conversational data analysis application. It provides the APIs for uploading CSV datasets and interacting with the RocketRide engine to answer complex data questions.

## Architecture

The backend is built using **Python 3.13** and **FastAPI**. It acts as the orchestration layer between the Next.js frontend and the local RocketRide execution engine.

### Diagram

```text
           [ FRONTEND ]                   [ FRONTEND ]
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
        [ ROCKETRIDE PIPELINE ]        [ ROCKETRIDE PIPELINE ]
```

### Core Components
- `main.py`: The FastAPI application entrypoint. Exposes the REST API endpoints:
  - `POST /upload`: Ingests CSV files, parses them using Pandas, and stores them in memory.
  - `POST /ask`: Receives user queries, prepares the schema and sample data, and calls the RocketRide client.
- `executor.py`: (Optional) Local execution utilities for debugging Data Analysis agents natively.
- `rocketride_client.py`: Handles connection to the local RocketRide Engine using the RocketRide DAP (Debug Adapter Protocol) SDK. It uploads the `pipelines/analyze.pipe` logic and streams back the final result from the LLM.

## Setup & Running Locally

### Prerequisites
- Python 3.10+
- RocketRide VS Code Extension (Local Engine) running in the background.

### Installation
1. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Environment Configuration:
   Ensure your root project `.env` file contains your `ROCKETRIDE_GEMINI_KEY`.

### Running the Server
Run the FastAPI development server:
```bash
uvicorn main:app --reload --port 8000
```
The API will be available at `http://127.0.0.1:8000`.

## API Documentation
Once running, you can view the interactive Swagger documentation at `http://127.0.0.1:8000/docs`.
