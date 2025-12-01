# oauth.py
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from auth import create_access_token
from con import client
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

db = client["immersia"]
users_collection = db["users"]
role_emails_collection = db["role_emails"]

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

@router.get("/auth/google")
async def google_auth():
    """Redirect to Google OAuth"""
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=email profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return RedirectResponse(google_auth_url)

@router.get("/auth/google/callback")
async def google_auth_callback(request: Request, code: str = None):
    """Handle Google OAuth callback - Only for regular users (students)"""
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    try:
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        access_token = token_json.get("access_token")
        
        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info = user_info_response.json()
        
        if user_info_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Check if user exists in database
        user = users_collection.find_one({"email": email})
        
        # For Google OAuth, always set role as "student" - no admin/HR/mentor roles
        role = "student"
        
        if not user:
            # Create new user with student role only
            user_data = {
                "email": email,
                "name": name,
                "picture": picture,
                "auth_provider": "google",
                "role": role
            }
            result = users_collection.insert_one(user_data)
            user = users_collection.find_one({"_id": result.inserted_id})
        else:
            # Update existing user to ensure they have student role for Google OAuth
            users_collection.update_one(
                {"email": email},
                {"$set": {"role": role, "auth_provider": "google"}}
            )
        
        # Create JWT token with student role only
        token_payload = {
            "email": email,
            "role": role,
            "is_admin": False,
            "is_hr": False, 
            "is_mentor": False,
            "auth_provider": "google"
        }
        
        token = create_access_token(token_payload)
        
        # Redirect to frontend with token
        frontend_url = f"http://localhost:3000/oauth-success?token={token}&email={email}"
        return RedirectResponse(frontend_url)
        
    except Exception as e:
        print("Google OAuth error:", e)
        raise HTTPException(status_code=500, detail="OAuth authentication failed")