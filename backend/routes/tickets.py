import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import APIRouter, HTTPException
from backend.database import get_db
from backend.models import TicketCreate, TicketUpdate, TicketResponse, StatsResponse
from logger import log
import requests

router = APIRouter()

CLASSIFIER_URL = "http://127.0.0.1:8000/classifier"
CLASSIFIER_KEY = "totalenergies-secret-key-2024"

# ---------------------------------------------------------
# GET tous les tickets
# ---------------------------------------------------------

@router.get("/", response_model=list)
def get_tickets(statut: str = None, priorite: str = None, categorie: str = None):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM tickets WHERE 1=1"
    params = []

    if statut:
        query += " AND statut = ?"
        params.append(statut)
    if priorite:
        query += " AND priorite = ?"
        params.append(priorite)
    if categorie:
        query += " AND categorie_predite = ?"
        params.append(categorie)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    tickets = [dict(row) for row in cursor.fetchall()]
    conn.close()

    log(f"📋 GET /tickets — {len(tickets)} tickets retournés")
    return tickets

# ---------------------------------------------------------
# GET un ticket par ID
# ---------------------------------------------------------

@router.get("/{ticket_id}")
def get_ticket(ticket_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    ticket = cursor.fetchone()
    conn.close()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} introuvable")

    log(f"📋 GET /tickets/{ticket_id}")
    return dict(ticket)

# ---------------------------------------------------------
# POST créer un ticket + classification IA
# ---------------------------------------------------------

@router.post("/", status_code=201)
def create_ticket(ticket: TicketCreate):
    log(f"➕ Création ticket : {ticket.titre}")

    categorie_predite = None
    score_confiance = None

    # Appel API classificateur projet 2
    try:
        response = requests.post(
            CLASSIFIER_URL,
            json={"titre": ticket.titre, "description": ticket.description},
            headers={"X-API-Key": CLASSIFIER_KEY},
            timeout=5
        )
        if response.status_code == 200:
            result = response.json()
            categorie_predite = result.get("categorie_predite")
            score_confiance = result.get("score_confiance")
            log(f"🤖 Classification IA : {categorie_predite} (score: {score_confiance})")
    except Exception as e:
        log(f"⚠️ Classification IA indisponible : {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO tickets (titre, description, categorie_predite, score_confiance, priorite)
        VALUES (?, ?, ?, ?, ?)
    """, (ticket.titre, ticket.description, categorie_predite, score_confiance, ticket.priorite))
    conn.commit()
    ticket_id = cursor.lastrowid
    conn.close()

    log(f"✔️ Ticket #{ticket_id} créé")
    return {"id": ticket_id, "message": "Ticket créé avec succès"}

# ---------------------------------------------------------
# PATCH mettre à jour un ticket
# ---------------------------------------------------------

@router.patch("/{ticket_id}")
def update_ticket(ticket_id: int, update: TicketUpdate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} introuvable")

    updates = []
    params = []
    if update.statut:
        updates.append("statut = ?")
        params.append(update.statut)
    if update.priorite:
        updates.append("priorite = ?")
        params.append(update.priorite)
    if update.categorie_predite:
        updates.append("categorie_predite = ?")
        params.append(update.categorie_predite)

    if updates:
        updates.append("updated_at = datetime('now')")
        params.append(ticket_id)
        cursor.execute(f"UPDATE tickets SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

    conn.close()
    log(f"✏️ Ticket #{ticket_id} mis à jour")
    return {"message": f"Ticket #{ticket_id} mis à jour"}

# ---------------------------------------------------------
# DELETE supprimer un ticket
# ---------------------------------------------------------

@router.delete("/{ticket_id}")
def delete_ticket(ticket_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} introuvable")
    cursor.execute("DELETE FROM tickets WHERE id = ?", (ticket_id,))
    conn.commit()
    conn.close()
    log(f"🗑️ Ticket #{ticket_id} supprimé")
    return {"message": f"Ticket #{ticket_id} supprimé"}

# ---------------------------------------------------------
# GET statistiques
# ---------------------------------------------------------

@router.get("/stats/summary")
def get_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM tickets")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE statut = 'ouvert'")
    ouverts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE statut = 'en cours'")
    en_cours = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE statut = 'résolu'")
    resolus = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tickets WHERE priorite = 'haute'")
    haute = cursor.fetchone()[0]

    cursor.execute("SELECT categorie_predite, COUNT(*) as nb FROM tickets WHERE categorie_predite IS NOT NULL GROUP BY categorie_predite")
    par_categorie = {row[0]: row[1] for row in cursor.fetchall()}

    cursor.execute("SELECT AVG(score_confiance) FROM tickets WHERE score_confiance IS NOT NULL")
    score_moyen = cursor.fetchone()[0] or 0.0

    conn.close()
    return {
        "total_tickets": total,
        "ouverts": ouverts,
        "en_cours": en_cours,
        "resolus": resolus,
        "haute_priorite": haute,
        "par_categorie": par_categorie,
        "score_moyen": round(score_moyen, 4)
    }