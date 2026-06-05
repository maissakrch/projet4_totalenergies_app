# Projet 4 — Application IT Support TotalEnergies

## Contexte

TotalEnergies gere un volume important de tickets IT internes.
Ce projet developpe une application metier complete permettant
de consulter, analyser et superviser les tickets IT enrichis par l'IA.

Bloc de competences valide : C14 a C21

---

## Architecture

projet4_totalenergies_app/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── routes/
│       ├── tickets.py
│       └── monitoring.py
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Tickets.jsx
│       │   ├── TicketDetail.jsx
│       │   └── Monitoring.jsx
│       ├── components/
│       │   └── Navbar.jsx
│       └── App.jsx
├── tests/
│   └── test_api.py
├── docs/
│   ├── user_stories.md
│   ├── specifications.md
│   └── incident_report.md
├── data/
│   └── app.db
└── .github/
    └── workflows/
        └── ci.yml

---

## Installation

Prerequis : Python 3.13, Node.js 26, pip, npm

Backend :
pip install fastapi uvicorn sqlalchemy python-dotenv pytest httpx requests pandas

Frontend :
cd frontend
npm install

---

## Lancement

Terminal 1 — Backend :
cd projet4_totalenergies_app
uvicorn backend.main:app --reload --port 8001

Terminal 2 — Frontend :
cd projet4_totalenergies_app/frontend
npm run dev -- --port 3000

Terminal 3 — API Classificateur projet 2 (optionnel) :
cd projet2_totalenergies_ia
uvicorn src.api.main:app --reload --port 8000

Application : http://localhost:3000
API Swagger : http://127.0.0.1:8001/docs

---

## Pages de l'application

Dashboard : KPIs globaux, categories IA, acces rapide
Tickets : liste filtrable, creation avec classification IA automatique
Detail ticket : infos completes, analyse IA, modification statut
Monitoring : metriques temps reel, incidents C21, logs applicatifs

---

## Tests

pytest tests/test_api.py -v
16 tests — 16/16 PASSED

---

## CI/CD

GitHub Actions — 2 jobs :
test-backend : install Python, tests pytest
test-frontend : install Node, build React

---

## Competences validees

C14 : Analyse besoin + user stories + wireframes
C15 : Architecture technique React + FastAPI + SQLite
C16 : Methode agile simulee (backlog user stories)
C17 : Developpement composants React + API FastAPI
C18 : Tests automatises pytest 16/16
C19 : CI/CD GitHub Actions pipeline complet
C20 : Monitoring metriques + logs + alertes
C21 : Incidents documentes dans incident_report.md