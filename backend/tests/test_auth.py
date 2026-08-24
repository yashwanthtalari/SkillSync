import pytest

@pytest.mark.asyncio
async def test_register_and_login_student(client):
    # 1. Register student
    reg_payload = {
        "email": "test.student@example.com",
        "password": "password123",
        "full_name": "Test Student",
        "role": "student",
        "university": "Test University",
        "degree": "B.Tech CSE",
        "graduation_year": 2026
    }
    res = await client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "student"

    # 2. Login student
    login_payload = {
        "email": "test.student@example.com",
        "password": "password123"
    }
    res_login = await client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data

    # 3. Get /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    res_me = await client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == "test.student@example.com"
    assert me_data["role"] == "student"
