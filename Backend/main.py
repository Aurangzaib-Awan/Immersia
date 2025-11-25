from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import signup 

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(signup.router)