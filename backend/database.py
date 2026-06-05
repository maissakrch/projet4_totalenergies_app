import sqlite3
import os

DB_PATH = "data/app.db"

def get_db():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Table tickets
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titre TEXT NOT NULL,
            description TEXT NOT NULL,
            categorie_predite TEXT,
            score_confiance REAL,
            statut TEXT DEFAULT 'ouvert',
            priorite TEXT DEFAULT 'normale',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # Table logs applicatifs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            niveau TEXT NOT NULL,
            message TEXT NOT NULL,
            endpoint TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # Table incidents
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titre TEXT NOT NULL,
            description TEXT NOT NULL,
            cause TEXT,
            solution TEXT,
            statut TEXT DEFAULT 'ouvert',
            created_at TEXT DEFAULT (datetime('now')),
            resolved_at TEXT
        )
    """)

    conn.commit()

    # Insérer des tickets de démonstration si la table est vide
    cursor.execute("SELECT COUNT(*) FROM tickets")
    count = cursor.fetchone()[0]

    if count == 0:
        tickets_demo = [
            ("VPN impossible depuis ce matin", "Erreur 403 au démarrage du VPN TotalEnergies", "Accès & Authentification", 0.31, "ouvert", "haute"),
            ("Outlook ne reçoit plus les mails", "Aucun mail reçu depuis hier 14h", "Messagerie", 0.99, "en cours", "haute"),
            ("Demande installation Python 3.11", "Besoin pour projet data, pas de droits admin", "Installation Logiciel", 0.98, "résolu", "normale"),
            ("PC très lent depuis Windows Update", "Inutilisable depuis mise à jour vendredi", "Performance", 0.99, "ouvert", "haute"),
            ("Imprimante 3ème étage en panne", "Voyant rouge allumé HP LaserJet bureau 312", "Matériel", 0.85, "en cours", "normale"),
            ("Accès refusé SharePoint", "Manager m'a ajouté mais accès refusé", "Accès & Authentification", 0.29, "ouvert", "normale"),
            ("Teams plante au démarrage", "Se ferme tout seul depuis mise à jour lundi", "Logiciel", 0.17, "ouvert", "basse"),
            ("Alerte phishing reçue", "Mail suspect demandant identifiants TotalEnergies", "Sécurité", 0.29, "résolu", "haute"),
            ("Réseau wifi coupé open space 4ème", "Wifi coupé dans tout l'open space depuis 10h30", "Réseau", 0.77, "résolu", "haute"),
            ("SAP lent depuis ce matin", "Chaque action prend plus de 30 secondes", "Performance", 0.47, "en cours", "normale"),
            ("Écran second moniteur non détecté", "Non détecté après redémarrage PC", "Matériel", 0.27, "ouvert", "basse"),
            ("Besoin Power BI Premium", "Licence nécessaire pour projet reporting", "Installation Logiciel", 0.92, "ouvert", "normale"),
            ("Virus détecté sur mon poste", "Windows Defender alerte sur fichier Teams", "Sécurité", 0.68, "résolu", "haute"),
            ("OneDrive bloqué depuis 3 jours", "Erreur synchronisation fichiers non sauvegardés", "Logiciel", 0.36, "en cours", "normale"),
            ("Nouveau badge prestataire Accenture", "Besoin compte Active Directory pour prestataire", "Accès & Authentification", 0.48, "ouvert", "normale"),
        ]
        cursor.executemany("""
            INSERT INTO tickets (titre, description, categorie_predite, score_confiance, statut, priorite)
            VALUES (?, ?, ?, ?, ?, ?)
        """, tickets_demo)
        conn.commit()

    conn.close()