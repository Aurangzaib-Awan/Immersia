from passlib.context import CryptContext
from db import client

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(pwd: str):
    return pwd_context.hash(pwd)


def ensure_seed_accounts():
    db = client["immersia"]
    users = db["users"]
    role_emails = db["role_emails"]

    accounts = [
        {
            "email": "hr@immersia.com",
            "password": "Hr@123123",
            "role": "hr",
            "name": "HR User",
        },
        {
            "email": "mentor@immersia.com",
            "password": "Mentor@123123",
            "role": "mentor",
            "name": "Mentor User",
        },
    ]

    for acct in accounts:
        existing = users.find_one({"email": acct["email"]})
        hashed = hash_password(acct["password"])
        if existing:
            # Update role and password (rotate on change)
            users.update_one({"email": acct["email"]}, {"$set": {"password": hashed, "role": acct["role"], "name": acct.get("name")}})
        else:
            users.insert_one({"email": acct["email"], "password": hashed, "role": acct["role"], "name": acct.get("name")})

        # Ensure role_emails has verified entry so role resolution works
        re = role_emails.find_one({"email": acct["email"]})
        if re:
            role_emails.update_one({"email": acct["email"]}, {"$set": {"role": acct["role"], "is_verified": True}})
        else:
            role_emails.insert_one({"email": acct["email"], "role": acct["role"], "is_verified": True})
