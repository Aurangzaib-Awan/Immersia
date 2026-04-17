import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB URI
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/?appName=Cluster1")

# Create client with standard DNS resolution
client = MongoClient(
    MONGODB_URI,
    server_api=ServerApi('1'),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000
)