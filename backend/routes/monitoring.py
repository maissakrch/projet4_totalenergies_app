import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import APIRouter, HTTPException
from backend.database import get_db
from backend.models import LogCreate, IncidentCreate, IncidentUpdate
from logger import log
from datetime import datetime

router = APIRouter()

# ---------------------------------------------------------
# LOGS APPLICATIFS
# ---------------------------------------------------------

@router.get("/logs")
def get_logs(limit: int = 50, niveau: str = None):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM app_logs WHERE 1=1"
    params = []

    if niveau:
        query += " AND niveau = ?"
        params.append(niveau)

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs

@router.post("/logs", status_code=201)
def create_log(log_entry: LogCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO app_logs (niveau, message, endpoint)
        VALUES (?, ?, ?)
    """, (log_entry.niveau, log_entry.message, log_entry.endpoint))
    conn.commit()
    conn.close()
    return {"message": "Log enregistré"}

# ---------------------------------------------------------
# MÉTRIQUES
# ---------------------------------------------------------

@router.get("/metrics")
def get_metrics():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM tickets")
    total_tickets = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE statut = 'ouvert'")
    tickets_ouverts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE priorite = 'haute' AND statut = 'ouvert'")
    tickets_urgents = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM app_logs WHERE niveau = 'ERROR'")
    total_errors = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM incidents WHERE statut = 'ouvert'")
    incidents_ouverts = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM tickets
        WHERE created_at >= datetime('now', '-24 hours')
    """)
    tickets_24h = cursor.fetchone()[0]

    cursor.execute("""
        SELECT categorie_predite, COUNT(*) as nb
        FROM tickets
        WHERE categorie_predite IS NOT NULL
        GROUP BY categorie_predite
        ORDER BY nb DESC
    """)
    top_categories = [{"categorie": row[0], "nb": row[1]} for row in cursor.fetchall()]

    cursor.execute("""
        SELECT DATE(created_at) as date, COUNT(*) as nb
        FROM tickets
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
    """)
    tickets_par_jour = [{"date": row[0], "nb": row[1]} for row in cursor.fetchall()]

    conn.close()

    return {
        "total_tickets": total_tickets,
        "tickets_ouverts": tickets_ouverts,
        "tickets_urgents": tickets_urgents,
        "total_errors": total_errors,
        "incidents_ouverts": incidents_ouverts,
        "tickets_24h": tickets_24h,
        "top_categories": top_categories,
        "tickets_par_jour": tickets_par_jour,
        "timestamp": datetime.now().isoformat()
    }

# ---------------------------------------------------------
# INCIDENTS
# ---------------------------------------------------------

@router.get("/incidents")
def get_incidents():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
    incidents = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return incidents

@router.post("/incidents", status_code=201)
def create_incident(incident: IncidentCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO incidents (titre, description, cause, solution)
        VALUES (?, ?, ?, ?)
    """, (incident.titre, incident.description, incident.cause, incident.solution))
    conn.commit()
    incident_id = cursor.lastrowid
    conn.close()
    log(f"🚨 Incident #{incident_id} créé : {incident.titre}")
    return {"id": incident_id, "message": "Incident créé"}

@router.patch("/incidents/{incident_id}")
def update_incident(incident_id: int, update: IncidentUpdate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM incidents WHERE id = ?", (incident_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} introuvable")

    updates = []
    params = []

    if update.cause:
        updates.append("cause = ?")
        params.append(update.cause)
    if update.solution:
        updates.append("solution = ?")
        params.append(update.solution)
    if update.statut:
        updates.append("statut = ?")
        params.append(update.statut)
    if update.statut == "résolu":
        updates.append("resolved_at = datetime('now')")

    if updates:
        params.append(incident_id)
        cursor.execute(f"UPDATE incidents SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

    conn.close()
    log(f"✏️ Incident #{incident_id} mis à jour")
    return {"message": f"Incident #{incident_id} mis à jour"}

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    incident = cursor.fetchone()
    conn.close()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} introuvable")
    return dict(incident)