# Analyse Détaillée du Frontend - BaraCorrespondance

## 📋 Vue d'Ensemble

**Stack technologique:**
- **Framework**: React 18.2.0 (avec Hooks)
- **Build tool**: Vite 5.0.8
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3.4.0 + CSS custom
- **State management**: Zustand 4.4.7 + React Context
- **HTTP client**: Axios 1.6.2 avec interceptors
- **Animations**: Framer Motion 10.16.16
- **UI Components**: lucide-react (icônes)
- **Forms**: react-hook-form 7.49.2
- **Notifications**: react-hot-toast 2.4.1
- **Dev**: Vite dev server sur port 5173 avec proxy `/api` → `http://localhost:5000`

---

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Composants réutilisables (Header, Footer, Modal, etc.)
│   │   ├── candidate/        # Pages/composants candidat
│   │   ├── company/          # Pages/composants entreprise
│   │   └── shared/           # Composants partagés
│   ├── pages/
│   │   └── HomePage.jsx      # Page d'accueil
│   ├── contexts/
│   │   └── AppContext.jsx    # Context global (user, auth, login/register/logout)
│   ├── services/
│   │   └── api.js            # Couche API (axios + interceptors)
│   ├── styles/
│   │   ├── index.css         # Styles globaux
│   │   └── theme.css         # Thème personnalisé
│   ├── config/               # Configuration
│   ├── constants.js          # Constantes
│   ├── animations.js         # Animations Framer Motion
│   ├── theme.js              # Tokens de thème
│   ├── App.jsx               # Routeur principal
│   └── main.jsx              # Point d'entrée
├── index.html                # Template HTML
├── vite.config.js            # Config Vite (dev server, proxy)
├── tailwind.config.js        # Config Tailwind (couleurs, extensions)
├── postcss.config.js         # PostCSS + Tailwind
├── package.json              # Dépendances
└── dist/                     # Build output (après npm run build)
```

---

## 🎨 Design & Styles

### Tailwind Configuration (`tailwind.config.js`)

**Palette de couleurs primaires (blue/white theme):**

- **primary**: Dégradé bleu moderne (50-900)
  - `primary-500`: `#0090ff` (couleur dominante)
  - `primary-600`: `#0070d8` (hover states)
  - `primary-700`: `#0055b8`, `primary-900`: `#002b5c`

- **secondary**: Bleu accentué (complément primaire)
  - `secondary-500`: `#0066ff`

- **accent**: Bleu ciel (tertiary)
  - `accent-500`: `#4fa3c2` (appels à l'action, highlights)

- **slate**: Palette de gris (fond, texte, borders)
  - `slate-50`: `#f9fafb` (très clair)
  - `slate-900`: `#111827` (très foncé)

### Animations personnalisées

- `pulse-slow`: pulse ralentie (3s)
- `float`: flottement avec transform (20s)
- `spin-slow`: rotation ralentie (3s)

### Fichiers CSS

- `src/styles/index.css`: Variables CSS root, resets, scrollbar styling
- `src/styles/theme.css`: Styles spécifiques (.modal, .button, etc.)

---

## 🔀 Routing (`src/App.jsx`)

**Structure des routes:**

```
/                          → HomePage (public)
/login                     → CandidateAuth ou CompanyAuth (selon state.userType)
/register                  → idem
/candidate/dashboard       → CandidateDashboard (protégé, user.role === 'candidate')
/candidate/profile         → CandidateProfile (protégé)
/company/dashboard         → CompanyDashboard (protégé, user.role === 'company')
/company/profile           → CompanyProfile (protégé)
/notifications             → Page notifications (placeholder)
/settings                  → Page settings (placeholder)
*                          → Fallback to HomePage
```

**Guard pattern:**
- Si l'utilisateur est connecté et tente d'accéder à `/login` ou `/register`, redirection automatique vers le dashboard.
- Les dashboards affichent uniquement si `user?.role` correspond.

---

## 🧠 State Management

### AppContext (`src/contexts/AppContext.jsx`)

**État global:**
- `user`: Utilisateur actuel (null ou objet `{id, email, role, full_name, avatar_url, ...}`)
- `isLoading`: Indicateur de chargement initial
- `registeredUsers`: Liste des utilisateurs inscrits (legacy)

**Fonctions:**
- `login(email, password)`: Appelle `authAPI.login()`, stocke tokens + user dans localStorage, affiche toast
- `register(userData)`: Appelle `authAPI.register()`, stocke tokens, crée session
- `logout()`: Efface localStorage, reset user
- `updateUser(userData)`: Met à jour l'utilisateur en mémoire et localStorage

**Persistance:**
- Au chargement, restaure le user depuis localStorage si les tokens sont présents
- Si user existe mais pas de token, nettoie la session invalide

---

## 📡 API Layer (`src/services/api.js`)

### Configuration axios

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});
```

### Interceptors

**Request:**
- Ajoute le JWT du localStorage en en-tête `Authorization: Bearer <token>`
- Gère `FormData` (ne pas set Content-Type pour laisser le navigateur gérer multipart)

**Response:**
- Sur erreur 401 (token expiré): essaie de rafraîchir le token avec `refreshToken`
- Si refresh réussit, réessaye la requête originale
- Si refresh échoue, efface les tokens et logs (pas de force redirect)

### Groupes d'API

1. **authAPI**: `register`, `login`, `logout`, `refreshToken`
2. **candidateAPI**: `getProfile()`, `updateProfile(data)`
3. **uploadAPI**: `uploadCV()`, `uploadAvatar()`, `uploadLogo()`
4. **analysisAPI**: 
   - `getAnalysis(cvId)`, `getRecommendations(cvId)`, `getExtractedData(cvId)`
   - `downloadPDF(analysisId)` — **Clé**: requête GET `/uploads/cv/report/pdf`, retourne blob PDF
5. **matchingAPI**: `getMatchedJobs()`, `getMatchedCandidates()`, `calculateMatchScore()`
6. **jobsAPI**: CRUD complet (`list`, `get`, `create`, `update`, `delete`, `toggleStatus`)
7. **notificationsAPI**: CRUD notifications
8. **companyAPI**: profil entreprise
9. **matchesAPI**, **messagesAPI**, **applicationsAPI**, **postersAPI**, **analyticsAPI**, **favoritesAPI**, **reviewsAPI**, **skillTestsAPI**: endpoints complets

---

## 🎯 Composants Principaux

### Common Components (`src/components/common/`)

| Composant | Rôle |
|-----------|------|
| **Header.jsx** | Barre de navigation top (logo, menu, user menu, logout) |
| **Footer.jsx** | Pied de page |
| **DashboardLayout.jsx** | Layout avec sidebar + header pour dashboards |
| **Modal** (ModalsAndNotifications.jsx) | Composant modal réutilisable |
| **Form.jsx** | Composant formulaire wrapper |
| **HeroSection.jsx** | Section hero pour landing page |
| **HowItWorks.jsx** | Section "Comment ça marche" |
| **FeaturedJobs.jsx** | Affichage des offres en vedette |
| **Testimonials.jsx** | Section témoignages |
| **AdvancedStats.jsx** | Statistiques avec graphiques |
| **StatisticsCard.jsx** | Carte de stat individuelle |
| **ListsAndStates.jsx** | Composants pour listes (empty state, loading, etc.) |
| **Loaders.jsx** | Loaders/spinners |
| **JobCard.jsx** | Carte d'offre d'emploi |
| **ReportTemplate.jsx** | **Nouveau**: Générateur de rapport HTML côté client |
| **OnboardingTour.jsx** | Tour guidé (opcional) |

### Candidate Components (`src/components/candidate/`)

| Composant | Rôle |
|-----------|------|
| **CandidateAuth.jsx** | Page login/register candidat |
| **CandidateDashboard.jsx** | Dashboard candidat (upload CV, analyse, résultats, téléchargement rapport) |
| **CandidateProfile.jsx** | Édition profil candidat (avatar, infos perso) |
| **CandidateAnalytics.jsx** | Statistiques candidat |
| **JobMatches.jsx** | Affichage des jobs matchés |
| **AdvancedJobSearch.jsx** | Recherche avancée d'offres |
| **CandidateFavorites.jsx** | Jobs favoris |
| **MyApplications.jsx** | Mes candidatures |
| **JobBrowser.jsx** | Explorateur d'offres |

### Company Components (`src/components/company/`)

| Composant | Rôle |
|-----------|------|
| **CompanyAuth.jsx** | Page login/register entreprise |
| **CompanyDashboard.jsx** | Dashboard entreprise (gestion offres, candidatures, analytics) |
| **CompanyProfile.jsx** | Édition profil entreprise |

---

## 📊 Flux d'Utilisation Principal (Candidate)

### 1. Inscription/Connexion
```
1. User accède "/" (HomePage)
2. Clique "S'inscrire candidat" → state.userType = 'candidate' + nav('/register')
3. CandidateAuth affiche formulaire
4. Submit → AppContext.register(userData)
5. Success → localStorage tokens + user, redirect auto vers /candidate/dashboard
```

### 2. Upload & Analyse CV
```
1. CandidateDashboard.jsx → UploadZone (Drag & drop ou file picker)
2. Upload file → uploadAPI.uploadCV(file, autoAnalyze=true)
3. Backend traite, retourne CVAnalysis avec scores + extracted_data
4. UI affiche results (score, breakdown, skills, experience, etc.)
5. Affiche bouton "Télécharger le rapport"
```

### 3. Téléchargement Rapport
```
1. User clique "Télécharger"
2. analysisAPI.downloadPDF(analysisId)
   → GET /uploads/cv/report/pdf?analysis_id=123 (backend route NEW)
   → Backend génère PDF avec ReportLab, retourne blob
   → Frontend crée blob URL, trigger download (rapport_cv_2025-12-02.pdf)
3. Si backend indisponible (error catch)
   → Fallback: ReportTemplate.jsx.openReportWindow(analysisResult)
   → Génère HTML imprimable, ouvre dans nouvelle fenêtre
   → User peut print → Save as PDF (browser native)
```

### 4. Voir Détails Analyse
```
1. Click "Voir les détails" → ouvre Modal
2. Modal affiche (via renderContent):
   - Score global + grade
   - Breakdown scores table
   - Compétences extraites (technical, soft, languages)
   - Expériences avec descriptions
   - Formations
   - Recommendations prioritaires
3. Close modal → revient au dashboard
```

---

## 🔐 Authentication Flow

1. **Token storage**: localStorage (`accessToken`, `refreshToken`, `user`)
2. **JWT in headers**: `Authorization: Bearer <accessToken>`
3. **Token refresh**: Interceptor détecte 401 → appelle `/auth/refresh` avec `refreshToken` → met à jour localStorage + retry
4. **Logout**: `logout()` efface localStorage et reset user

---

## 🎨 Key Features Implemented

✅ **Candidate Dashboard:**
- Upload CV (drag & drop ou file picker)
- Auto-analyse avec IA (score, extraction données, recommendations)
- Affichage des résultats avec breakdown
- Modal détails analyse
- Téléchargement rapport PDF (backend + fallback client)
- Visualisation des matches (jobsAPI.getMatchedJobs)
- Profil candidat éditable (avatar, infos)

✅ **Company Dashboard:**
- Gestion des offres (CRUD)
- Visualisation candidats matchés
- Notifications
- Analytics

✅ **Design System:**
- Palette couleurs bleu/blanc cohérente (Tailwind)
- Animations fluides (Framer Motion)
- Responsive (mobile → desktop)
- Dark mode ready (tokens CSS custom)

✅ **API Integration:**
- Axios wrapper avec interceptors
- Gestion erreurs + retry 401
- Toast notifications
- FormData pour uploads

---

## ⚠️ Points à Considérer

1. **Placeholder routes**: `/notifications` et `/settings` sont des placeholders (à implémenter)
2. **Error handling**: Améliorable (logs console OK, mais UX timeout/retry manquante)
3. **Performance**: Lazy loading des routes recommandé (React.lazy)
4. **Tests**: Pas de tests unitaires/integration actuellement
5. **Mobile**: Responsive mais non entièrement testé
6. **Accessibility**: A11y improvements possibles (ARIA labels, focus management)
7. **Analytics**: Page `/analytics/...` prête mais non intégrée au dashboard

---

## 📝 Fichiers de Documentation Présents

- `COMPONENTS_GUIDE.md` — Guide des composants
- `DESIGN_SYSTEM.md` — Système de design
- `DESIGN_SYSTEM_README.md` — Doc design détaillée
- `INTEGRATION_EXAMPLES.jsx` — Exemples d'intégration
- `FILE_MANIFEST.md` — Inventaire des fichiers
- `START_HERE.md`, `QUICK_START.md` — Guides de démarrage

---

## 🚀 Commandes de Développement

```bash
# Install deps
npm install

# Dev server (Vite, http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🔗 Intégrations Backend

| Frontend | Backend |
|----------|---------|
| `CandidateDashboard.jsx` upload | POST `/uploads/cv` |
| Analysis results fetch | GET `/analysis/cv/{id}` |
| PDF download | GET `/uploads/cv/report/pdf` ← **NEW** |
| Job matching | GET `/matching/jobs` |
| User profile | GET/PUT `/candidates/profile` |
| Avatar upload | POST `/uploads/avatar` |
| Auth (login/register) | POST `/auth/login`, `/auth/register` |

---

## 📌 Prochaines Améliorations Recommandées

1. **Finalize `/notifications` & `/settings` pages** — Actuellement placeholders
2. **Add error boundaries** — Composants React ErrorBoundary pour robustesse
3. **Implement lazy loading** — `React.lazy()` + `Suspense` pour optimiser chunk size
4. **Add unit tests** — Jest + React Testing Library pour composants clés
5. **Improve accessibility** — ARIA labels, focus traps in modals, keyboard navigation
6. **Add dark mode toggle** — Implémentation CSS variables pour theme switching
7. **Optimize images** — Compression, lazy loading pour avatars/logos
8. **Progressive Web App (PWA)** — Service workers pour offline support
9. **Enhance error handling** — Retry logic, connection status indicator
10. **Analytics integration** — Mixpanel, Sentry, ou autre pour monitoring

---

**Généré**: 2 décembre 2025 par assistant IA | Format: Markdown
