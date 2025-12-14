# 🚀 Guide de Déploiement Render.com - BaraCorrespondance AI

Guide complet pour déployer **BaraCorrespondance AI** sur **Render.com** (Backend + Frontend + Base de données).

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Vue d'ensemble](#vue-densemble)
3. [Déploiement Backend (API Flask)](#déploiement-backend)
4. [Déploiement Frontend (React)](#déploiement-frontend)
5. [Configuration Base de Données](#configuration-base-de-données)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Post-Déploiement](#post-déploiement)
8. [Troubleshooting](#troubleshooting)
9. [Optimisations & Bonnes Pratiques](#optimisations)

---

## 🔧 Prérequis

- ✅ Compte GitHub avec le repository BaraCorrespondance
- ✅ Compte Render.com (gratuit : https://render.com)
- ✅ Clé API Google Gemini (gratuite : https://makersuite.google.com/app/apikey)
- ⚙️ Compte Gmail pour l'envoi d'emails (optionnel)
- ⚙️ Compte Daily.co pour vidéo-conférence (optionnel)

---

## 🌐 Vue d'Ensemble

**Architecture sur Render:**

```
┌─────────────────────────────────────────┐
│  Frontend (Static Site)                 │
│  React + Vite                            │
│  https://bara-frontend.onrender.com     │
└───────────────┬─────────────────────────┘
                │ API Calls
                ↓
┌─────────────────────────────────────────┐
│  Backend (Web Service)                  │
│  Flask + Gunicorn + WebSocket           │
│  https://bara-backend.onrender.com      │
└───────────────┬─────────────────────────┘
                │ SQL Queries
                ↓
┌─────────────────────────────────────────┐
│  PostgreSQL (Database)                  │
│  Managed by Render                      │
└─────────────────────────────────────────┘
```

**Coûts:**
- Plan **FREE** : 0$/mois (avec limitations : sleep après 15 min d'inactivité, 750h/mois)
- Plan **Starter** : 7$/mois par service (recommandé pour production)

---

## 🐍 Déploiement Backend

### Étape 1 : Créer le Web Service Backend

1. **Connecter à Render:**
   - Aller sur https://dashboard.render.com
   - Cliquer **"New +"** → **"Web Service"**
   - Sélectionner **"Build and deploy from a Git repository"**
   - Connecter votre compte GitHub

2. **Sélectionner le Repository:**
   - Autoriser l'accès au repo `Bara`
   - Cliquer sur **"Connect"** à côté du repository

3. **Configuration du Service:**

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `bara-backend` (ou votre choix) |
   | **Region** | `Frankfurt (Europe)` ou `Oregon (US)` |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` (auto-détecté) |
   | **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
   | **Start Command** | `gunicorn -w 4 -b 0.0.0.0:$PORT main:app --timeout 120` |
   | **Plan** | **Free** (ou Starter pour production) |

4. **Cliquer sur "Advanced"** et configurer:
   - **Auto-Deploy**: `Yes` (déploiement auto sur push vers `main`)
   - **Health Check Path**: `/api/health` (créer cet endpoint si absent)

### Étape 2 : Ajouter les Variables d'Environnement

Dans la section **"Environment"** du service backend, ajouter ces variables:

#### Variables Essentielles:

```bash
# Flask
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=<générer-avec-commande-ci-dessous>
PYTHONUNBUFFERED=1

# JWT
JWT_SECRET_KEY=<générer-avec-commande-ci-dessous>

# Base de données (sera auto-complété si vous connectez PostgreSQL)
DATABASE_URL=<sera-fourni-par-render>

# IA - Analyse CV
GEMINI_API_KEY=<votre-cle-gemini>

# CORS (mettre l'URL du frontend une fois déployé)
CORS_ORIGINS=https://bara-frontend.onrender.com

# Uploads
UPLOAD_FOLDER=/opt/render/project/src/app/static/uploads
MAX_CONTENT_LENGTH=10485760
```

#### Générer les clés sécurisées:

Sur votre machine locale (PowerShell):
```powershell
# SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Variables Optionnelles (Email, Vidéo, Push):

```bash
# Email (Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<votre-email@gmail.com>
MAIL_PASSWORD=<app-password-gmail>
MAIL_DEFAULT_SENDER=noreply@baracorrespondance.com

# Daily.co (Vidéo-conférence)
DAILY_API_KEY=<votre-daily-api-key>
DAILY_WEBHOOK_SECRET=<votre-daily-webhook-secret>

# Web Push Notifications (générer avec generate_vapid_keys.py)
VAPID_PUBLIC_KEY=<votre-vapid-public-key>
VAPID_PRIVATE_KEY=<votre-vapid-private-key>
VAPID_SUBJECT=mailto:admin@baracorrespondance.com
```

### Étape 3 : Ajouter un Disque Persistant (Pour uploads)

1. Dans le service backend, aller à **"Disks"**
2. Cliquer **"Add Disk"**
3. Configurer:
   - **Name**: `bara-uploads`
   - **Mount Path**: `/opt/render/project/src/app/static/uploads`
   - **Size**: `1 GB` (gratuit)
4. Sauvegarder

### Étape 4 : Déployer

1. Cliquer **"Create Web Service"**
2. Render va:
   - Cloner le repo
   - Installer les dépendances (`pip install -r requirements.txt`)
   - Démarrer le serveur Gunicorn
   - Générer une URL publique (ex: `https://bara-backend.onrender.com`)

3. **Attendre le déploiement** (2-5 minutes)
4. **Vérifier les logs** pour s'assurer qu'il n'y a pas d'erreurs

---

## ⚛️ Déploiement Frontend

### Étape 1 : Créer le Static Site Frontend

1. Dans Render Dashboard, cliquer **"New +"** → **"Static Site"**
2. Connecter au même repository `Bara`

3. **Configuration du Site:**

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `bara-frontend` |
   | **Region** | `Frankfurt (Europe)` |
   | **Branch** | `main` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `frontend/dist` |

### Étape 2 : Variables d'Environnement Frontend

Dans la section **"Environment"**:

```bash
# URL du backend (mettre l'URL générée par Render pour le backend)
VITE_API_BASE_URL=https://bara-backend.onrender.com/api

# Node version
NODE_VERSION=18.18.0
```

⚠️ **Important:** Remplacer `bara-backend.onrender.com` par l'URL réelle de votre backend Render.

### Étape 3 : Configurer les Redirects (React Router)

1. Créer le fichier `frontend/public/_redirects`:

```bash
/*  /index.html  200
```

Cela permet à React Router de gérer les routes frontend.

Si le fichier existe déjà, vérifier qu'il contient bien cette ligne.

### Étape 4 : Déployer

1. Cliquer **"Create Static Site"**
2. Render va:
   - Installer les dépendances npm
   - Exécuter `npm run build`
   - Publier les fichiers statiques
   - Générer une URL (ex: `https://bara-frontend.onrender.com`)

---

## 🗄️ Configuration Base de Données

### Étape 1 : Créer la Base PostgreSQL

1. Dans Render Dashboard, cliquer **"New +"** → **"PostgreSQL"**
2. Configurer:
   - **Name**: `bara-postgres`
   - **Database**: `baracorrespondance`
   - **User**: `bara_user` (auto-généré)
   - **Region**: `Frankfurt` (même que le backend)
   - **Plan**: **Free** (ou Starter)

3. Cliquer **"Create Database"**

### Étape 2 : Connecter la BDD au Backend

1. Aller dans le service **Backend** → **"Environment"**
2. Ajouter la variable:
   ```
   DATABASE_URL
   ```
   - Copier l'**Internal Database URL** depuis la page PostgreSQL
   - Format: `postgresql://user:password@host:5432/dbname`

Ou utiliser la fonctionnalité **"Connect"** dans Render:
- Dans le backend, section Environment
- Cliquer "Add from Service"
- Sélectionner `bara-postgres`
- Render ajoute automatiquement `DATABASE_URL`

### Étape 3 : Migrer le Schéma de Base de Données

Après le déploiement backend réussi:

1. **Ouvrir le Shell Render:**
   - Aller dans le service Backend
   - Onglet **"Shell"**
   - Cliquer **"Launch Shell"**

2. **Exécuter les migrations:**
   ```bash
   cd backend
   flask db upgrade
   ```

   Si l'erreur `flask: command not found`, essayer:
   ```bash
   python -m flask db upgrade
   ```

3. **Initialiser des données de test (optionnel):**
   ```bash
   python main.py seed-db
   ```

4. **Vérifier la connexion:**
   ```bash
   python
   >>> from app import create_app, db
   >>> app = create_app()
   >>> with app.app_context():
   ...     db.engine.execute("SELECT 1")
   >>> exit()
   ```

---

## 🔗 Connecter Frontend ↔ Backend

### 1. Mettre à jour CORS sur le Backend

1. Récupérer l'URL du frontend (ex: `https://bara-frontend.onrender.com`)
2. Dans Backend → Environment, modifier `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://bara-frontend.onrender.com
   ```
3. Redéployer le backend (ou attendre auto-deploy)

### 2. Mettre à jour l'API URL sur le Frontend

1. Récupérer l'URL du backend (ex: `https://bara-backend.onrender.com`)
2. Dans Frontend → Environment, modifier `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://bara-backend.onrender.com/api
   ```
3. Redéployer le frontend

### 3. Tester l'Integration

```bash
# Tester le backend health check
curl https://bara-backend.onrender.com/api/health

# Tester depuis le frontend
# Ouvrir https://bara-frontend.onrender.com
# Essayer de vous connecter ou créer un compte
```

---

## 🔐 Variables d'Environnement - Checklist Complète

### Backend (Web Service)

<details>
<summary>Cliquer pour voir la liste complète</summary>

```bash
# ===== FLASK =====
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=<générer>
PYTHONUNBUFFERED=1

# ===== DATABASE =====
DATABASE_URL=<depuis-postgresql-service>

# ===== JWT =====
JWT_SECRET_KEY=<générer>

# ===== IA =====
GEMINI_API_KEY=<votre-clé>

# ===== CORS =====
CORS_ORIGINS=https://bara-frontend.onrender.com

# ===== UPLOADS =====
UPLOAD_FOLDER=/opt/render/project/src/app/static/uploads
MAX_CONTENT_LENGTH=10485760

# ===== EMAIL (Optionnel) =====
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<votre-email>
MAIL_PASSWORD=<app-password>
MAIL_DEFAULT_SENDER=noreply@baracorrespondance.com

# ===== VIDEO (Optionnel) =====
DAILY_API_KEY=<votre-clé>
DAILY_WEBHOOK_SECRET=<votre-secret>

# ===== PUSH NOTIFICATIONS (Optionnel) =====
VAPID_PUBLIC_KEY=<générer>
VAPID_PRIVATE_KEY=<générer>
VAPID_SUBJECT=mailto:admin@baracorrespondance.com
```

</details>

### Frontend (Static Site)

```bash
VITE_API_BASE_URL=https://bara-backend.onrender.com/api
NODE_VERSION=18.18.0
```

---

## ✅ Post-Déploiement

### 1. Vérifier le Déploiement

**Backend:**
```bash
# Health check
curl https://bara-backend.onrender.com/api/health

# Test login (créer un user d'abord)
curl -X POST https://bara-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

**Frontend:**
- Ouvrir `https://bara-frontend.onrender.com`
- Vérifier que la page charge sans erreurs 404/CORS
- Tester le login/register
- Tester l'upload de CV et l'analyse

### 2. Configurer le Monitoring

**Logs:**
- Backend: Dashboard → `bara-backend` → Logs
- Frontend: Dashboard → `bara-frontend` → Logs
- Database: Dashboard → `bara-postgres` → Logs

**Alertes:**
- Render Dashboard → Service → Settings → Notifications
- Configurer email/Slack pour alertes de crash

### 3. Configurer un Domaine Custom (Optionnel)

**Pour le Frontend:**
1. Aller dans `bara-frontend` → **Settings** → **Custom Domains**
2. Ajouter votre domaine (ex: `baracorrespondance.com`)
3. Configurer les DNS chez votre registrar:
   ```
   Type: CNAME
   Name: @  ou  www
   Value: bara-frontend.onrender.com
   ```
4. Attendre la propagation DNS (1-48h)
5. Render génère automatiquement un certificat SSL

**Pour le Backend:**
1. Aller dans `bara-backend` → **Settings** → **Custom Domains**
2. Ajouter un sous-domaine (ex: `api.baracorrespondance.com`)
3. Configurer DNS:
   ```
   Type: CNAME
   Name: api
   Value: bara-backend.onrender.com
   ```

**Mettre à jour CORS et API URL après:**
- Backend `CORS_ORIGINS=https://baracorrespondance.com`
- Frontend `VITE_API_BASE_URL=https://api.baracorrespondance.com/api`

### 4. Optimiser les Performances

**Backend:**
- **Workers Gunicorn**: Ajuster `-w 4` en fonction des ressources
  - Free plan: `-w 2` (512 MB RAM)
  - Starter: `-w 4` (2 GB RAM)

**Frontend:**
- Activer la compression dans `frontend/vite.config.js`:
  ```javascript
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true }
    }
  }
  ```

**Database:**
- Activer les **Connection Pooling** dans PostgreSQL settings
- Créer des index sur les colonnes fréquemment requêtées

---

## 🚨 Troubleshooting

### ❌ Problème: Build Backend Échoue

**Erreur:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
1. Vérifier que `requirements.txt` existe dans `backend/`
2. Vérifier que le **Root Directory** est `backend`
3. Vérifier que le **Build Command** est:
   ```
   pip install --upgrade pip && pip install -r requirements.txt
   ```

### ❌ Problème: Backend 502 Bad Gateway

**Erreur:** Le service ne démarre pas

**Solution:**
1. Vérifier les **Logs** du backend
2. Erreurs communes:
   - **Port binding**: Gunicorn doit utiliser `0.0.0.0:$PORT` (pas 5000)
   - **Database connection**: Vérifier `DATABASE_URL` est correcte
   - **Missing env vars**: Vérifier que toutes les variables essentielles sont définies

3. Tester localement:
   ```bash
   cd backend
   pip install -r requirements.txt
   export DATABASE_URL="sqlite:///test.db"
   export SECRET_KEY="test"
   export JWT_SECRET_KEY="test"
   gunicorn -w 2 -b 0.0.0.0:5000 main:app
   ```

### ❌ Problème: Frontend - Page Blanche

**Erreur:** La page charge mais est vide

**Solution:**
1. Ouvrir la console navigateur (F12) → **Console**
2. Erreurs communes:
   - **CORS error**: Vérifier backend `CORS_ORIGINS` inclut l'URL frontend
   - **API calls fail**: Vérifier `VITE_API_BASE_URL` est correcte
   - **404 on routes**: Vérifier que `_redirects` existe dans `public/`

3. Vérifier que `VITE_API_BASE_URL` contient `/api` à la fin:
   ```
   ✅ https://bara-backend.onrender.com/api
   ❌ https://bara-backend.onrender.com
   ```

### ❌ Problème: Database Migration Failed

**Erreur:** `flask db upgrade` échoue

**Solution:**
1. Vérifier que `DATABASE_URL` est correcte
2. Tester la connexion:
   ```bash
   python
   >>> import psycopg2
   >>> conn = psycopg2.connect("<DATABASE_URL>")
   >>> conn.close()
   ```

3. Forcer une migration:
   ```bash
   flask db stamp head  # Marquer comme à jour
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

### ❌ Problème: Service Sleep (Plan Free)

**Comportement:** Le backend s'endort après 15 min d'inactivité (cold start ~30s)

**Solutions:**
1. **Upgrade to Starter Plan** ($7/mois) - Recommandé pour production
2. **Keep-Alive Service** (gratuit mais contre TOS):
   - Utiliser un service externe pour ping toutes les 10 min
   - Ex: UptimeRobot, cron-job.org
   - ⚠️ Render peut suspendre votre compte si détecté

3. **Avertir les utilisateurs** du cold start avec un message:
   ```javascript
   // Dans le frontend
   if (error.response?.status === 503) {
     toast("Le serveur se réveille, veuillez patienter 30s...")
   }
   ```

---

## 🚀 Optimisations & Bonnes Pratiques

### 1. Sécurité

- [ ] Utiliser des clés **générées aléatoirement** pour `SECRET_KEY` et `JWT_SECRET_KEY`
- [ ] **Ne JAMAIS** committer le fichier `.env`
- [ ] Activer **HTTPS only** (automatique sur Render)
- [ ] Configurer **rate limiting** dans Flask:
  ```python
  from flask_limiter import Limiter
  limiter = Limiter(app, default_limits=["200 per day", "50 per hour"])
  ```
- [ ] Valider tous les inputs utilisateur (marshmallow, email-validator)

### 2. Performance

- [ ] Activer la **compression Gzip** dans Gunicorn:
  ```bash
  gunicorn --workers 4 --bind 0.0.0.0:$PORT --timeout 120 --worker-class gthread main:app
  ```
- [ ] Optimiser les requêtes SQL (eager loading, indexes)
- [ ] Utiliser un **CDN** pour les assets statiques (ex: Cloudflare)
- [ ] Mettre en cache les résultats d'analyse CV (Redis si possible)

### 3. Monitoring

- [ ] Configurer **Sentry** pour error tracking:
  ```python
  import sentry_sdk
  sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"))
  ```
- [ ] Ajouter **Google Analytics** au frontend
- [ ] Configurer les **Render Alerts** (email/Slack)

### 4. Backup

- [ ] Configurer les **backups automatiques** PostgreSQL:
  - Render Starter plan: backups quotidiens automatiques
  - Free plan: backup manuel via pg_dump

  ```bash
  # Backup manuel
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

  # Restore
  psql $DATABASE_URL < backup_20251215.sql
  ```

### 5. CI/CD

- [ ] Configurer **GitHub Actions** pour tests automatiques
- [ ] Activer **Preview Environments** sur Render (plan payant)
- [ ] Créer une branche `staging` pour tester avant prod

---

## 📊 Limites Plan FREE vs Starter

| Fonctionnalité | Free | Starter ($7/mois) |
|----------------|------|-------------------|
| Instances | 1 | 1 |
| RAM | 512 MB | 2 GB |
| Sleep après inactivité | 15 min | ❌ Jamais |
| Bande passante | 100 GB/mois | 100 GB/mois |
| Build Minutes | 500 min/mois | 500 min/mois |
| Disques persistants | ✅ 1 GB | ✅ Illimité |
| PostgreSQL retention | 90 jours | ∞ |
| Custom Domains | ✅ | ✅ |
| SSL/HTTPS | ✅ | ✅ |

**Recommandation:** Starter plan pour production, Free plan pour dev/staging.

---

## 🔗 Ressources Utiles

- **Render Docs**: https://render.com/docs
- **Flask Deployment**: https://flask.palletsprojects.com/deploying/
- **Gunicorn Config**: https://docs.gunicorn.org/en/stable/settings.html
- **PostgreSQL on Render**: https://render.com/docs/databases
- **Community Forum**: https://community.render.com

---

## 📞 Support

**Problèmes avec Render?**
- Community Forum: https://community.render.com
- Status Page: https://status.render.com
- Support: support@render.com (plan payant uniquement)

**Problèmes avec BaraCorrespondance?**
- Vérifier les logs backend/frontend
- Tester en local d'abord
- Vérifier que toutes les env vars sont définies

---

## ✅ Checklist Finale de Déploiement

### Backend
- [ ] Web Service créé avec Python runtime
- [ ] Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT main:app --timeout 120`
- [ ] Toutes les variables d'environnement configurées
- [ ] PostgreSQL connecté via `DATABASE_URL`
- [ ] Disque persistant ajouté pour uploads
- [ ] Migrations exécutées: `flask db upgrade`
- [ ] Health check fonctionne: `/api/health`

### Frontend
- [ ] Static Site créé
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] `VITE_API_BASE_URL` configuré avec URL backend
- [ ] Fichier `_redirects` créé pour React Router
- [ ] Page accessible et sans erreurs CORS

### Integration
- [ ] Backend `CORS_ORIGINS` contient l'URL frontend
- [ ] Frontend `VITE_API_BASE_URL` pointe vers le backend
- [ ] Test end-to-end: login → upload CV → analyse → résultats

### Optionnel
- [ ] Domaine custom configuré
- [ ] Email SMTP configuré et testé
- [ ] Daily.co configuré pour vidéo
- [ ] Web Push configuré (VAPID keys)
- [ ] Sentry configuré pour monitoring
- [ ] Backups BDD configurés

---

**🎉 Félicitations! Votre application est déployée sur Render.com!**

**URLs à sauvegarder:**
- Frontend: `https://bara-frontend.onrender.com`
- Backend: `https://bara-backend.onrender.com`
- Database: Internal URL (dans variables)

---

**Dernière mise à jour:** 15 décembre 2025
**Version:** 1.0
