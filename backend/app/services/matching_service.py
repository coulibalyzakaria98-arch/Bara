"""
================================================================
Service de Matching CV-Emplois - BaraCorrespondance AI
================================================================
"""

from app.models import Candidate, Job, Company
from app import db


class MatchingService:
    """Service pour calculer la compatibilité entre candidats et offres d'emploi"""

    # Pondération des critères
    WEIGHTS = {
        'skills': 0.35,
        'experience': 0.25,
        'education': 0.15,
        'location': 0.15,
        'salary': 0.10
    }

    # Mapping des niveaux d'éducation
    EDUCATION_LEVELS = {
        'bac': 1,
        'bac+2': 2,
        'bac+3': 3,
        'bac+5': 4,
        'doctorate': 5
    }

    def calculate_match_score(self, candidate, job):
        """
        Calculer le score de compatibilité entre un candidat et une offre

        Returns:
            dict: {
                'overall_score': float (0-100),
                'details': {
                    'skills_score': float,
                    'experience_score': float,
                    'education_score': float,
                    'location_score': float,
                    'salary_score': float
                },
                'matched_skills': list,
                'missing_skills': list
            }
        """
        # Calculer chaque composant du score
        skills_result = self._calculate_skills_score(candidate, job)
        experience_score = self._calculate_experience_score(candidate, job)
        education_score = self._calculate_education_score(candidate, job)
        location_score = self._calculate_location_score(candidate, job)
        salary_score = self._calculate_salary_score(candidate, job)

        # Score global pondéré
        overall_score = (
            skills_result['score'] * self.WEIGHTS['skills'] +
            experience_score * self.WEIGHTS['experience'] +
            education_score * self.WEIGHTS['education'] +
            location_score * self.WEIGHTS['location'] +
            salary_score * self.WEIGHTS['salary']
        )

        return {
            'overall_score': round(overall_score, 1),
            'details': {
                'skills_score': round(skills_result['score'], 1),
                'experience_score': round(experience_score, 1),
                'education_score': round(education_score, 1),
                'location_score': round(location_score, 1),
                'salary_score': round(salary_score, 1)
            },
            'matched_skills': skills_result['matched'],
            'missing_skills': skills_result['missing']
        }

    def _calculate_skills_score(self, candidate, job):
        """Calculer le score de correspondance des compétences"""
        candidate_skills = set(s.lower() for s in (candidate.skills or []))
        required_skills = set(s.lower() for s in (job.required_skills or []))
        nice_to_have = set(s.lower() for s in (job.nice_to_have_skills or []))

        if not required_skills:
            return {'score': 100, 'matched': list(candidate_skills), 'missing': []}

        # Compétences correspondantes
        matched_required = candidate_skills & required_skills
        matched_nice = candidate_skills & nice_to_have

        # Score basé sur les compétences requises (80%) + nice to have (20%)
        required_ratio = len(matched_required) / len(required_skills) if required_skills else 1
        nice_ratio = len(matched_nice) / len(nice_to_have) if nice_to_have else 0

        score = (required_ratio * 80) + (nice_ratio * 20)

        # Compétences manquantes
        missing = list(required_skills - candidate_skills)

        return {
            'score': min(score, 100),
            'matched': list(matched_required | matched_nice),
            'missing': missing
        }

    def _calculate_experience_score(self, candidate, job):
        """Calculer le score d'expérience"""
        candidate_exp = candidate.experience_years or 0
        min_exp = job.min_experience_years or 0
        max_exp = job.max_experience_years

        if min_exp == 0 and not max_exp:
            return 100  # Pas d'exigence d'expérience

        if candidate_exp >= min_exp:
            if max_exp and candidate_exp > max_exp:
                # Surqualifié (légère pénalité)
                return max(70, 100 - (candidate_exp - max_exp) * 5)
            return 100
        else:
            # Sous-qualifié
            if min_exp > 0:
                ratio = candidate_exp / min_exp
                return max(0, ratio * 100)
            return 50

    def _calculate_education_score(self, candidate, job):
        """Calculer le score de formation"""
        if not job.education_level:
            return 100  # Pas d'exigence

        candidate_level = self.EDUCATION_LEVELS.get(candidate.education_level, 0)
        required_level = self.EDUCATION_LEVELS.get(job.education_level, 0)

        if candidate_level >= required_level:
            return 100
        elif candidate_level > 0:
            # Score partiel basé sur le ratio
            return (candidate_level / required_level) * 100
        return 0

    def _calculate_location_score(self, candidate, job):
        """Calculer le score de localisation"""
        # Même ville = 100%
        if candidate.city and job.city:
            if candidate.city.lower() == job.city.lower():
                return 100
            # Même pays
            if candidate.country and job.country:
                if candidate.country.lower() == job.country.lower():
                    if candidate.willing_to_relocate:
                        return 80
                    return 50
            return 30

        # Télétravail
        if job.is_remote and job.remote_type == 'full':
            return 100

        return 70  # Pas d'info = score moyen

    def _calculate_salary_score(self, candidate, job):
        """Calculer le score de correspondance salariale"""
        if not job.salary_min and not job.salary_max:
            return 100  # Pas de salaire affiché

        if not candidate.desired_salary_min:
            return 80  # Pas de prétention = flexible

        job_max = job.salary_max or job.salary_min
        job_min = job.salary_min or 0
        candidate_min = candidate.desired_salary_min
        candidate_max = candidate.desired_salary_max or candidate_min * 1.3

        # Vérifier le chevauchement des fourchettes
        if job_max >= candidate_min and job_min <= candidate_max:
            return 100
        elif job_max < candidate_min:
            # Offre en dessous des attentes
            ratio = job_max / candidate_min
            return max(0, ratio * 100)
        else:
            # Candidat en dessous
            return 90  # Peu pénalisant

    def get_matched_jobs_for_candidate(self, candidate_id, limit=20, min_score=50):
        """
        Obtenir les offres correspondant à un candidat

        Args:
            candidate_id: ID du candidat
            limit: Nombre max de résultats
            min_score: Score minimum pour inclure

        Returns:
            list: Liste d'offres avec scores de matching
        """
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return []

        # Récupérer les offres actives
        jobs = Job.query.filter_by(is_active=True).all()

        matches = []
        for job in jobs:
            if job.is_expired():
                continue

            match_result = self.calculate_match_score(candidate, job)

            if match_result['overall_score'] >= min_score:
                job_data = job.to_dict(include_company=True)
                job_data['match'] = match_result
                matches.append(job_data)

        # Trier par score décroissant
        matches.sort(key=lambda x: x['match']['overall_score'], reverse=True)

        return matches[:limit]

    def get_matched_candidates_for_job(self, job_id, limit=20, min_score=50):
        """
        Obtenir les candidats correspondant à une offre

        Args:
            job_id: ID de l'offre
            limit: Nombre max de résultats
            min_score: Score minimum pour inclure

        Returns:
            list: Liste de candidats avec scores de matching
        """
        job = Job.query.get(job_id)
        if not job:
            return []

        # Récupérer les candidats publics et disponibles
        candidates = Candidate.query.filter_by(
            is_public=True,
            is_available=True
        ).all()

        matches = []
        for candidate in candidates:
            match_result = self.calculate_match_score(candidate, job)

            if match_result['overall_score'] >= min_score:
                candidate_data = candidate.to_dict(include_user=True)
                candidate_data['match'] = match_result
                matches.append(candidate_data)

        # Trier par score décroissant
        matches.sort(key=lambda x: x['match']['overall_score'], reverse=True)

        return matches[:limit]


# Instance singleton
matching_service = MatchingService()
