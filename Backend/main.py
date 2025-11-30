from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.register import signup 
from routes.course import courseRoute
from routes.register import login
from routes.project import projectRoute 
# Correct import for admin router from the admin folder
from routes.admin.admin import router as admin_router

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
app.include_router(admin_router)