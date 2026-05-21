import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.db.database import create_db_and_tables

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    create_db_and_tables()
    yield

@pytest.fixture
def auth_token():
    # Registrar e iniciar sesión para obtener un token real (usando SQLite en memoria o archivo de test)
    user_data = {"username": "testuser", "password": "testpassword"}
    client.post("/api/v1/auth/register", json=user_data)
    
    login_data = {"username": "testuser", "password": "testpassword"}
    response = client.post("/api/v1/auth/login", data=login_data)
    return response.json()["access_token"]

@pytest.fixture
def mock_engine_query():
    with patch("app.main.engine.query") as mock:
        yield mock

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200

def test_analyze_requirements_authenticated(mock_engine_query, auth_token):
    mock_engine_query.return_value = "Mocked analysis"
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {"user_story": "As a user, I want to login."}
    
    response = client.post("/api/v1/analyze-requirements", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_analyze_requirements_unauthorized(mock_engine_query):
    payload = {"user_story": "As a user, I want to login."}
    response = client.post("/api/v1/analyze-requirements", json=payload)
    assert response.status_code == 401
