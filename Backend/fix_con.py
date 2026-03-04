import os
path = r"c:\Users\asiif\Downloads\Immersia\Backend\con.py"
# desired content below
new_content = '''import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# load environment to allow overriding via .env
load_dotenv()

# read uri from environment, fall back to previous hardcoded value
uri = os.getenv("MONGODB_URI", "mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/?appName=Cluster1")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
'''
# overwrite file with clean content
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print('con.py cleaned duplicates')
