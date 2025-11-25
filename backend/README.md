# 🚀 BaraCorrespondance AI - Backend API

Plateforme intelligente de matching CV-Entreprise avec analyse IA et génération automatique d'affiches.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [API Endpoints](#-api-endpoints)
- [Structure du projet](#-structure-du-projet)

## ✨ Fonctionnalités

### Pour les Candidats
- 📄 Upload et analyse automatique de CV par IA
- 📊 Score et recommandations d'amélioration
- 🎯 Matching automatique avec les offres d'emploi
- 📈 Tableau de bord personnel

### Pour les Entreprises
- 👥 Recherche de candidats avec filtres avancés
- 📝 Publication d'offres d'emploi
- 🤖 Matching intelligent avec les candidats
- 🔔 Système de notifications

## 🛠 Technologies

- **Framework**: Flask 3.0
- **Base de données**: PostgreSQL / SQLite
- **ORM**: SQLAlchemy
- **Authentification**: JWT (Flask-JWT-Extended)
- **Analyse CV**: pdfplumber, python-docx
- **Validation**: Marshmallow

## 📥 Installation

### Prérequis
- Python 3.10+
- PostgreSQL (optionnel, SQLite par défaut)
- pip

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/votre-repo/baracorrespondance-backend.git
cd baracorrespondance-backend
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer l'environnement**
```bash
cp .env.example .env
# Modifier .env avec vos paramètres
```

5. **Initialiser la base de données**
```bash
flask init-db
```

6. **Ajouter des données de test (optionnel)**
```bash
flask seed-db
```

## ⚙️ Configuration

Créez un fichier `.env` à partir de `.env.example`:

```env
# Flask
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=votre-cle-secrete

# Database
DATABASE_URL=sqlite:///baracorrespondance.db
# Ou PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/baracorrespondance

# JWT
JWT_SECRET_KEY=votre-jwt-secret
```

## 🚀 Lancement

### Mode développement
```bash
python run.py
```

### Mode production
```bash
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

L'API sera disponible sur `http://localhost:5000`

## 📚 API Endpoints

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion |
| POST | `/refresh` | Rafraîchir le token |
| GET | `/me` | Profil utilisateur connecté |
| POST | `/change-password` | Changer le mot de passe |
| POST | `/forgot-password` | Mot de passe oublié |
| POST | `/reset-password` | Réinitialiser le mot de passe |

### Candidats (`/api/candidates`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/profile` | Obtenir son profil |
| PUT | `/profile` | Modifier son profil |
| GET | `/cv-analysis` | Dernière analyse CV |
| GET | `/applications` | Ses candidatures |
| GET | `/stats` | Statistiques |

### Entreprises (`/api/companies`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/profile` | Obtenir son profil |
| PUT | `/profile` | Modifier son profil |
| GET | `/applications` | Candidatures reçues |
| PUT | `/applications/:id/status` | Changer statut candidature |
| GET | `/search-candidates` | Rechercher des candidats |
| GET | `/stats` | Statistiques |

### Offres d'emploi (`/api/jobs`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste des offres (public) |
| GET | `/:id` | Détails d'une offre |
| POST | `/` | Créer une offre (entreprise) |
| PUT | `/:id` | Modifier une offre |
| DELETE | `/:id` | Supprimer une offre |
| POST | `/:id/apply` | Postuler (candidat) |
| GET | `/:id/applications` | Candidatures (entreprise) |

### Uploads (`/api/uploads`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/cv` | Uploader un CV |
| POST | `/avatar` | Uploader un avatar |
| POST | `/logo` | Uploader un logo entreprise |
| DELETE | `/cv` | Supprimer son CV |

### Analyse CV (`/api/analysis`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/cv/:id` | Détails d'une analyse |
| GET | `/cv/:id/recommendations` | Recommandations |
| POST | `/cv/:id/apply-to-profile` | Appliquer au profil |
| GET | `/usage` | Utilisation mensuelle |

## 📁 Structure du projet

```
backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── config.py            # Configuration
│   ├── models/              # Modèles SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── candidate.py
│   │   ├── company.py
│   │   ├── job.py
│   │   └── cv_analysis.py
│   ├── routes/              # Routes API
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── candidates.py
│   │   ├── companies.py
│   │   ├── jobs.py
│   │   ├── analysis.py
│   │   └── uploads.py
│   ├── services/            # Services métier
│   │   ├── __init__.py
│   │   ├── cv_analyzer.py
│   │   └── matcher.py
│   ├── utils/               # Utilitaires
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   └── helpers.py
│   └── static/uploads/      # Fichiers uploadés
├── migrations/              # Migrations Alembic
├── tests/                   # Tests
├── .env.example
├── .gitignore
├── requirements.txt
├── run.py                   # Point d'entrée
└── README.md
```

## 🧪 Tests

```bash
# Lancer tous les tests
pytest

# Avec couverture
pytest --cov=app
```

## 📝 Comptes de test

Après `flask seed-db`:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@baracorrespondance.com | Admin123! |
| Entreprise | entreprise@test.com | Test123! |
| Candidat | candidat@test.com | Test123! |

## 📄 License

MIT License - voir [LICENSE](LICENSE)

## 👥 Auteurs

- **BaraCorrespondance Team**

---

🇬🇳 Fait avec ❤️ pour l'Afrique
