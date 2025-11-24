
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri="mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

