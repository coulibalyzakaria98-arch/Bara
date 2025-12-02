"""
================================================================
Service de Matching Automatique - BaraCorrespondance AI
================================================================
Détecte automatiquement les correspondances entre CV et offres d'emploi
"""

from datetime import datetime
from flask import current_app
from app import db
from app.models import Match, Job, CVAnalysis, Candidate, Company, create_notification


class AutoMatcherService:
    """Service de matching automatique CV-Emploi"""

    def __init__(self, match_threshold=60):
        """
        Args:
            match_threshold: Score minimum pour créer un match (0-100)
        """
        self.match_threshold = match_threshold

    def find_matches_for_cv(self, cv_analysis):
        """
        Trouve toutes les offres d'emploi qui correspondent au CV analysé

        Args:
            cv_analysis: Instance de CVAnalysis

        Returns:
            list: Liste des matchs créés
        """
        try:
            candidate = Candidate.query.get(cv_analysis.candidate_id)
            if not candidate:
                current_app.logger.error(f"Candidat {cv_analysis.candidate_id} non trouvé")
                return []

            # Récupérer toutes les offres actives
            active_jobs = Job.query.filter_by(
                is_active=True,
                auto_match=True
            ).all()

            current_app.logger.info(f"🔍 Recherche de matchs pour {candidate.user.full_name if candidate.user else 'N/A'} parmi {len(active_jobs)} offres")

            matches_created = []

            for job in active_jobs:
                # Vérifier si un match existe déjà
                existing_match = Match.query.filter_by(
                    candidate_id=candidate.id,
                    job_id=job.id
                ).first()

                if existing_match:
                    continue  # Skip si match déjà créé

                # Calculer le score de correspondance
                match_score, match_details = self._calculate_match_score(cv_analysis, job, candidate)

                # Utiliser le seuil du job ou le seuil par défaut
                threshold = job.match_threshold or self.match_threshold

                if match_score >= threshold:
                    # Créer le match
                    match = self._create_match(
                        candidate=candidate,
                        job=job,
                        cv_analysis=cv_analysis,
                        match_score=match_score,
                        match_details=match_details
                    )

                    if match:
                        matches_created.append(match)
                        current_app.logger.info(f"✅ Match créé: {candidate.user.full_name if candidate.user else 'N/A'} <-> {job.title} (Score: {match_score}%)")

            current_app.logger.info(f"🎯 {len(matches_created)} nouveau(x) match(s) créé(s)")
            return matches_created

        except Exception as e:
            current_app.logger.error(f"Erreur matching: {str(e)}")
            return []

    def _calculate_match_score(self, cv_analysis, job, candidate):
        """
        Calcule le score de correspondance entre un CV et un job

        Returns:
            tuple: (score, match_details)
        """
        scores = {}
        details = {}

        # 1. COMPÉTENCES (40% du score total)
        skills_score, skills_details = self._match_skills(cv_analysis, job)
        scores['skills'] = skills_score
        details['skills_match'] = skills_details

        # 2. EXPÉRIENCE (25% du score total)
        experience_score, experience_details = self._match_experience(cv_analysis, job, candidate)
        scores['experience'] = experience_score
        details['experience_match'] = experience_details

        # 3. FORMATION (15% du score total)
        education_score, education_details = self._match_education(cv_analysis, job)
        scores['education'] = education_score
        details['education_match'] = education_details

        # 4. LOCALISATION (10% du score total)
        location_score, location_details = self._match_location(candidate, job)
        scores['location'] = location_score
        details['location_match'] = location_details

        # 5. MOTS-CLÉS (10% du score total)
        keywords_score, keywords_details = self._match_keywords(cv_analysis, job)
        scores['keywords'] = keywords_score
        details['keywords_match'] = keywords_details

        # Calculer le score global pondéré
        weights = {
            'skills': 0.40,
            'experience': 0.25,
            'education': 0.15,
            'location': 0.10,
            'keywords': 0.10
        }

        overall_score = sum(scores[key] * weights[key] for key in scores)

        # Générer les raisons du match
        match_reasons = self._generate_match_reasons(scores, details)
        concerns = self._generate_concerns(scores, details)

        return round(overall_score, 1), {
            **details,
            'scores': scores,
            'match_reasons': match_reasons,
            'concerns': concerns
        }

    def _match_skills(self, cv_analysis, job):
        """Comparer les compétences"""
        extracted_data = cv_analysis.extracted_data or {}
        candidate_skills = extracted_data.get('skills', {})
        all_candidate_skills = set(
            [s.lower() for s in candidate_skills.get('technical', [])] +
            [s.lower() for s in candidate_skills.get('soft', [])]
        )

        required_skills = set([s.lower() for s in (job.required_skills or [])])
        nice_to_have = set([s.lower() for s in (job.nice_to_have_skills or [])])

        if not required_skills:
            return 80, {'score': 80, 'matched_skills': [], 'missing_skills': []}

        # Compétences requises matchées
        matched_required = all_candidate_skills.intersection(required_skills)
        matched_nice = all_candidate_skills.intersection(nice_to_have)

        # Score basé sur les compétences requises
        required_ratio = len(matched_required) / len(required_skills) if required_skills else 0
        nice_ratio = len(matched_nice) / len(nice_to_have) if nice_to_have else 0

        # 80% pour required, 20% pour nice-to-have
        score = (required_ratio * 80) + (nice_ratio * 20)

        return round(score, 1), {
            'score': round(score, 1),
            'matched_skills': list(matched_required.union(matched_nice)),
            'missing_skills': list(required_skills - matched_required),
            'matched_count': len(matched_required),
            'required_count': len(required_skills),
            'nice_matched_count': len(matched_nice)
        }

    def _match_experience(self, cv_analysis, job, candidate):
        """Comparer l'expérience"""
        extracted_data = cv_analysis.extracted_data or {}
        candidate_years = extracted_data.get('total_experience_years', 0) or candidate.experience_years or 0

        min_years = job.min_experience_years or 0
        max_years = job.max_experience_years or 999

        # Si dans la fourchette
        if min_years <= candidate_years <= max_years:
            score = 100
        elif candidate_years < min_years:
            # Pénalité si moins d'expérience
            diff = min_years - candidate_years
            score = max(0, 100 - (diff * 15))  # -15% par année manquante
        else:
            # Légère pénalité si trop d'expérience (risque de surqualification)
            diff = candidate_years - max_years
            score = max(70, 100 - (diff * 5))  # -5% par année en trop

        return round(score, 1), {
            'score': round(score, 1),
            'candidate_years': candidate_years,
            'required_min_years': min_years,
            'required_max_years': max_years,
            'meets_requirement': min_years <= candidate_years <= max_years
        }

    def _match_education(self, cv_analysis, job):
        """Comparer la formation"""
        if not job.education_level:
            return 80, {'score': 80, 'meets_requirement': True}

        extracted_data = cv_analysis.extracted_data or {}
        education = extracted_data.get('education_level', '').lower()

        education_levels = {
            'bac': 1,
            'bac+2': 2,
            'bac+3': 3,
            'bac+5': 5,
            'master': 5,
            'doctorat': 8,
            'phd': 8
        }

        required_level = education_levels.get(job.education_level.lower(), 3)
        candidate_level = 0

        # Trouver le niveau du candidat
        for key, value in education_levels.items():
            if key in education:
                candidate_level = max(candidate_level, value)

        if candidate_level >= required_level:
            score = 100
        elif candidate_level == required_level - 1:
            score = 70  # Un niveau en dessous
        else:
            score = max(30, 100 - ((required_level - candidate_level) * 20))

        return round(score, 1), {
            'score': round(score, 1),
            'candidate_level': education,
            'required_level': job.education_level,
            'meets_requirement': candidate_level >= required_level
        }

    def _match_location(self, candidate, job):
        """Comparer la localisation"""
        if job.is_remote:
            return 100, {
                'score': 100,
                'is_remote': True,
                'match_type': 'remote_ok'
            }

        candidate_city = (candidate.city or '').lower().strip()
        job_city = (job.city or '').lower().strip()

        if candidate_city and job_city:
            if candidate_city == job_city:
                score = 100
            elif candidate_city in job_city or job_city in candidate_city:
                score = 80
            else:
                score = 40  # Villes différentes
        else:
            score = 70  # Pas assez d'info

        return round(score, 1), {
            'score': round(score, 1),
            'candidate_location': candidate.city,
            'job_location': job.city,
            'is_remote': job.is_remote
        }

    def _match_keywords(self, cv_analysis, job):
        """Comparer les mots-clés"""
        cv_keywords = set([k.lower() for k in (cv_analysis.keywords or [])])

        # Créer un set de mots-clés du job (titre + description + compétences)
        job_keywords = set()
        if job.title:
            job_keywords.update([w.lower() for w in job.title.split() if len(w) > 3])
        if job.description:
            # Prendre quelques mots clés de la description
            words = [w.lower() for w in job.description.split() if len(w) > 4]
            job_keywords.update(words[:20])
        job_keywords.update([s.lower() for s in (job.required_skills or [])])

        if not job_keywords:
            return 70, {'score': 70, 'matched_keywords': []}

        matched = cv_keywords.intersection(job_keywords)
        score = min(100, (len(matched) / max(len(job_keywords) * 0.3, 1)) * 100)

        return round(score, 1), {
            'score': round(score, 1),
            'matched_keywords': list(matched)[:10],
            'total_keywords': len(matched)
        }

    def _generate_match_reasons(self, scores, details):
        """Générer les raisons du match"""
        reasons = []

        if scores['skills'] >= 80:
            matched = details['skills_match']['matched_count']
            total = details['skills_match']['required_count']
            reasons.append(f"Excellente correspondance de compétences ({matched}/{total})")
        elif scores['skills'] >= 60:
            reasons.append("Bonne correspondance de compétences")

        if scores['experience'] >= 90:
            reasons.append("Expérience parfaitement alignée avec les exigences")
        elif scores['experience'] >= 70:
            reasons.append("Expérience correspond au niveau recherché")

        if scores['education'] >= 90:
            reasons.append("Formation supérieure aux exigences")
        elif scores['education'] >= 70:
            reasons.append("Formation correspond aux critères")

        if scores['location'] >= 90:
            reasons.append("Localisation géographique idéale")

        if scores['keywords'] >= 80:
            reasons.append("Vocabulaire et domaine d'expertise alignés")

        if not reasons:
            reasons.append("Profil correspond aux critères de base")

        return reasons

    def _generate_concerns(self, scores, details):
        """Générer les points d'attention"""
        concerns = []

        missing_skills = details['skills_match'].get('missing_skills', [])
        if missing_skills and len(missing_skills) > 0:
            concerns.append(f"Compétences manquantes: {', '.join(missing_skills[:3])}")

        if scores['experience'] < 60:
            exp_details = details['experience_match']
            if exp_details['candidate_years'] < exp_details['required_min_years']:
                diff = exp_details['required_min_years'] - exp_details['candidate_years']
                concerns.append(f"Manque {diff} an(s) d'expérience")

        if scores['education'] < 60:
            concerns.append("Formation en dessous des exigences")

        if scores['location'] < 60 and not details['location_match'].get('is_remote'):
            concerns.append("Localisation géographique éloignée")

        return concerns

    def _create_match(self, candidate, job, cv_analysis, match_score, match_details):
        """
        Crée un Match et envoie les notifications

        Args:
            candidate: Instance Candidate
            job: Instance Job
            cv_analysis: Instance CVAnalysis
            match_score: Score de correspondance
            match_details: Détails du matching

        Returns:
            Match: Instance créée ou None si erreur
        """
        try:
            # Créer le match
            match = Match(
                candidate_id=candidate.id,
                job_id=job.id,
                cv_analysis_id=cv_analysis.id,
                match_score=match_score,
                match_details=match_details,
                match_reasons=match_details.get('match_reasons', []),
                concerns=match_details.get('concerns', []),
                status='new',
                is_auto_matched=True,
                matching_algorithm_version='1.0'
            )

            db.session.add(match)
            db.session.flush()  # Pour obtenir l'ID

            # Envoyer les notifications aux deux parties
            self._send_match_notifications(match, candidate, job)

            db.session.commit()

            return match

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur création match: {str(e)}")
            return None

    def _send_match_notifications(self, match, candidate, job):
        """
        Envoie les notifications de match aux deux parties

        Args:
            match: Instance Match
            candidate: Instance Candidate
            job: Instance Job
        """
        now = datetime.utcnow()

        try:
            # Récupérer l'entreprise
            company = Company.query.get(job.company_id)
            if not company:
                current_app.logger.error(f"Entreprise {job.company_id} non trouvée")
                return

            # Notation du match
            grade, emoji = match.get_match_grade()

            # === NOTIFICATION POUR L'ENTREPRISE ===
            company_notification = create_notification(
                user_id=company.user_id,
                notification_type='new_match',
                title=f"{emoji} Nouveau candidat correspondant!",
                message=f"{candidate.user.full_name if candidate.user else 'Un candidat'} correspond à votre offre '{job.title}' (Match: {match.match_score}%)",
                data={
                    'match_id': match.id,
                    'candidate_id': candidate.id,
                    'job_id': job.id,
                    'match_score': match.match_score,
                    'grade': grade
                },
                action_url=f"/dashboard/matches/{match.id}"
            )

            if company_notification:
                match.company_notified_at = now
                current_app.logger.info(f"📧 Notification envoyée à l'entreprise {company.name}")

            # === NOTIFICATION POUR LE CANDIDAT ===
            candidate_notification = create_notification(
                user_id=candidate.user_id,
                notification_type='new_match',
                title=f"{emoji} Nouvelle opportunité détectée!",
                message=f"Le poste '{job.title}' chez {company.name} correspond à votre profil (Match: {match.match_score}%)",
                data={
                    'match_id': match.id,
                    'job_id': job.id,
                    'company_id': company.id,
                    'match_score': match.match_score,
                    'grade': grade
                },
                action_url=f"/dashboard/matches/{match.id}"
            )

            if candidate_notification:
                match.candidate_notified_at = now
                current_app.logger.info(f"📧 Notification envoyée au candidat {candidate.user.full_name if candidate.user else 'N/A'}")

            # Commit les mises à jour des timestamps
            db.session.commit()

            current_app.logger.info(f"🔔 Notifications bidirectionnelles envoyées pour match {match.id}")

        except Exception as e:
            current_app.logger.error(f"Erreur envoi notifications: {str(e)}")

    def find_matches_for_job(self, job):
        """
        Trouve tous les candidats qui correspondent à une offre d'emploi

        Args:
            job: Instance Job

        Returns:
            list: Liste des matchs créés
        """
        try:
            # Récupérer toutes les dernières analyses de CV
            latest_analyses = CVAnalysis.query.filter_by(is_latest=True).all()

            current_app.logger.info(f"🔍 Recherche de candidats pour '{job.title}' parmi {len(latest_analyses)} CV")

            matches_created = []

            for cv_analysis in latest_analyses:
                candidate = Candidate.query.get(cv_analysis.candidate_id)
                if not candidate:
                    continue

                # Vérifier si match existe déjà
                existing_match = Match.query.filter_by(
                    candidate_id=candidate.id,
                    job_id=job.id
                ).first()

                if existing_match:
                    continue

                # Calculer le score
                match_score, match_details = self._calculate_match_score(cv_analysis, job, candidate)

                threshold = job.match_threshold or self.match_threshold

                if match_score >= threshold:
                    match = self._create_match(
                        candidate=candidate,
                        job=job,
                        cv_analysis=cv_analysis,
                        match_score=match_score,
                        match_details=match_details
                    )

                    if match:
                        matches_created.append(match)

            current_app.logger.info(f"🎯 {len(matches_created)} nouveau(x) match(s) créé(s) pour '{job.title}'")
            return matches_created

        except Exception as e:
            current_app.logger.error(f"Erreur matching job: {str(e)}")
            return []


# Instance globale
auto_matcher = AutoMatcherService(match_threshold=60)
