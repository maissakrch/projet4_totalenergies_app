from pydantic import BaseModel
from typing import Optional

# ---------------------------------------------------------
# TICKETS
# ---------------------------------------------------------

class TicketCreate(BaseModel):
    titre: str
    description: str
    priorite: Optional[str] = "normale"

class TicketUpdate(BaseModel):
    statut: Optional[str] = None
    priorite: Optional[str] = None
    categorie_predite: Optional[str] = None

class TicketResponse(BaseModel):
    id: int
    titre: str
    description: str
    categorie_predite: Optional[str]
    score_confiance: Optional[float]
    statut: str
    priorite: str
    created_at: str
    updated_at: str

# ---------------------------------------------------------
# LOGS
# ---------------------------------------------------------

class LogCreate(BaseModel):
    niveau: str
    message: str
    endpoint: Optional[str] = None

class LogResponse(BaseModel):
    id: int
    niveau: str
    message: str
    endpoint: Optional[str]
    created_at: str

# ---------------------------------------------------------
# INCIDENTS
# ---------------------------------------------------------

class IncidentCreate(BaseModel):
    titre: str
    description: str
    cause: Optional[str] = None
    solution: Optional[str] = None

class IncidentUpdate(BaseModel):
    cause: Optional[str] = None
    solution: Optional[str] = None
    statut: Optional[str] = None
    resolved_at: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    titre: str
    description: str
    cause: Optional[str]
    solution: Optional[str]
    statut: str
    created_at: str
    resolved_at: Optional[str]

# ---------------------------------------------------------
# STATS
# ---------------------------------------------------------

class StatsResponse(BaseModel):
    total_tickets: int
    ouverts: int
    en_cours: int
    resolus: int
    haute_priorite: int
    par_categorie: dict
    score_moyen: float