
# Spécifications fonctionnelles et techniques

## Application de support IT — TotalEnergies (Projet 4)

## 1. Objectif du projet

Fournir aux équipes support IT de TotalEnergies une application de gestion de
tickets avec classification automatique par intelligence artificielle
(intégration du service développé dans le Projet 2), un suivi complet du
cycle de vie des tickets, et une supervision technique de l'application.

## 2. Périmètre fonctionnel — 4 pages

### Dashboard (page d'accueil, route `/`)

- Vue d'ensemble synthétique de l'activité support

### Tickets (route `/tickets`)

- Liste de tous les tickets, avec filtres par statut, priorité et catégorie
- Formulaire de création togglable (titre, description, priorité)
- Classification automatique de la catégorie via appel à l'API du Projet 2
  à la création
- Actions rapides : mise à jour du statut, suppression

### TicketDetail (route `/tickets/:id`)

- Détail complet d'un ticket : titre, description, catégorie prédite, score
  de confiance, statut, priorité, dates de création et de mise à jour
- Modification du statut et de la priorité

### Monitoring (route `/monitoring`)

- Métriques techniques : total de tickets, tickets ouverts, tickets urgents,
  erreurs applicatives, incidents ouverts, tickets créés sur 24h, top
  catégories, volume par jour sur 7 jours
- Consultation des journaux applicatifs (filtrables par niveau)
- Suivi des incidents techniques (création, mise à jour, résolution)

## 3. Spécifications techniques

| Composant                      | Choix technique                               | Justification                                        |
| ------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| Frontend                       | React + Vite                                  | Rapidité de développement, hooks natifs suffisants |
| Backend                        | FastAPI                                       | Cohérence avec les Projets 1, 2 et 3                |
| Base de données               | SQLite (accès direct via sqlite3)            | Simplicité adaptée au périmètre du projet        |
| Authentification API           | Header X-API-Key                              | Cohérence avec les autres projets                   |
| Communication frontend/backend | CORS ouvert sur localhost:5173                | Autorise le serveur de dev Vite                      |
| Intégration IA                | Appel HTTP vers l'API du Projet 2 (port 8000) | Réutilisation du service déjà développé         |

## 4. Contraintes connues

- Le frontend doit être ouvert dans Chrome (incompatibilité constatée avec
  Waterfox, documentée dans le rapport d'incident)
- L'API du Projet 2 doit être démarrée avant de créer un ticket, sinon la
  classification automatique est indisponible (comportement dégradé prévu :
  le ticket est créé sans catégorie)
- Le backend écoute sur le port 8001, pour ne pas entrer en conflit avec
  l'API du Projet 2 (port 8000)

## 5. Hors périmètre (Won't have)

- Authentification utilisateur (login/mot de passe) pour l'application elle-même
- Notifications temps réel (email, push)
- Interface d'administration séparée
