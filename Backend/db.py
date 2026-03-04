import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB URI, can be overridden in .env
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/?appName=Cluster1")

# create client
client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
