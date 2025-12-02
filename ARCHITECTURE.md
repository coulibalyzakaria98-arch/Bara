# Architecture & Schéma du projet BaraCorrespondance

Ce document décrit la structure du dépôt, l'architecture backend/frontend, le schéma principal de la base de données et les routes/API clés. Il vise à fournir une vue d'ensemble utile pour développement, tests et déploiement.

**Résumé**
- Projet fullstack : backend Flask (API), frontend React (Vite + Tailwind).
- Chemins principaux :
  - `backend/` : API Flask, modèles SQLAlchemy, services IA.
  - `frontend/baracorrespondance-frontend-complete/` : application React + Tailwind.

**Arborescence (extrait)**
- `backend/`
  - `run.py` - point d'entrée du serveur
  - `requirements.txt` - dépendances Python
  - `app/`
    - `__init__.py` - factory/app config
    - `config.py` - configuration (DB, JWT, CORS)
    - `models/` - modèles SQLAlchemy (User, Candidate, Company, CVAnalysis, Job, ...)
      - `user.py`, `candidate.py`, `company.py`, `cv_analysis.py`, `job.py`, `notification.py`, `...`
    - `routes/` - blueprints / endpoints (auth.py, candidates.py, companies.py, jobs.py, analysis.py, matching.py, uploads.py, cv_generator.py)
    - `services/` - logique métier (AI analyzers, matcher, pdf generator)
    - `utils/` - helpers et validateurs
    - `static/` - fichiers statiques / uploads
- `frontend/baracorrespondance-frontend-complete/`
  - `index.html`, `package.json`, `vite.config.js`, `tailwind.config.js`
  - `src/`
    - `App.jsx`, `main.jsx`
    - `components/` - composants réutilisables et pages
      - `common/` (Modals, Header, Layouts, ReportTemplate.jsx, etc.)
      - `candidate/` (CandidateDashboard.jsx, CandidateProfile.jsx, CandidateAuth.jsx, etc.)
      - `company/` (CompanyDashboard.jsx, CompanyProfile.jsx...)
    - `contexts/` (AppContext.jsx)
    - `services/api.js` - wrapper axios pour appeler le backend
    - `styles/` - `index.css`, `theme.css`, `modern-design.css`

**Principales dépendances**
- Backend: listées dans `backend/requirements.txt` (Flask, Flask-JWT-Extended, Flask-SQLAlchemy, spacy, reportlab, etc.).
- Frontend: `react`, `react-router-dom`, `axios`, `tailwindcss`, `vite`, `lucide-react`, etc. (voir `frontend/package.json`).

**Schéma de la base de données (tables clés)**

- `users` (modèle `User`)
  - `id` (PK), `email`, `password_hash`, `role` (candidate/company/admin), `first_name`, `last_name`, `phone`, `avatar_url`, `is_active`, `is_verified`, `created_at`, `updated_at`
  - Relation: one-to-one -> `candidates` ou `companies` via `candidate` / `company` backrefs

- `candidates` (modèle `Candidate`)
  - `id` (PK), `user_id` (FK users.id), `full_name`, `desired_position`, `experience_years`, `education_level`, `skills` (JSON/texte), `bio`, `location`, `cv_file`, `avatar_url`, ...
  - Relation: `user` (one-to-one), `cv_analyses` (one-to-many)

- `companies` (modèle `Company`)
  - `id`, `user_id`, `name`, `description`, `industry`, `location`, `logo_url`, ...

- `jobs` (modèle `Job`)
  - `id`, `company_id` (FK companies.id), `title`, `description`, `required_skills` (JSON), `location`, `contract_type`, `is_active`, `created_at`, ...

- `cv_analyses` (modèle `CVAnalysis`)
  - `id`, `candidate_id` (FK candidates.id), `file_url`, `file_name`, `file_type`, `file_size`, `raw_text`, `extracted_data` (JSON), `overall_score` (float), `scores_breakdown` (JSON), `recommendations` (JSON), `keywords` (JSON), `analysis_version`, `processing_time`, `is_latest`, `created_at`

- `notifications` (modèle `Notification`)
  - `id`, `user_id`, `title`, `message`, `is_read`, `meta` (JSON), `created_at`

(Autres tables possibles selon implémentation : `matches`, `favorites`, `applications`, `messages`, `posters`, `skill_tests`, ...)

**Relations ER (résumé)**
- `User (1) -- (1) Candidate` (pour role = candidate)
- `User (1) -- (1) Company` (pour role = company)
- `Candidate (1) -- (N) CVAnalysis`
- `Company (1) -- (N) Job`
- `Candidate (1) -- (N) Applications` (jobs postulés)
- `Job (1) -- (N) Matches` (matching entre job & candidates)

**Principales routes / API (extrait)**
- Auth: `/auth/login`, `/auth/register`, `/auth/me`, `/auth/refresh`, `/auth/logout`
- Candidate features: `/candidates/profile`, `/candidates/upload-cv`, `/analysis/cv/*` (reanalyze, extracted-data, recommendations)
- CV generator & report: `/generate-cv`, `/generate-cover-letter`, `/cv-tips`, `/templates`, `/uploads/cv/report/pdf` (nouveau endpoint PDF)
- Jobs: `/jobs`, `/jobs/:id`, `/jobs/company` (CRUD)
- Matching: `/matching/jobs`, `/matching/candidates`, `/matching/score`
- Uploads/static: `/uploads/*` pour avatars, cv, logos, posters
- Notifications: `/notifications`, `/notifications/unread-count`, `/notifications/:id/read`

**Flux principal d'une analyse & génération de rapport**
1. L'utilisateur (candidate) upload son CV via `/uploads` ou `/candidates/upload-cv`.
2. Le backend crée / met à jour un `CVAnalysis` en stockant `raw_text`, `extracted_data`, `overall_score` et `recommendations`.
3. Frontend affiche résultats dans `CandidateDashboard.jsx` et propose téléchargement du rapport.
4. Téléchargement: `analysisAPI.downloadPDF(analysisId)` → appelle `/uploads/cv/report/pdf?analysis_id=...` → réponse `application/pdf`.
   - Si backend indisponible, fallback: `ReportTemplate.jsx` génère un HTML imprimable côté client.

**Commandes de développement**
- Backend (Windows PowerShell, venv activé):

```powershell
cd C:\Users\ZAKSOFT\Desktop\Bara\backend
C:\Users\ZAKSOFT\Desktop\Bara\.venv\Scripts\python.exe run.py
```

- Frontend:

```powershell
cd C:\Users\ZAKSOFT\Desktop\Bara\frontend\baracorrespondance-frontend-complete
npm install
npm run dev
```

**Fichiers importants à connaître**
- Backend: `app/models/*.py`, `app/routes/*.py`, `app/services/*.py`, `run.py`, `requirements.txt`
- Frontend: `src/components/*`, `src/services/api.js`, `src/styles/index.css`, `package.json`

**Recommandations / Sujets d'amélioration**
- Versioning des migrations: utiliser `Flask-Migrate` / `alembic` et garder `migrations/` sous contrôle.
- Tests: ajouter tests unitaires/integra via `pytest` pour les endpoints critiques (`analysis`, `auth`, `reports`).
- PDF pixel-perfect: si besoin d'un rendu fidèle au CSS, ajouter une solution HTML→PDF (WeasyPrint ou headless Chromium). WeasyPrint demande des libs système (cairo/pango).
- Sécurité: s'assurer que les endpoints d'upload et de téléchargement valident les ownerships et limitent la taille des fichiers.
- CI/CD: pipeline pour lint, tests et build (frontend + backend) avant déploiement.

---

Fichier généré automatiquement par l'assistant. Pour une représentation graphique ER (SVG/PNG) ou un `docker-compose` pour faciliter le dev, demandez-moi et je le génèrerai.
