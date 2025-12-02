# 🚀 Guide Complet de Déploiement - BaraCorrespondance

Ce guide couvre le déploiement du frontend sur **Vercel** et du backend sur **Railway** (recommandé).

---

## 📦 Déploiement Frontend (Vercel)

### Prérequis
- Compte Vercel (gratuit: vercel.com)
- Repository GitHub avec le code du frontend
- Node 18+ localement

### Étapes

#### 1. Préparer le frontend

Vérifier que `frontend/vite.config.js` est optimisé:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Optionnel: désactiver en prod pour réduire taille
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        }
      }
    }
  }
});
```

#### 2. Créer `vercel.json` (déjà créé)

Le fichier `frontend/vercel.json` configure:
- Build: `npm run build`
- Output: `dist/`
- Env vars: `VITE_API_BASE_URL` (backend URL)
- Headers CORS

#### 3. Connecter à Vercel

```bash
# Option A: Via CLI
npm i -g vercel
cd frontend
vercel login
vercel deploy

# Option B: Via Dashboard web
# 1. Aller à vercel.com/dashboard
# 2. New Project
# 3. Import Git Repository
# 4. Sélectionner coulibalyzakaria98-arch/Bara
# 5. Framework: React (auto-détecté)
# 6. Build Command: npm run build
# 7. Output Directory: dist
# 8. Environment Variables:
#    - VITE_API_BASE_URL = https://bara-backend-prod.railway.app/api
# 9. Deploy
```

#### 4. Configurer les variables d'environnement dans Vercel

1. Aller à Project Settings → Environment Variables
2. Ajouter:
   ```
   VITE_API_BASE_URL = https://[backend-url]/api
   # Remplacer [backend-url] par l'URL Railway déployée
   ```

#### 5. Mettre à jour le code frontend

Dans `src/services/api.js`, assurer que la base URL utilise la variable d'env:

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 6. Déploiement automatique

Une fois connecté à GitHub, Vercel déploie automatiquement:
- Sur chaque push vers `main`
- Preview sur pull requests
- Rollback facile depuis Dashboard

---

## 🔧 Déploiement Backend (Railway)

### Prérequis
- Compte Railway (gratuit: railway.app)
- Repository GitHub (ou push depuis local)
- Base de données PostgreSQL

### Étapes

#### 1. Préparer le backend

Vérifier les fichiers de config:

**`backend/Procfile`** (déjà créé):
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT run:app
```

**`backend/requirements.txt`** - Vérifier `gunicorn` est listé:
```
Flask==3.0.0
gunicorn==21.2.0
...
```

#### 2. Créer le projet Railway

```bash
# Option A: CLI
npm i -g @railway/cli
railway login
cd backend
railway init
# Sélectionner "Deploy from local directory"

# Option B: Dashboard web
# 1. Aller à railway.app/dashboard
# 2. New Project
# 3. Deploy from GitHub Repo
# 4. Autoriser Railway, sélectionner coulibalyzakaria98-arch/Bara
# 5. Sélectionner la branche main
```

#### 3. Ajouter PostgreSQL

```bash
# Via CLI
railway add
# Sélectionner PostgreSQL

# Via Dashboard
# Dans Project, cliquer "Add Service" → PostgreSQL
# Railway génère DATABASE_URL automatiquement
```

#### 4. Configurer les variables d'environnement

Dans Railway Dashboard (Project → Variables):

```
DATABASE_URL=postgresql://...  # Auto-généré si PostgreSQL service ajouté
SECRET_KEY=your-secure-random-key-here
JWT_SECRET_KEY=your-jwt-secret-here
FLASK_ENV=production
FLASK_DEBUG=0
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://bara-frontend.vercel.app
GEMINI_API_KEY=your-gemini-api-key
```

Pour générer des clés sécurisées:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 5. Configurer le déploiement

Dans Railway Project Settings:
- **Build Command**: (laisser vide, Nixpacks auto-détecte)
- **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
- **Root Directory**: `backend/` (si monorepo)

#### 6. Déployer

```bash
railway up
# Ou: cliquer "Deploy" dans Dashboard
```

Railway construit et déploie. URL publique générée (ex: `https://bara-backend-prod.railway.app`).

#### 7. Migrer la base de données

```bash
railway run flask db upgrade
# Ou via Dashboard: Run Command → `flask db upgrade`
```

#### 8. Tester le déploiement

```bash
# Tester endpoint de santé
curl https://[backend-url]/api/health

# Tester login (example)
curl -X POST https://[backend-url]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

---

## 🔗 Connecter Frontend & Backend

### 1. Backend URL → Frontend

1. Récupérer l'URL du backend Railway (ex: `https://bara-backend-prod-xxxx.railway.app`)
2. Dans Vercel Dashboard, aller à Project Settings → Environment Variables
3. Ajouter/modifier:
   ```
   VITE_API_BASE_URL = https://bara-backend-prod-xxxx.railway.app/api
   ```
4. Redéployer (ou cliquer Redeploy Latest)

### 2. Frontend URL → Backend CORS

1. Récupérer l'URL du frontend Vercel (ex: `https://bara-frontend.vercel.app`)
2. Dans Railway Dashboard, aller à Variables
3. Modifier:
   ```
   CORS_ORIGINS = https://bara-frontend.vercel.app
   ```
4. Redéployer

---

## 📊 Configuration Base de Données

### PostgreSQL sur Railway

Railway gère automatiquement PostgreSQL:
1. Ajouter service → PostgreSQL
2. `DATABASE_URL` auto-générée dans Variables
3. Railway gère les backups et replication

### Migrer le schéma

```bash
# Locale (dev)
flask db upgrade

# En production (Railway)
railway run flask db upgrade

# Ou via SSH
railway shell
flask db upgrade
exit
```

### Backup

Railway inclus les backups automatiques sur plan Starter+. Pour Free tier, configurer backup manuel:

```bash
# Dump local
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## 🔐 Sécurité & Bonnes Pratiques

### Secrets

- ❌ **Ne JAMAIS** committer `.env` ou secrets en dur
- ✅ **Toujours** utiliser le gestionnaire de secrets de la plateforme (Vercel Env Vars, Railway Variables)
- ✅ Rotater les clés régulièrement (SECRET_KEY, JWT_SECRET_KEY)

### HTTPS

- Vercel: HTTPS automatique
- Railway: HTTPS automatique pour domaines Railway

### Domaines Custom

**Vercel:**
```
Dashboard → Project Settings → Domains → Add Custom Domain
```

**Railway:**
```
Dashboard → Project → Settings → Custom Domain
```

### Rate Limiting

Ajouter en production (backend `app/__init__.py`):
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

---

## 🚨 Troubleshooting

### Frontend (Vercel)

**Issue: Build fails**
```
Error: Cannot find module 'react'
```
**Solution:**
- Vérifier `package.json` dans `frontend/`
- Vérifier `npm install` a été exécuté
- Vérifier `node_modules` existe localement

**Issue: Blank page / API calls fail**
```
CORS error: No 'Access-Control-Allow-Origin' header
```
**Solution:**
- Vérifier `VITE_API_BASE_URL` dans Vercel Env Vars
- Vérifier backend CORS config inclut l'URL Vercel
- Redéployer frontend après changement env var

### Backend (Railway)

**Issue: 502 Bad Gateway**
```
Service error or crashed
```
**Solution:**
```bash
railway logs -f
# Vérifier la cause de l'erreur dans les logs
```

**Issue: Database connection error**
```
Error: could not connect to server: Connection refused
```
**Solution:**
- Vérifier `DATABASE_URL` format
- Vérifier PostgreSQL service est running
- Vérifier variables d'environnement

**Issue: Module import error**
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:**
- Vérifier `requirements.txt` existe et est complet
- Redéployer: `railway up --force`

---

## ✅ Checklist Déploiement

### Frontend (Vercel)
- [ ] `frontend/vercel.json` configuré
- [ ] `src/services/api.js` utilise `VITE_API_BASE_URL` 
- [ ] `npm run build` fonctionne localement
- [ ] Repository GitHub connecté à Vercel
- [ ] Variables d'env (VITE_API_BASE_URL) configurées
- [ ] Domaine custom configuré (optionnel)
- [ ] Test: accéder à l'URL Vercel, vérifier pas d'erreurs

### Backend (Railway)
- [ ] `backend/Procfile` créé
- [ ] `backend/requirements.txt` inclut `gunicorn`
- [ ] `backend/run.py` fonctionne localement
- [ ] Repository GitHub connecté à Railway
- [ ] PostgreSQL service ajouté
- [ ] Variables d'env complètes (DATABASE_URL, SECRET_KEY, CORS_ORIGINS, etc.)
- [ ] Migration BDD: `railway run flask db upgrade`
- [ ] Test: `curl https://[backend-url]/api/health`

### Integration
- [ ] Frontend URL → Backend `CORS_ORIGINS`
- [ ] Backend URL → Frontend `VITE_API_BASE_URL`
- [ ] Test flow complet: login → upload CV → analyse → download PDF

---

## 📱 Post-Déploiement

### Monitoring
- Configurer Sentry pour error tracking
- Configurer DataDog ou NewRelic pour APM
- Ajouter Google Analytics au frontend

### Performance
- Vérifier Core Web Vitals (Vercel Dashboard)
- Vérifier response times API (Railway Logs)
- Optimiser images, lazy loading

### Maintenance
- Mettre à jour dépendances régulièrement
- Vérifier les logs pour erreurs
- Faire backups réguliers de la BDD

---

## 🔗 Ressources Utiles

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Flask Deployment](https://flask.palletsprojects.com/en/latest/deploying/)
- [Gunicorn Config](https://docs.gunicorn.org/en/stable/)

---

**Généré**: 2 décembre 2025 | Version: 1.0
