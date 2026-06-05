import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.database import init_db
from backend.routes.tickets import router as tickets_router
from backend.routes.monitoring import router as monitoring_router
from logger import log

load_dotenv()

# ---------------------------------------------------------
# APP
# ---------------------------------------------------------

app = FastAPI(
    title="TotalEnergies IT Support API",
    description="API backend de l'application de gestion des tickets IT TotalEnergies",
    version="1.0.0"
)

# ---------------------------------------------------------
# CORS — permet au frontend React de communiquer
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# DÉMARRAGE
# ---------------------------------------------------------

@app.on_event("startup")
async def startup():
    log("🚀 Démarrage API TotalEnergies IT Support")
    init_db()
    log("✔️ Base de données initialisée")
    log("✔️ API prête sur http://127.0.0.1:8001")

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

app.include_router(tickets_router, prefix="/tickets", tags=["Tickets"])
app.include_router(monitoring_router, prefix="/monitoring", tags=["Monitoring"])

# ---------------------------------------------------------
# ENDPOINTS DE BASE
# ---------------------------------------------------------

@app.get("/", tags=["Status"])
def root():
    return {
        "message": "TotalEnergies IT Support API opérationnelle",
        "version": "1.0.0",
        "docs": "http://127.0.0.1:8001/docs"
    }

@app.get("/health", tags=["Status"])
def health():
    return {
        "status": "healthy",
        "service": "TotalEnergies IT Support API"
    }