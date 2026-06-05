import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

# ---------------------------------------------------------
# TESTS STATUS
# ---------------------------------------------------------

class TestStatus:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

# ---------------------------------------------------------
# TESTS TICKETS
# ---------------------------------------------------------

class TestTickets:
    def test_get_all_tickets(self):
        response = client.get("/tickets/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_tickets_filter_statut(self):
        response = client.get("/tickets/?statut=ouvert")
        assert response.status_code == 200
        data = response.json()
        for ticket in data:
            assert ticket["statut"] == "ouvert"

    def test_create_ticket(self):
        response = client.post("/tickets/", json={
            "titre": "Test ticket pytest",
            "description": "Description test automatise",
            "priorite": "normale"
        })
        assert response.status_code == 201
        assert "id" in response.json()

    def test_get_ticket_by_id(self):
        create = client.post("/tickets/", json={
            "titre": "Ticket ID test",
            "description": "Test get by ID",
            "priorite": "basse"
        })
        ticket_id = create.json()["id"]
        response = client.get(f"/tickets/{ticket_id}")
        assert response.status_code == 200
        assert response.json()["id"] == ticket_id

    def test_get_ticket_not_found(self):
        response = client.get("/tickets/99999")
        assert response.status_code == 404

    def test_update_ticket_statut(self):
        create = client.post("/tickets/", json={
            "titre": "Ticket update test",
            "description": "Test update statut",
            "priorite": "normale"
        })
        ticket_id = create.json()["id"]
        response = client.patch(f"/tickets/{ticket_id}", json={"statut": "résolu"})
        assert response.status_code == 200

    def test_delete_ticket(self):
        create = client.post("/tickets/", json={
            "titre": "Ticket delete test",
            "description": "Test suppression",
            "priorite": "basse"
        })
        ticket_id = create.json()["id"]
        response = client.delete(f"/tickets/{ticket_id}")
        assert response.status_code == 200
        get = client.get(f"/tickets/{ticket_id}")
        assert get.status_code == 404

    def test_get_stats(self):
        response = client.get("/tickets/stats/summary")
        assert response.status_code == 200
        data = response.json()
        assert "total_tickets" in data
        assert "ouverts" in data
        assert "resolus" in data

# ---------------------------------------------------------
# TESTS MONITORING
# ---------------------------------------------------------

class TestMonitoring:
    def test_get_metrics(self):
        response = client.get("/monitoring/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "total_tickets" in data
        assert "tickets_urgents" in data

    def test_create_log(self):
        response = client.post("/monitoring/logs", json={
            "niveau": "INFO",
            "message": "Test log pytest",
            "endpoint": "/test"
        })
        assert response.status_code == 201

    def test_get_logs(self):
        response = client.get("/monitoring/logs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_incident(self):
        response = client.post("/monitoring/incidents", json={
            "titre": "Incident test pytest",
            "description": "Test incident automatise",
            "cause": "Cause test",
            "solution": "Solution test"
        })
        assert response.status_code == 201
        assert "id" in response.json()

    def test_get_incidents(self):
        response = client.get("/monitoring/incidents")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_resolve_incident(self):
        create = client.post("/monitoring/incidents", json={
            "titre": "Incident resolve test",
            "description": "Test resolution",
        })
        incident_id = create.json()["id"]
        response = client.patch(f"/monitoring/incidents/{incident_id}", json={"statut": "résolu"})
        assert response.status_code == 200