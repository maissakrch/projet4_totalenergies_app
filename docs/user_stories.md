# User Stories — Application IT Support TotalEnergies

## Contexte
Application interne TotalEnergies permettant de consulter, analyser
et superviser les tickets IT enrichis par l'IA.

---

## Epic 1 — Gestion des tickets IT

### US1 — Consulter les tickets
**En tant que** membre de l'équipe support IT,
**Je veux** voir la liste de tous les tickets,
**Afin de** suivre l'état du support en temps réel.

**Critères d'acceptation :**
- [ ] La liste affiche tous les tickets avec titre, catégorie IA, statut, priorité
- [ ] Je peux filtrer par statut (ouvert, en cours, résolu)
- [ ] Je peux filtrer par priorité (haute, normale, basse)
- [ ] Je peux filtrer par catégorie IA
- [ ] Accessibilité : contraste suffisant, navigation clavier possible (WCAG AA)

### US2 — Créer un ticket avec classification IA
**En tant que** employé TotalEnergies,
**Je veux** soumettre un ticket IT,
**Afin que** mon problème soit automatiquement catégorisé par l'IA.

**Critères d'acceptation :**
- [ ] Le formulaire demande titre, description et priorité
- [ ] L'IA classe automatiquement le ticket dès la création
- [ ] Le score de confiance IA est affiché
- [ ] Un message de confirmation s'affiche après création
- [ ] Accessibilité : labels explicites sur tous les champs

### US3 — Consulter le détail d'un ticket
**En tant que** technicien IT,
**Je veux** voir tous les détails d'un ticket,
**Afin de** comprendre le problème et l'analyse IA.

**Critères d'acceptation :**
- [ ] La page affiche titre, description, catégorie IA, score de confiance
- [ ] Le score est visualisé avec une barre de progression colorée
- [ ] Je peux modifier le statut et la priorité
- [ ] Les actions rapides permettent de changer le statut en un clic

### US4 — Modifier le statut d'un ticket
**En tant que** technicien IT,
**Je veux** mettre à jour le statut d'un ticket,
**Afin de** suivre l'avancement de la résolution.

**Critères d'acceptation :**
- [ ] Je peux passer un ticket de ouvert à en cours
- [ ] Je peux marquer un ticket comme résolu
- [ ] La modification est sauvegardée immédiatement

---

## Epic 2 — Monitoring et supervision

### US5 — Consulter le dashboard
**En tant que** manager IT,
**Je veux** voir les KPIs globaux du support,
**Afin de** piloter l'activité de mon équipe.

**Critères d'acceptation :**
- [ ] Le dashboard affiche : total tickets, ouverts, en cours, résolus
- [ ] Le score IA moyen est visible
- [ ] La répartition par catégorie est affichée

### US6 — Monitorer l'application
**En tant que** administrateur système,
**Je veux** surveiller les métriques de l'application,
**Afin de** détecter les anomalies rapidement.

**Critères d'acceptation :**
- [ ] Les métriques se rafraîchissent automatiquement
- [ ] Les logs applicatifs sont consultables
- [ ] Les tickets urgents sont mis en évidence

### US7 — Déclarer et résoudre un incident (C21)
**En tant que** technicien IT,
**Je veux** documenter un incident technique,
**Afin de** garder une trace des problèmes et solutions.

**Critères d'acceptation :**
- [ ] Je peux créer un incident avec titre, description, cause, solution
- [ ] Je peux marquer un incident comme résolu
- [ ] L'historique des incidents est consultable
- [ ] Accessibilité : formulaire utilisable au clavier

---

## Objectifs d'accessibilité (WCAG AA)

- Contraste texte/fond minimum 4.5:1
- Navigation au clavier sur tous les éléments interactifs
- Labels explicites sur tous les champs de formulaire
- Messages d'erreur descriptifs
- Pas de contenu uniquement visuel sans alternative textuelle