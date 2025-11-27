from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.register import signup 
from routes.course import courseRoute
from routes.register import login

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(courseRoute.router) 
app.include_router(signup.router)
app.include_router(login.router)