import pytest
import asyncio
from httpx import AsyncClient
from bson import ObjectId

from main import app

# storage for ids across tests
temp = {}

@pytest.mark.asyncio
async def test_generate_project():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"user_id": "test_user_001", "skills": ["Python", "FastAPI", "MongoDB"]}
        resp = await ac.post("/api/generate-project", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    # expect project_id and others
    assert "project_id" in data
    assert isinstance(data.get("project_id"), str)
    assert ObjectId.is_valid(data["project_id"])
    assert data.get("status") == "pending"
    temp["project_id"] = data["project_id"]

@pytest.mark.asyncio
async def test_get_user_projects():
    pid = temp.get("project_id")
    assert pid
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get(f"/api/projects/test_user_001")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data.get("projects"), list)
    found = False
    for p in data["projects"]:
        if p.get("project_id") == pid or str(p.get("_id")) == pid:
            found = True
            assert p.get("status") == "pending"
    assert found, "Created project not in list"

@pytest.mark.asyncio
async def test_mark_project_complete():
    pid = temp.get("project_id")
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.patch(f"/api/projects/{pid}/complete")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "completed"
    assert data.get("completed_at")

@pytest.mark.asyncio
async def test_generate_quiz():
    pid = temp.get("project_id")
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"project_id": pid, "user_id": "test_user_001"}
        resp = await ac.post("/api/generate-quiz", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "questions" in data
    qs = data["questions"]
    assert isinstance(qs, list)
    assert len(qs) == 10
    letters = {"A","B","C","D"}
    for q in qs:
        assert "id" in q
        assert "question" in q
        assert "options" in q and isinstance(q["options"], list) and len(q["options"]) == 4
        assert "correct_answer" in q and q["correct_answer"] in letters
        assert "explanation" in q
    temp["quiz_id"] = data.get("quiz_id")

@pytest.mark.asyncio
async def test_submit_quiz():
    quiz_id = temp.get("quiz_id")
    assert quiz_id
    answers = [
        {"question_id": i, "selected_answer": a}
        for i, a in enumerate(["A","B","A","C","D","A","B","A","C","A"], start=1)
    ]
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"quiz_id": quiz_id, "user_id": "test_user_001", "user_answers": answers}
        resp = await ac.post("/api/quiz/submit", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data.get("score"), int)
    assert data.get("total") == 10
    results = data.get("results")
    assert isinstance(results, list) and len(results) == 10
    for r in results:
        assert "question_id" in r
        assert "is_correct" in r
        assert "correct" in r
        assert "explanation" in r

