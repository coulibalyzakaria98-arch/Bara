# 🚀 INSTALLATION RAPIDE - BaraCorrespondance Frontend

## ⚡ DÉMARRAGE EN 5 MINUTES

### 1. Télécharger et Extraire
```bash
# Téléchargez l'archive depuis le lien ci-dessous
# Puis extrayez-la :
tar -xzf baracorrespondance-frontend-complete.tar.gz
cd baracorrespondance-frontend-complete
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configuration (Optionnel)
```bash
# Copier le fichier .env
cp .env.example .env

# Variables par défaut (déjà configurées) :
# VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Lancer l'Application
```bash
npm run dev
```

✅ **Votre application est maintenant accessible sur http://localhost:5173**

## 🎯 COMPTES DE TEST

### Candidat
```
Email: candidat@example.com
Password: password123
```

### Entreprise
```
Email: entreprise@example.com
Password: password123
```

## 📦 CONTENU DU PROJET

### ✅ Fichiers Créés (13 fichiers)
- `package.json` - Dépendances et scripts
- `vite.config.js` - Configuration Vite
- `tailwind.config.js` - Configuration Tailwind
- `postcss.config.js` - Configuration PostCSS
- `.env.example` - Variables d'environnement
- `.gitignore` - Fichiers à ignorer
- `index.html` - HTML principal
- `src/main.jsx` - Point d'entrée React
- `src/App.jsx` - Composant principal amélioré
- `src/contexts/AppContext.jsx` - Context API global
- `src/styles/index.css` - Styles principaux
- `src/components/candidate/CandidateAuth.jsx` - Auth candidat
- `src/components/candidate/CandidateDashboard.jsx` - Dashboard candidat complet
- `src/components/company/CompanyAuth.jsx` - Auth entreprise
- `src/components/company/CompanyDashboard.jsx` - Dashboard entreprise

### 🎨 Fonctionnalités Implémentées
- ✅ Page d'accueil avec animations
- ✅ Authentification candidat/entreprise
- ✅ Dashboard candidat avec upload CV
- ✅ Analyse IA du CV (simulation)
- ✅ Dashboard entreprise de base
- ✅ Animations Framer Motion
- ✅ Notifications toast
- ✅ Design responsive

## 🛠️ COMMANDES DISPONIBLES

```bash
npm run dev      # Démarrer en dev (port 5173)
npm run build    # Build pour production
npm run preview  # Preview du build
npm run lint     # Vérifier le code
```

## 📚 TECHNOLOGIES

- **React 18** + **Vite 5**
- **Framer Motion** (animations)
- **TailwindCSS** (styling)
- **Lucide React** (icons)
- **React Hot Toast** (notifications)
- **React Router DOM** (routing)

## 🔧 PROCHAINES ÉTAPES

### À Faire Immédiatement
1. ✅ Tester l'authentification
2. ✅ Explorer le dashboard candidat
3. ✅ Tester l'upload de CV
4. ✅ Voir l'analyse IA

### À Développer Ensuite
- [ ] Connexion API backend réelle
- [ ] Composants de profil
- [ ] Système de matching
- [ ] Génération d'affiches
- [ ] Tests unitaires

## ❓ PROBLÈMES FRÉQUENTS

### Port déjà utilisé ?
```bash
# Modifier le port dans vite.config.js
server: { port: 3000 }
```

### Erreurs npm install ?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Node.js trop ancien ?
```bash
# Minimum requis: Node.js 16.x
node --version
```

## 📞 SUPPORT

- Email: dev@baracorrespondance.com
- Documentation: Voir README.md complet

---

**🎉 PROJET PRÊT À ÊTRE DÉVELOPPÉ !**

```
📁 baracorrespondance-frontend-complete/
├── 13 fichiers créés
├── Architecture moderne
├── Design professionnel
└── Prêt pour le développement
```

**BON DÉVELOPPEMENT ! 🚀**
