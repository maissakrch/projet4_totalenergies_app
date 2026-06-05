# Rapport d'Incident Technique — C21
## Application IT Support TotalEnergies

---

## Incident #1 — API Classificateur IA Indisponible

**Date :** 04 Juin 2026
**Statut :** Résolu
**Sévérité :** Haute

### Description
Lors de la création d'un nouveau ticket IT depuis l'application,
la classification automatique par IA ne fonctionnait pas.
Les tickets étaient créés sans catégorie prédite ni score de confiance.

### Symptômes observés
- Champ `categorie_predite` à NULL dans la base de données
- Champ `score_confiance` à NULL dans la base de données
- Log : `⚠️ Classification IA indisponible : Connection refused`
- Aucun message d'erreur visible pour l'utilisateur

### Cause identifiée
L'API du projet 2 (classificateur HuggingFace) n'était pas démarrée
sur le port 8000. Le backend du projet 4 tentait de contacter
`http://127.0.0.1:8000/classifier` mais obtenait une erreur
`Connection refused`.

### Procédure de débogage
1. Lecture des logs dans `app.log` → détection du message d'erreur
2. Test manuel de l'endpoint via curl :
```bash
curl http://127.0.0.1:8000/classifier
# Résultat : Connection refused
```
3. Vérification des processus actifs :
```bash
lsof -i :8000
# Résultat : aucun processus sur le port 8000
```
4. Identification : l'API classificateur n'était pas lancée

### Solution implémentée
1. Démarrage de l'API classificateur projet 2 :
```bash
cd ~/Documents/projet2_totalenergies_ia
uvicorn src.api.main:app --reload --port 8000
```
2. Vérification que le ticket suivant est bien classifié
3. Le comportement dégradé (ticket créé sans classification)
   est documenté comme acceptable — le ticket est créé quand même,
   la classification peut être ajoutée manuellement

### Mesures préventives
- Ajouter un endpoint `/health` sur l'API classificateur
- Monitorer la disponibilité de l'API externe depuis le dashboard
- Documenter le démarrage des 3 services dans le README

### Versionnement
Correction documentée dans le commit :
`fix: gestion erreur classification IA indisponible`

---

## Incident #2 — Page blanche React sur Waterfox

**Date :** 05 Juin 2026
**Statut :** Résolu
**Sévérité :** Moyenne

### Description
L'application React affichait une page blanche sur le navigateur
Waterfox. L'application fonctionnait correctement sur Chrome.

### Cause identifiée
Conflit de versions React — plusieurs copies de React chargées
simultanément (react-router-dom utilisait une version différente).

### Solution implémentée
```bash
npm install react@latest react-dom@latest react-router-dom@latest
```
Mise à jour forcée de toutes les dépendances React vers la dernière
version pour garantir une version unique.

### Versionnement
```
fix: résolution conflit versions React/react-router-dom
```