import os
import dns.resolver
import dns.query
import dns.nameserver
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Force DNS over HTTPS using HTTP/2 (not HTTP/3 which is blocked)
_resolver = dns.resolver.Resolver(configure=False)
_ns = dns.nameserver.DoHNameserver('https://1.1.1.1/dns-query', http_version=2)
_resolver.nameservers = [_ns]
dns.resolver.default_resolver = _resolver

# Load environment variables
load_dotenv()

# MongoDB URI
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://f228754:f228754@cluster1.tanbngq.mongodb.net/?appName=Cluster1")

# Create client
client = MongoClient(
    MONGODB_URI,
    server_api=ServerApi('1'),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000
)