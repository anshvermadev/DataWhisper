import asyncio
import os
from rocketride import RocketRideClient
from rocketride.schema import Question
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path, override=True)

ROCKETRIDE_URI = os.getenv("ROCKETRIDE_URI")
ROCKETRIDE_APIKEY = os.getenv("ROCKETRIDE_APIKEY")

import uuid

async def run_analyze_pipeline(dataset_id: str, schema_str: str, sample_str: str, user_question: str) -> dict:
    """
    Connects to the local RocketRide engine and triggers the analyze.pipe pipeline.
    """
    uri = (ROCKETRIDE_URI or "").strip()
    auth_key = (ROCKETRIDE_APIKEY or "").strip()
    client = RocketRideClient(uri=uri, auth=auth_key)
    
    # Connect
    await client.connect()
    
    # Load pipeline
    pipe_path = os.path.join(os.path.dirname(__file__), '..', 'pipelines', 'analyze.pipe')
    try:
        result = await client.use(filepath=pipe_path, name=uuid.uuid4().hex)
        token = result['token']
    except Exception as e:
        await client.disconnect()
        raise e
    
    # Send data
    q = Question()
    prompt = f"DATASET_ID: {dataset_id}\nSCHEMA: {schema_str}\nSAMPLE: {sample_str}\nQUESTION: {user_question}"
    q.addQuestion(prompt)
    
    try:
        response = await client.chat(token=token, question=q)
        
        # The agent should return the final JSON as its answer text.
        # We will extract it in the FastAPI layer.
        answers = response.get('answers', [])
        if answers and len(answers) > 0:
            return answers[0]
        return None
        
    finally:
        try:
            await client.terminate(token)
        except:
            pass
        await client.disconnect()
