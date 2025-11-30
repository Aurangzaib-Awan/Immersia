from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.register import signup 
from routes.course import courseRoute
from routes.register import login
from routes.project import projectRoute 
from routes.admin import admin
from routes import talent 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courseRoute.router) 
app.include_router(signup.router)
app.include_router(login.router)
app.include_router(projectRoute.router)
app.include_router(admin.router)
app.include_router(talent.router)