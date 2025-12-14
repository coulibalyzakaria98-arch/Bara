# ⚡ Démarrage Rapide - Déploiement Render.com

Guide ultra-rapide pour déployer BaraCorrespondance AI sur Render en **15 minutes**.

Pour le guide complet et détaillé, consultez [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md).

---

## 📋 Prérequis (5 min)

1. ✅ **Compte Render.com** (gratuit) : https://render.com
2. ✅ **Repository GitHub** connecté
3. ✅ **Clé Gemini API** (gratuite) : https://makersuite.google.com/app/apikey
4. ✅ **Clés secrètes générées** :
   ```powershell
   .\generate_secrets.ps1
   ```

---

## 🚀 Étape 1 : Backend (5 min)

### 1.1 Créer Web Service

1. Dashboard Render → **New +** → **Web Service**
2. Connecter repo `Bara` → branch `main`
3. Configuration:
   ```
   Name: bara-backend
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install --upgrade pip && pip install -r requirements.txt
   Start Command: gunicorn -w 4 -b 0.0.0.0:$PORT main:app --timeout 120
   Plan: Free
   ```

### 1.2 Variables d'Environnement

Onglet **Environment**, ajouter:

```bash
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=<copier-depuis-generate_secrets.ps1>
JWT_SECRET_KEY=<copier-depuis-generate_secrets.ps1>
GEMINI_API_KEY=<votre-clé-gemini>
CORS_ORIGINS=https://bara-frontend.onrender.com
PYTHONUNBUFFERED=1
```

### 1.3 Ajouter Disque (Upload)

Onglet **Disks** → **Add Disk**:
```
Name: bara-uploads
Mount Path: /opt/render/project/src/app/static/uploads
Size: 1 GB
```

### 1.4 Déployer

**Create Web Service** → Attendre 3-5 min

📝 **Noter l'URL backend** : `https://bara-backend-xxxx.onrender.com`

---

## 🗄️ Étape 2 : Database (2 min)

### 2.1 Créer PostgreSQL

1. Dashboard → **New +** → **PostgreSQL**
2. Configuration:
   ```
   Name: bara-postgres
   Database: baracorrespondance
   Region: Frankfurt
   Plan: Free
   ```

### 2.2 Connecter au Backend

1. Aller dans **bara-backend** → **Environment**
2. Ajouter variable:
   ```
   DATABASE_URL
   ```
   Valeur = copier **Internal Database URL** depuis bara-postgres

Ou utiliser : **Add from Service** → Sélectionner `bara-postgres`

### 2.3 Migrer le Schéma

Backend → **Shell** → Lancer shell:
```bash
cd backend
flask db upgrade
```

---

## ⚛️ Étape 3 : Frontend (3 min)

### 3.1 Créer Static Site

1. Dashboard → **New +** → **Static Site**
2. Connecter repo `Bara` → branch `main`
3. Configuration:
   ```
   Name: bara-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: frontend/dist
   ```

### 3.2 Variables d'Environnement

Onglet **Environment**, ajouter:

```bash
VITE_API_BASE_URL=https://bara-backend-xxxx.onrender.com/api
NODE_VERSION=18.18.0
```

⚠️ **Remplacer** `bara-backend-xxxx` par l'URL réelle de votre backend

### 3.3 Déployer

**Create Static Site** → Attendre 2-3 min

📝 **Noter l'URL frontend** : `https://bara-frontend-xxxx.onrender.com`

---

## 🔗 Étape 4 : Connexion (2 min)

### 4.1 Mettre à jour CORS Backend

Backend → **Environment** → Modifier `CORS_ORIGINS`:
```
CORS_ORIGINS=https://bara-frontend-xxxx.onrender.com
```
(Remplacer par l'URL réelle du frontend)

Sauvegarder → Redéploiement auto

### 4.2 Tester

1. Ouvrir `https://bara-frontend-xxxx.onrender.com`
2. Créer un compte
3. Uploader un CV
4. Vérifier l'analyse IA

---

## ✅ Checklist Rapide

### Backend
- [ ] Web Service créé
- [ ] Variables d'env configurées (SECRET_KEY, JWT_SECRET_KEY, GEMINI_API_KEY, CORS_ORIGINS)
- [ ] Disque uploads ajouté
- [ ] PostgreSQL connecté (DATABASE_URL)
- [ ] Migration BDD exécutée (`flask db upgrade`)
- [ ] Health check OK : `curl https://bara-backend-xxxx.onrender.com/api/health`

### Frontend
- [ ] Static Site créé
- [ ] VITE_API_BASE_URL configuré
- [ ] Fichier `_redirects` créé (déjà fait ✅)
- [ ] Page accessible sans erreurs

### Integration
- [ ] CORS configuré avec URL frontend
- [ ] Login fonctionne
- [ ] Upload CV fonctionne
- [ ] Analyse IA fonctionne

---

## 🆘 Problèmes Courants

### ❌ Build Backend Échoue
→ Vérifier Root Directory = `backend`
→ Vérifier requirements.txt existe

### ❌ Backend 502 Error
→ Vérifier DATABASE_URL est définie
→ Vérifier Start Command = `gunicorn -w 4 -b 0.0.0.0:$PORT main:app --timeout 120`

### ❌ Frontend Page Blanche
→ Ouvrir Console (F12) pour voir l'erreur
→ Vérifier VITE_API_BASE_URL est correcte
→ Vérifier CORS_ORIGINS sur le backend

### ❌ CORS Error
→ Backend CORS_ORIGINS doit contenir l'URL frontend exacte
→ Redéployer le backend après modification

### ❌ Migration BDD Failed
→ Backend Shell → `flask db stamp head` puis `flask db upgrade`

---

## 🎯 URLs à Sauvegarder

```
Frontend : https://bara-frontend-xxxx.onrender.com
Backend  : https://bara-backend-xxxx.onrender.com
Database : <internal-url>
```

---

## 📚 Aller Plus Loin

- **Guide Complet** : [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)
- **Configuration Email** : Voir DEPLOYMENT_RENDER.md section Email
- **Vidéo Daily.co** : Voir DEPLOYMENT_RENDER.md section Video
- **Push Notifications** : Générer clés VAPID et configurer
- **Domaine Custom** : Settings → Custom Domains

---

## 🔐 Variables Optionnelles

Ajouter dans Backend Environment si nécessaire:

```bash
# Email (Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=<app-password-gmail>

# Vidéo (Daily.co)
DAILY_API_KEY=<votre-clé>

# Push Notifications
VAPID_PUBLIC_KEY=<générer>
VAPID_PRIVATE_KEY=<générer>
VAPID_SUBJECT=mailto:admin@baracorrespondance.com
```

---

**🎉 Félicitations ! Votre app est en ligne !**

**Support** : Consultez DEPLOYMENT_RENDER.md pour troubleshooting détaillé
