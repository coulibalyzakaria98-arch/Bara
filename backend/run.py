#!/usr/bin/env python3
"""
================================================================
BaraCorrespondance AI - Point d'entrée de l'application
================================================================
Usage:
    python run.py
    
Pour production:
    gunicorn -w 4 -b 0.0.0.0:5000 run:app
================================================================
"""

from app import create_app, db

app = create_app()


@app.cli.command("init-db")
def init_db():
    """Initialiser la base de données"""
    with app.app_context():
        db.create_all()
        print("✅ Base de données initialisée!")


@app.cli.command("seed-db")
def seed_db():
    """Ajouter des données de test"""
    from app.models import User, Company, Candidate
    
    with app.app_context():
        # Ajouter des données de test de manière idempotente
        def ensure_user(email, password, role, first_name, last_name):
            user = User.query.filter_by(email=email).first()
            if user:
                return user
            user = User(
                email=email,
                password=password,
                role=role,
                first_name=first_name,
                last_name=last_name
            )
            user.is_verified = True
            db.session.add(user)
            db.session.flush()
            return user

        admin = ensure_user(
            "admin@baracorrespondance.com",
            "Admin123!",
            "admin",
            "Admin",
            "System"
        )

        company_user = ensure_user(
            "entreprise@test.com",
            "Test123!",
            "company",
            "Jean",
            "Directeur"
        )

        # Créer ou récupérer l'entreprise liée
        company = Company.query.filter_by(user_id=company_user.id).first()
        if not company:
            company = Company(
                user_id=company_user.id,
                name="TechCorp Guinée",
                description="Entreprise leader dans la technologie",
                sector="Technologie",
                city="Conakry",
                country="Guinée"
            )
            db.session.add(company)

        candidate_user = ensure_user(
            "candidat@test.com",
            "Test123!",
            "candidate",
            "Mamadou",
            "Diallo"
        )

        # Créer ou récupérer le candidat lié
        candidate = Candidate.query.filter_by(user_id=candidate_user.id).first()
        if not candidate:
            candidate = Candidate(
                user_id=candidate_user.id,
                title="Développeur Full Stack",
                skills=["Python", "JavaScript", "React", "Flask"],
                experience_years=3,
                education_level="bac+5",
                city="Conakry"
            )
            db.session.add(candidate)

        db.session.commit()
        print("✅ Données de test ajoutées (ou déjà présentes)!")
        print("📧 Comptes:")
        print("   - Admin: admin@baracorrespondance.com / Admin123!")
        print("   - Entreprise: entreprise@test.com / Test123!")
        print("   - Candidat: candidat@test.com / Test123!")


@app.shell_context_processor
def make_shell_context():
    """Contexte pour flask shell"""
    from app.models import User, Candidate, Company, Job, CVAnalysis
    return {
        'db': db,
        'User': User,
        'Candidate': Candidate,
        'Company': Company,
        'Job': Job,
        'CVAnalysis': CVAnalysis
    }


if __name__ == '__main__':
    print("""
    ================================================
    BaraCorrespondance AI - Backend API
    ================================================
    API disponible sur: http://localhost:5000
    Documentation: http://localhost:5000/api/docs
    ================================================
    """)
    app.run(host='0.0.0.0', port=5000, debug=True)
