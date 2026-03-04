import asyncio
from httpx import AsyncClient
from main import app

async def run():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.post("/api/generate-project", json={"user_id":"u1","skills":["x"]})
        print('status', r.status_code)
        print('body', r.json())

asyncio.run(run())
