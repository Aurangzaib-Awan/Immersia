import os
import logging
import json
import asyncio

from middleware import session_manager
from seed_accounts import ensure_seed_accounts
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId

from routes import user
from routes.register import signup 
from routes.course import courseRoute
from routes.register import login
from routes.project import projectRoute 
from routes.mentor import mentorRoute
from routes.admin import admin
from routes import proctoring
from routes.talent import talentRoute
from routes import agent

# Suppress TensorFlow and Mediapipe debug output BEFORE importing any ML libraries
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow INFO and WARNING messages
os.environ['MEDIAPIPE_LOG_LEVEL'] = '2'   # Suppress Mediapipe debug output
os.environ['GLOG_minloglevel'] = '2'      # Suppress Glog messages


# Custom JSON encoder to handle MongoDB ObjectId fields
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)



# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

# Set Mediapipe and TensorFlow logging to WARNING level to suppress graph dumps
logging.getLogger("mediapipe").setLevel(logging.WARNING)
logging.getLogger("tensorflow").setLevel(logging.WARNING)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Session middleware (validates cookie-based sessions, CSRF)
from middleware import SessionMiddleware
app.add_middleware(SessionMiddleware)



@app.on_event("startup")
async def start_session_gc():
    # Ensure seed accounts exist (hr and mentor)
    try:
        ensure_seed_accounts()
    except Exception:
        import traceback
        traceback.print_exc()

    async def _gc_loop():
        while True:
            try:
                session_manager.gc()
            except Exception:
                import traceback
                traceback.print_exc()
            await asyncio.sleep(60 * 10)  # run every 10 minutes

    asyncio.create_task(_gc_loop())

app.include_router(courseRoute.router) 
app.include_router(signup.router)
app.include_router(login.router)
app.include_router(projectRoute.router)
app.include_router(mentorRoute.router)
app.include_router(admin.router)
app.include_router(proctoring.router)
app.include_router(talentRoute.router)
app.include_router(user.router, prefix="/users")
app.include_router(agent.router, prefix="/agent")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
