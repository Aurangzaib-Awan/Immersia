# routes/agent.py
from fastapi import APIRouter, Request, HTTPException
from db import client
from bson import ObjectId
from utils.agent_nodes.agent_workflow import run_learning_cycle

router = APIRouter()
db = client["immersia"]
users_collection = db["users"]

@router.get("/recommend")
async def get_recommendation(request: Request):
    session = request.state.session
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    email = session.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])

    result = run_learning_cycle(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="No recommendation found")

    return {
        "recommendation": result,
        "knownTopics": user.get("knownTopics", []),
        "unknownTopics": user.get("unknownTopics", [])
    }