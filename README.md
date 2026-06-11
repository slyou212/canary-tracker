# 🕯️ Canary Tracker

Système de détection d'accès non autorisé avec géolocalisation GPS.

## Structure

```
canary-tracker/
├── public/
│   ├── index.html      ← Page piégée (à partager)
│   └── admin.html      ← Dashboard (accès privé)
├── api/
│   ├── track.js        ← Enregistre les hits
│   └── dashboard.js    ← Retourne les données
├── package.json
└── vercel.json
```

## Variables d'environnement à configurer sur Vercel

| Variable | Valeur |
|---|---|
| `UPSTASH_REDIS_REST_URL` | URL de ton instance Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash |
| `ADMIN_SECRET` | Mot de passe de ton choix (ex: `sindis-admin-2024`) |
| `NTFY_TOPIC` | Nom unique pour les notifs push (ex: `canary-sindis-xyz`) |

## Déploiement

```bash
# 1. Pousser sur GitHub
git init
git add .
git commit -m "canary tracker"
git remote add origin https://github.com/TON_COMPTE/canary-tracker
git push -u origin main

# 2. Importer le repo sur vercel.com
# 3. Ajouter les variables d'environnement
# 4. Deploy !
```

## Utilisation

### Lien à partager (piège)
```
https://canary-tracker.vercel.app/
```

### Dashboard admin
```
https://canary-tracker.vercel.app/admin.html
```
→ Entrer ton ADMIN_SECRET pour voir tous les accès

### Notifications push (optionnel)
Installe l'app **ntfy** sur ton téléphone et abonne-toi au topic :
```
https://ntfy.sh/canary-sindis-xyz
```
→ Tu recevras une notification instantanée à chaque déclenchement.

## Ce qui est collecté à chaque accès
- Adresse IP
- GPS (latitude, longitude, précision) — si accordé
- Appareil (plateforme, résolution écran)
- Navigateur (user agent)
- Langue du navigateur
- Date et heure exactes
