# Railway Deployment Configuration for BaraCorrespondance Backend

```yaml
# railway.json - Railway configuration
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "python main.py",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  },
  "variables": {
    "FLASK_ENV": "production",
    "FLASK_DEBUG": "0",
    "PYTHONUNBUFFERED": "1"
  }
}
```

## Déploiement sur Railway

### 1. Prérequis
- Compte Railway (railway.app)
- Repository GitHub avec backend
- Variables d'environnement configurées dans Railway

### 2. Configuration Railway

Railway supporte Python nativement via Nixpacks. Les fichiers suivants sont reconnus :
- `requirements.txt` ✅ (présent dans `backend/`)
- `run.py` ✅ (point d'entrée Flask)
- `.env` et `railway.json` (optionnel)

### 3. Étapes de déploiement

1. Connecter le repo GitHub à Railway:
   - Accéder à https://railway.app/dashboard
   - Cliquer "New Project" → "GitHub Repo"
   - Autoriser l'accès, sélectionner `coulibalyzakaria98-arch/Bara`
   - Sélectionner la branche `main`

2. Configurer les variables d'environnement dans Railway:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/bara_db
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-here
   FLASK_ENV=production
   PYTHONUNBUFFERED=1
   CORS_ORIGINS=https://bara-frontend.vercel.app
   GEMINI_API_KEY=your-gemini-key
   ```

3. Configurer le déploiement:
   - Build command: (laisse vide ou `pip install -r requirements.txt`)
   - Start command: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - Port: 5000 (Railway l'expose automatiquement)

4. Cliquer "Deploy"
   - Railway build automatiquement et déploie
   - URL publique générée (ex: `https://bara-backend-prod-xxxx.railway.app`)

### 4. Post-déploiement

- Migrer la base de données:
  ```bash
  # Via Railway CLI
  railway run flask db upgrade
  ```

- Tester l'endpoint health:
  ```bash
  curl https://bara-backend-prod-xxxx.railway.app/api/health
  ```

- Mettre à jour Frontend `VITE_API_BASE_URL` avec l'URL Railway

---

## Alternative: Render.com

### 1. Configuration Render

1. Créer un compte Render.com
2. New → Web Service → Connect GitHub repo
3. Configurer:
   - **Name**: `bara-backend`
   - **Environment**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - **Plan**: Free (ou Starter)

4. Ajouter variables d'environnement (env vars section)

### 2. Particularités Render

- Déploiement gratis sur Free tier (avec limitation de performance)
- Auto-déploiement sur push vers `main`
- Base de données PostgreSQL disponible (add-on)

---

## Alternative: Heroku (legacy, moins recommandé)

Heroku a supprimé le plan Free. Alternatives:
- Railway ✅ (recommandé)
- Render.com ✅
- Fly.io
- AWS AppRunner
- Google Cloud Run
- Azure App Service

---

## Base de données

### PostgreSQL sur Railway

1. Ajouter PostgreSQL service à Railway:
   - Dashboard → New → Add Service → PostgreSQL
   - Railway génère `DATABASE_URL`

2. Migrer le schéma:
   ```bash
   railway run flask db upgrade
   ```

### Alternative: Hosted PostgreSQL

- ElephantSQL (gratuit)
- AWS RDS (paid)
- DigitalOcean Managed Database (paid)

---

## Logs & Monitoring

### Railway
```bash
# View logs
railway logs

# Watch logs live
railway logs -f
```

### Render
```bash
# Logs disponibles dans Dashboard → Logs tab
```

---

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'flask'`
- Vérifier `requirements.txt` est présent
- Vérifier `PYTHONPATH` (Railway gère auto)

### Issue: 502 Bad Gateway
- Vérifier la base de données est connectée
- Vérifier `DATABASE_URL` format: `postgresql://user:pass@host:5432/db`
- Vérifier `gunicorn` workers: `-w 4` (ajuster si low memory: `-w 2`)

### Issue: CORS errors
- Vérifier `CORS_ORIGINS` incluant l'URL Vercel frontend
- Backend `app/__init__.py` configure CORS via `flask_cors.CORS(app, ...)`

### Issue: Token/Secret Key errors
- Régénérer `SECRET_KEY` et `JWT_SECRET_KEY`
- Stocker dans Railway env vars (JAMAIS en dur)
- Redéployer après changes

---

## Checklist de déploiement

- [ ] Configurer `.env` avec production values
- [ ] Tester localement avec `FLASK_ENV=production`
- [ ] Vérifier `requirements.txt` à jour (incluant gunicorn)
- [ ] Configurer PostgreSQL (Railway ou autre)
- [ ] Configurer variables d'environnement (DATABASE_URL, SECRET_KEY, CORS_ORIGINS, etc.)
- [ ] Déployer backend sur Railway / Render
- [ ] Tester endpoints backend (POST /auth/login, GET /health, etc.)
- [ ] Configurer Frontend VITE_API_BASE_URL
- [ ] Déployer Frontend sur Vercel
- [ ] Tester flow end-to-end (login → upload CV → analyse → download PDF)
- [ ] Configurer domaine custom (optionnel)
- [ ] Mettre en place monitoring (Sentry, logs, alerts)

---

Généré: 2 décembre 2025
