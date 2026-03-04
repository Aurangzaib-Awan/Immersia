import asyncio
import json
from httpx import AsyncClient
from main import app
from bson import ObjectId

async def main():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        print("--- TEST 1: generate project")
        r = await ac.post("/api/generate-project", json={"user_id":"test_user_001","skills":["Python","FastAPI","MongoDB"]})
        print(r.status_code, r.text[:200])
        data = r.json()
        pid = data.get("project_id")
        assert r.status_code==200
        assert pid and ObjectId.is_valid(pid)
        print("created project", pid)

        print("--- TEST 2: get user projects")
        r = await ac.get(f"/api/projects/test_user_001")
        print(r.status_code, r.text[:200])
        assert r.status_code==200
        projects = r.json().get("projects",[])
        found = any((p.get("project_id")==pid or str(p.get("_id"))==pid) for p in projects)
        assert found
        print("project found, status", [p for p in projects if p.get("project_id")==pid or str(p.get("_id"))==pid][0].get("status"))

        print("--- TEST 3: mark complete")
        r = await ac.patch(f"/api/projects/{pid}/complete")
        print(r.status_code, r.text[:200])
        assert r.status_code==200
        print("completed response", r.json())

        print("--- TEST 4: generate quiz")
        r = await ac.post("/api/generate-quiz", json={"project_id":pid,"user_id":"test_user_001"})
        print(r.status_code, r.text[:400])
        assert r.status_code==200
        qdata = r.json()
        questions = qdata.get("questions",[])
        assert len(questions)==10
        for q in questions:
            assert q.get("id")
            assert isinstance(q.get("options"), list) and len(q.get("options"))==4
            assert q.get("correct_answer") in ["A","B","C","D"]
        quiz_id = qdata.get("quiz_id")
        print("quiz generated", quiz_id)

        print("--- TEST 5: submit quiz")
        answers = [{"question_id":i,"selected_answer":a} for i,a in enumerate(["A","B","A","C","D","A","B","A","C","A"], start=1)]
        r = await ac.post("/api/quiz/submit", json={"quiz_id":quiz_id,"user_id":"test_user_001","user_answers":answers})
        print(r.status_code, r.text[:400])
        assert r.status_code==200
        res = r.json()
        assert res.get("total")==10
        assert isinstance(res.get("score"), int)
        print("score", res.get("score"))

asyncio.run(main())
