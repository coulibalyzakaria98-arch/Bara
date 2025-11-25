"""
================================================================
Service de Matching - BaraCorrespondance AI
================================================================
Algorithme de matching entre candidats et offres d'emploi
"""

from app import db
from app.models import Candidate, Job, JobApplication


class MatcherService:
    """Service de matching candidat-emploi"""
    
    # Poids des différents critères
    WEIGHTS = {
        'skills': 0.40,       # 40% - Compétences
        'experience': 0.25,   # 25% - Expérience
        'education': 0.15,    # 15% - Formation
        'location': 0.10,     # 10% - Localisation
        'salary': 0.10        # 10% - Salaire
    }
    
    def __init__(self):
        pass
    
    def calculate_match_score(self, candidate, job):
        """
        Calculer le score de matching entre un candidat et une offre
        
        Args:
            candidate: Objet Candidate
            job: Objet Job
            
        Returns:
            dict: Scores détaillés et score global
        """
        scores = {
            'skills_match': self._calculate_skills_match(candidate, job),
            'experience_match': self._calculate_experience_match(candidate, job),
            'education_match': self._calculate_education_match(candidate, job),
            'location_match': self._calculate_location_match(candidate, job),
            'salary_match': self._calculate_salary_match(candidate, job)
        }
        
        # Calculer le score global pondéré
        overall = (
            scores['skills_match'] * self.WEIGHTS['skills'] +
            scores['experience_match'] * self.WEIGHTS['experience'] +
            scores['education_match'] * self.WEIGHTS['education'] +
            scores['location_match'] * self.WEIGHTS['location'] +
            scores['salary_match'] * self.WEIGHTS['salary']
        )
        
        scores['overall'] = round(overall, 1)
        
        return scores
    
    def _calculate_skills_match(self, candidate, job):
        """Calculer la correspondance des compétences"""
        candidate_skills = set(s.lower() for s in (candidate.skills or []))
        required_skills = set(s.lower() for s in (job.required_skills or []))
        nice_to_have = set(s.lower() for s in (job.nice_to_have_skills or []))
        
        if not required_skills:
            return 100  # Pas de compétences requises = match parfait
        
        # Compétences requises trouvées
        required_match = len(candidate_skills & required_skills)
        required_total = len(required_skills)
        required_score = (required_match / required_total) * 100 if required_total > 0 else 100
        
        # Bonus pour les compétences "nice to have"
        nice_match = len(candidate_skills & nice_to_have)
        nice_bonus = min(10, nice_match * 2)  # Max 10 points bonus
        
        return min(100, required_score + nice_bonus)
    
    def _calculate_experience_match(self, candidate, job):
        """Calculer la correspondance de l'expérience"""
        candidate_years = candidate.experience_years or 0
        min_required = job.min_experience_years or 0
        max_required = job.max_experience_years
        
        # Si pas d'expérience requise
        if min_required == 0 and max_required is None:
            return 100
        
        # Candidat sous-qualifié
        if candidate_years < min_required:
            deficit = min_required - candidate_years
            # Pénalité de 20% par année manquante
            return max(0, 100 - (deficit * 20))
        
        # Candidat dans la fourchette
        if max_required is None or candidate_years <= max_required:
            return 100
        
        # Candidat surqualifié (légère pénalité)
        surplus = candidate_years - max_required
        return max(70, 100 - (surplus * 5))
    
    def _calculate_education_match(self, candidate, job):
        """Calculer la correspondance de la formation"""
        # Hiérarchie des niveaux d'études
        education_levels = {
            'bac': 1,
            'bac+2': 2,
            'bac+3': 3,
            'bac+5': 4,
            'doctorate': 5
        }
        
        candidate_level = education_levels.get(candidate.education_level, 0)
        required_level = education_levels.get(job.education_level, 0)
        
        if required_level == 0:
            return 100  # Pas d'exigence de formation
        
        if candidate_level >= required_level:
            return 100  # Niveau atteint ou supérieur
        
        # Pénalité pour niveau inférieur
        gap = required_level - candidate_level
        return max(0, 100 - (gap * 25))
    
    def _calculate_location_match(self, candidate, job):
        """Calculer la correspondance de localisation"""
        # Si télétravail complet
        if job.is_remote and job.remote_type == 'full':
            return 100
        
        # Même ville
        if candidate.city and job.city:
            if candidate.city.lower() == job.city.lower():
                return 100
        
        # Même pays
        if candidate.country and job.country:
            if candidate.country.lower() == job.country.lower():
                if candidate.willing_to_relocate:
                    return 90  # Prêt à déménager
                return 70  # Pas dans la même ville mais même pays
        
        # Prêt à déménager dans un autre pays
        if candidate.willing_to_relocate:
            return 60
        
        return 30  # Localisation différente, pas prêt à bouger
    
    def _calculate_salary_match(self, candidate, job):
        """Calculer la correspondance salariale"""
        # Si pas d'info salaire
        if not job.salary_min and not job.salary_max:
            return 100
        
        if not candidate.desired_salary_min and not candidate.desired_salary_max:
            return 80  # Pas de préférence = flexible
        
        job_min = job.salary_min or 0
        job_max = job.salary_max or float('inf')
        candidate_min = candidate.desired_salary_min or 0
        candidate_max = candidate.desired_salary_max or float('inf')
        
        # Vérifier le chevauchement des fourchettes
        overlap_start = max(job_min, candidate_min)
        overlap_end = min(job_max, candidate_max)
        
        if overlap_start <= overlap_end:
            # Il y a un chevauchement
            overlap_range = overlap_end - overlap_start
            candidate_range = candidate_max - candidate_min if candidate_max != float('inf') else job_max - job_min
            
            if candidate_range > 0:
                return min(100, (overlap_range / candidate_range) * 100)
            return 100
        
        # Pas de chevauchement - calculer l'écart
        if candidate_min > job_max:
            # Candidat demande plus
            gap_percent = ((candidate_min - job_max) / job_max) * 100 if job_max > 0 else 50
            return max(0, 100 - gap_percent)
        
        # Offre au-dessus des attentes (bonus!)
        return 100
    
    def find_matches_for_job(self, job_id, min_score=None):
        """
        Trouver les candidats correspondant à une offre
        
        Args:
            job_id: ID de l'offre
            min_score: Score minimum (utilise le seuil de l'offre si non spécifié)
            
        Returns:
            dict: Résultats du matching
        """
        job = Job.query.get(job_id)
        if not job:
            return {'error': 'Job not found', 'total_found': 0}
        
        threshold = min_score or job.match_threshold or 60
        
        # Récupérer les candidats disponibles et publics
        candidates = Candidate.query.filter_by(
            is_public=True,
            is_available=True
        ).all()
        
        matches = []
        
        for candidate in candidates:
            # Vérifier s'il n'a pas déjà postulé
            existing = JobApplication.query.filter_by(
                job_id=job_id,
                candidate_id=candidate.id
            ).first()
            
            if existing:
                continue
            
            # Calculer le score
            score = self.calculate_match_score(candidate, job)
            
            if score['overall'] >= threshold:
                matches.append({
                    'candidate_id': candidate.id,
                    'candidate_name': candidate.user.full_name if candidate.user else 'N/A',
                    'candidate_title': candidate.title,
                    'score': score
                })
        
        # Trier par score décroissant
        matches.sort(key=lambda x: x['score']['overall'], reverse=True)
        
        return {
            'job_id': job_id,
            'job_title': job.title,
            'threshold': threshold,
            'total_found': len(matches),
            'top_candidates': matches[:20]  # Top 20
        }
    
    def find_jobs_for_candidate(self, candidate_id, min_score=60):
        """
        Trouver les offres correspondant à un candidat
        
        Args:
            candidate_id: ID du candidat
            min_score: Score minimum
            
        Returns:
            dict: Offres correspondantes
        """
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return {'error': 'Candidate not found', 'total_found': 0}
        
        # Récupérer les offres actives
        jobs = Job.query.filter_by(is_active=True).all()
        
        matches = []
        
        for job in jobs:
            # Vérifier si pas déjà postulé
            existing = JobApplication.query.filter_by(
                job_id=job.id,
                candidate_id=candidate_id
            ).first()
            
            if existing:
                continue
            
            # Calculer le score
            score = self.calculate_match_score(candidate, job)
            
            if score['overall'] >= min_score:
                matches.append({
                    'job_id': job.id,
                    'job_title': job.title,
                    'company_name': job.company.name if job.company else 'N/A',
                    'company_logo': job.company.logo_url if job.company else None,
                    'score': score
                })
        
        # Trier par score décroissant
        matches.sort(key=lambda x: x['score']['overall'], reverse=True)
        
        return {
            'candidate_id': candidate_id,
            'min_score': min_score,
            'total_found': len(matches),
            'matching_jobs': matches[:20]
        }
    
    def get_match_explanation(self, candidate, job, scores):
        """
        Générer une explication du matching pour l'utilisateur
        
        Returns:
            list: Liste d'explications
        """
        explanations = []
        
        # Compétences
        if scores['skills_match'] >= 80:
            explanations.append({
                'type': 'positive',
                'category': 'skills',
                'message': "Vos compétences correspondent très bien aux exigences du poste."
            })
        elif scores['skills_match'] < 50:
            missing = set(s.lower() for s in (job.required_skills or [])) - set(s.lower() for s in (candidate.skills or []))
            explanations.append({
                'type': 'negative',
                'category': 'skills',
                'message': f"Certaines compétences requises manquent: {', '.join(list(missing)[:3])}"
            })
        
        # Expérience
        if scores['experience_match'] >= 90:
            explanations.append({
                'type': 'positive',
                'category': 'experience',
                'message': "Votre niveau d'expérience correspond parfaitement."
            })
        elif scores['experience_match'] < 60:
            explanations.append({
                'type': 'warning',
                'category': 'experience',
                'message': f"Le poste demande {job.min_experience_years}+ ans d'expérience."
            })
        
        # Localisation
        if job.is_remote:
            explanations.append({
                'type': 'info',
                'category': 'location',
                'message': "Ce poste est en télétravail."
            })
        elif scores['location_match'] < 70:
            explanations.append({
                'type': 'warning',
                'category': 'location',
                'message': f"Le poste est basé à {job.city}, {job.country}."
            })
        
        return explanations
