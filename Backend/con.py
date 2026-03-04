
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri="mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/?appName=Cluster1"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# load environment to allow overriding via .env
load_dotenv()

# read uri from environment, fall back to previous hardcoded value
uri = os.getenv("MONGODB_URI", "mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/?appName=Cluster1")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
