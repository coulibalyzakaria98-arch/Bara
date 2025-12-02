# ✅ Checklist de Déploiement Rapide - BaraCorrespondance

## 📋 Avant de Déployer (Localement)

- [ ] **Frontend build OK**
  ```bash
  cd frontend && npm run build
  # Vérifier: dist/ créé sans erreurs
  ```

- [ ] **Backend prêt**
  ```bash
  cd backend && python -m pip check
  # Vérifier: Gunicorn installé (requirements.txt)
  ```

- [ ] **Base de données**
  - [ ] PostgreSQL localement opérationnel (dev)
  - [ ] Migrations appliquées: `flask db upgrade`

- [ ] **Fichiers de config créés**
  - [ ] `frontend/vercel.json` ✓
  - [ ] `backend/Procfile` ✓
  - [ ] `.env.production.example` (backend) ✓
  - [ ] `.env.local.example` (frontend) ✓

---

## 🚀 Frontend sur Vercel (10 minutes)

1. **Créer compte Vercel**
   - [ ] Aller à vercel.com
   - [ ] Sign up avec GitHub
   - [ ] Autoriser l'accès au repo `coulibalyzakaria98-arch/Bara`

2. **Créer projet**
   - [ ] New Project → Import Git Repo
   - [ ] Sélectionner `Bara`
   - [ ] Framework: React (auto-détecté)
   - [ ] Root Directory: `frontend/`

3. **Configurer build**
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`

4. **Ajouter variables d'environnement**
   - [ ] `VITE_API_BASE_URL` = `[à remplir après backend déployé]`
   - [ ] Ex: `https://bara-backend-prod.railway.app/api`

5. **Déployer**
   - [ ] Cliquer "Deploy"
   - [ ] Attendre build (~2-3 min)
   - [ ] Récupérer URL: `https://bara-[xxxx].vercel.app`

6. **Test**
   - [ ] Accéder à l'URL Vercel
   - [ ] Vérifier pas d'erreurs console (F12)

---

## 🔧 Backend sur Railway (15 minutes)

1. **Créer compte Railway**
   - [ ] Aller à railway.app
   - [ ] Sign up avec GitHub
   - [ ] Autoriser l'accès

2. **Créer projet**
   - [ ] New Project → Deploy from GitHub Repo
   - [ ] Sélectionner `Bara`
   - [ ] Sélectionner branche: `main`

3. **Ajouter PostgreSQL**
   - [ ] Dans le projet Railway, Add Service → PostgreSQL
   - [ ] Railway génère `DATABASE_URL` automatiquement

4. **Configurer variables d'environnement**
   - [ ] Aller à Project → Variables
   - [ ] Ajouter (dans Railway):
     ```
     SECRET_KEY = [générer avec: python -c "import secrets; print(secrets.token_urlsafe(32))"]
     JWT_SECRET_KEY = [générer avec: python -c "import secrets; print(secrets.token_urlsafe(32))"]
     FLASK_ENV = production
     FLASK_DEBUG = 0
     PYTHONUNBUFFERED = 1
     CORS_ORIGINS = https://bara-[xxxx].vercel.app
     GEMINI_API_KEY = [votre clé Gemini]
     ```

5. **Configurer déploiement**
   - [ ] Project Settings
   - [ ] Build Command: (laisser vide)
   - [ ] Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - [ ] Root Directory: `backend/` (si monorepo)

6. **Déployer**
   - [ ] Cliquer "Deploy"
   - [ ] Attendre build (~3-5 min)
   - [ ] Récupérer URL: `https://bara-backend-prod-[xxxx].railway.app`

7. **Migrer base de données**
   - [ ] Dans Railway, Click "Run Command"
   - [ ] Entrer: `flask db upgrade`
   - [ ] Exécuter

8. **Test endpoint**
   ```bash
   curl https://bara-backend-prod-[xxxx].railway.app/api/health
   # Doit retourner: {"status": "ok"}
   ```

---

## 🔗 Connecter Frontend & Backend

1. **Mettre à jour Frontend**
   - [ ] Aller à Vercel Dashboard → Project Settings → Environment Variables
   - [ ] Modifier `VITE_API_BASE_URL` = `https://bara-backend-prod-[xxxx].railway.app/api`
   - [ ] Redéployer (Deployments tab → Redeploy Latest)

2. **Mettre à jour Backend CORS**
   - [ ] Aller à Railway Project → Variables
   - [ ] Modifier `CORS_ORIGINS` = `https://bara-[xxxx].vercel.app`
   - [ ] Redéployer (Dashboard)

---

## ✅ Test End-to-End

1. **Login**
   - [ ] Accéder au frontend Vercel
   - [ ] Cliquer "S'inscrire"
   - [ ] Remplir formulaire candidat
   - [ ] Vérifier email dans backend logs (ou dashboard)

2. **Upload & Analyse CV**
   - [ ] Upload un fichier CV (PDF ou DOCX)
   - [ ] Vérifier analyse se lance
   - [ ] Vérifier résultats affichés

3. **Télécharger Rapport**
   - [ ] Cliquer "Télécharger le rapport"
   - [ ] Vérifier PDF télécharge depuis backend
   - [ ] Ouvrir PDF et vérifier contenu

4. **Voir Détails**
   - [ ] Cliquer "Voir les détails"
   - [ ] Vérifier modal s'ouvre avec breakdown scores

---

## 🆘 Si erreur

### 502 Bad Gateway (Backend)
```bash
railway logs -f
# Vérifier DATABASE_URL et variables env
```

### CORS Error (Frontend)
```
Access to XMLHttpRequest blocked by CORS policy
```
- Vérifier `CORS_ORIGINS` dans Railway inclut URL Vercel
- Redéployer backend

### Build Failed (Frontend)
```
Error: Cannot find module...
```
- Vérifier `npm install` localement
- Vérifier `package.json` en git
- Redéployer depuis Vercel Dashboard

---

## 📊 URLs après déploiement

```
Frontend:  https://bara-[xxxx].vercel.app
Backend:   https://bara-backend-prod-[xxxx].railway.app
API:       https://bara-backend-prod-[xxxx].railway.app/api
```

---

## 🔒 Sécurité

- [ ] HTTPS activé (auto par Vercel + Railway)
- [ ] Secrets stockés en variables (pas en dur)
- [ ] CORS configuré correctement
- [ ] JWT Secret Keys uniques et forts
- [ ] Database backups activés (Railway)

---

## 📱 Post-Déploiement

- [ ] Ajouter domaine custom (optionnel)
- [ ] Configurer monitoring (Sentry, DataDog)
- [ ] Configurer email (pour notifications)
- [ ] Documenter pour l'équipe

---

**Durée totale estimée: 30 minutes**
**Support: Voir DEPLOYMENT_GUIDE.md pour détails**

