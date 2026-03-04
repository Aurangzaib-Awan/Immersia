import asyncio
from routes.project.projectRoute import generate_project, GenerateProjectRequest

async def run():
    req = GenerateProjectRequest(user_id="test", skills=["Python"])
    try:
        result = await generate_project(req)
        print("Result:", result)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    asyncio.run(run())
