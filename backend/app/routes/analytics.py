"""
================================================================
Routes Analytics - BaraCorrespondance AI
================================================================
Statistiques et analytics pour candidats et entreprises
"""

from flask import Blueprint, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app import db
from app.models import User, Candidate, Company, Job, JobApplication, Match, CVAnalysis
from app.utils.helpers import success_response, error_response, safe_int
from app.services.pdf_service import generate_candidate_analytics_pdf, generate_company_analytics_pdf

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/candidate/stats', methods=['GET'])
@jwt_required()
def get_candidate_stats():
    """
    Statistiques complètes pour un candidat

    Returns:
        - Profile completion
        - Applications stats
        - Matches stats
        - CV analysis history
        - Timeline data
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    # Profile completion percentage
    profile_fields = [
        candidate.full_name,
        candidate.phone,
        candidate.location,
        candidate.skills,
        candidate.experience_years,
        candidate.education_level,
        candidate.cv_file,
        candidate.bio
    ]
    profile_completion = (sum(1 for field in profile_fields if field) / len(profile_fields)) * 100

    # Applications stats
    total_applications = JobApplication.query.filter_by(candidate_id=candidate.id).count()
    pending_applications = JobApplication.query.filter_by(candidate_id=candidate.id, status='pending').count()
    reviewed_applications = JobApplication.query.filter_by(candidate_id=candidate.id, status='reviewed').count()
    accepted_applications = JobApplication.query.filter_by(candidate_id=candidate.id, status='accepted').count()
    rejected_applications = JobApplication.query.filter_by(candidate_id=candidate.id, status='rejected').count()

    # Matches stats
    total_matches = Match.query.filter_by(candidate_id=candidate.id).count()
    avg_match_score = db.session.query(func.avg(Match.match_score)).filter_by(candidate_id=candidate.id).scalar() or 0
    high_quality_matches = Match.query.filter_by(candidate_id=candidate.id).filter(Match.match_score >= 80).count()

    # Top matched jobs
    top_matches = Match.query.filter_by(candidate_id=candidate.id).order_by(desc(Match.match_score)).limit(5).all()
    top_matched_jobs = [{
        'job_id': match.job_id,
        'job_title': match.job.title if match.job else 'N/A',
        'company_name': match.job.company.name if match.job and match.job.company else 'N/A',
        'match_score': round(match.match_score, 1),
        'created_at': match.created_at.isoformat() if match.created_at else None
    } for match in top_matches]

    # CV Analysis history
    cv_analyses = CVAnalysis.query.filter_by(candidate_id=candidate.id).order_by(desc(CVAnalysis.created_at)).limit(10).all()
    cv_history = [{
        'id': analysis.id,
        'score': round(analysis.overall_score, 1),
        'date': analysis.created_at.isoformat() if analysis.created_at else None,
        'file_name': analysis.file_name
    } for analysis in cv_analyses]

    latest_cv_score = cv_analyses[0].overall_score if cv_analyses else 0

    # Applications timeline (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    applications_timeline = db.session.query(
        func.date(JobApplication.created_at).label('date'),
        func.count(JobApplication.id).label('count')
    ).filter(
        JobApplication.candidate_id == candidate.id,
        JobApplication.created_at >= thirty_days_ago
    ).group_by(func.date(JobApplication.created_at)).all()

    timeline_data = [{
        'date': str(item.date),
        'count': item.count
    } for item in applications_timeline]

    # Response rate (applications reviewed/total)
    response_rate = 0
    if total_applications > 0:
        responded = reviewed_applications + accepted_applications + rejected_applications
        response_rate = (responded / total_applications) * 100

    # Success rate (accepted/total)
    success_rate = 0
    if total_applications > 0:
        success_rate = (accepted_applications / total_applications) * 100

    return success_response({
        'profile': {
            'completion': round(profile_completion, 1),
            'cv_score': round(latest_cv_score, 1),
            'experience_years': candidate.experience_years or 0,
            'skills_count': len(candidate.skills) if candidate.skills else 0
        },
        'applications': {
            'total': total_applications,
            'pending': pending_applications,
            'reviewed': reviewed_applications,
            'accepted': accepted_applications,
            'rejected': rejected_applications,
            'response_rate': round(response_rate, 1),
            'success_rate': round(success_rate, 1)
        },
        'matches': {
            'total': total_matches,
            'average_score': round(avg_match_score, 1),
            'high_quality': high_quality_matches,
            'top_matches': top_matched_jobs
        },
        'cv_history': cv_history,
        'timeline': timeline_data
    })


@analytics_bp.route('/company/stats', methods=['GET'])
@jwt_required()
def get_company_stats():
    """
    Statistiques complètes pour une entreprise

    Returns:
        - Jobs stats
        - Applications stats
        - Matches stats
        - Top performing jobs
        - Timeline data
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = user.company
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    # Profile completion
    profile_fields = [
        company.name,
        company.email,
        company.phone,
        company.location,
        company.website,
        company.industry,
        company.description,
        company.logo_url
    ]
    profile_completion = (sum(1 for field in profile_fields if field) / len(profile_fields)) * 100

    # Jobs stats
    total_jobs = Job.query.filter_by(company_id=company.id).count()
    active_jobs = Job.query.filter_by(company_id=company.id, is_active=True).count()
    inactive_jobs = total_jobs - active_jobs

    # Applications stats (all jobs)
    total_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id
    ).count()

    pending_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status == 'pending'
    ).count()

    reviewed_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status == 'reviewed'
    ).count()

    accepted_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status == 'accepted'
    ).count()

    rejected_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status == 'rejected'
    ).count()

    # Matches stats
    total_matches = db.session.query(Match).join(Job).filter(
        Job.company_id == company.id
    ).count()

    avg_match_score = db.session.query(func.avg(Match.match_score)).join(Job).filter(
        Job.company_id == company.id
    ).scalar() or 0

    high_quality_matches = db.session.query(Match).join(Job).filter(
        Job.company_id == company.id,
        Match.match_score >= 80
    ).count()

    # Top performing jobs (by applications count)
    top_jobs = db.session.query(
        Job.id,
        Job.title,
        Job.location,
        func.count(JobApplication.id).label('applications_count')
    ).outerjoin(JobApplication).filter(
        Job.company_id == company.id
    ).group_by(Job.id, Job.title, Job.location).order_by(
        desc('applications_count')
    ).limit(5).all()

    top_performing_jobs = [{
        'job_id': job.id,
        'title': job.title,
        'location': job.location,
        'applications': job.applications_count
    } for job in top_jobs]

    # Applications timeline (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    applications_timeline = db.session.query(
        func.date(JobApplication.created_at).label('date'),
        func.count(JobApplication.id).label('count')
    ).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.created_at >= thirty_days_ago
    ).group_by(func.date(JobApplication.created_at)).all()

    timeline_data = [{
        'date': str(item.date),
        'count': item.count
    } for item in applications_timeline]

    # Applications by status distribution
    status_distribution = {
        'pending': pending_applications,
        'reviewed': reviewed_applications,
        'accepted': accepted_applications,
        'rejected': rejected_applications
    }

    # Response time (days since first pending application)
    oldest_pending = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id,
        JobApplication.status == 'pending'
    ).order_by(JobApplication.created_at).first()

    avg_response_time = 0
    if oldest_pending and oldest_pending.created_at:
        days_waiting = (datetime.utcnow() - oldest_pending.created_at).days
        avg_response_time = days_waiting

    # Acceptance rate
    acceptance_rate = 0
    if total_applications > 0:
        acceptance_rate = (accepted_applications / total_applications) * 100

    return success_response({
        'profile': {
            'completion': round(profile_completion, 1),
            'industry': company.industry or 'Non spécifié'
        },
        'jobs': {
            'total': total_jobs,
            'active': active_jobs,
            'inactive': inactive_jobs,
            'top_performers': top_performing_jobs
        },
        'applications': {
            'total': total_applications,
            'pending': pending_applications,
            'reviewed': reviewed_applications,
            'accepted': accepted_applications,
            'rejected': rejected_applications,
            'status_distribution': status_distribution,
            'acceptance_rate': round(acceptance_rate, 1),
            'avg_response_time_days': avg_response_time
        },
        'matches': {
            'total': total_matches,
            'average_score': round(avg_match_score, 1),
            'high_quality': high_quality_matches
        },
        'timeline': timeline_data
    })


@analytics_bp.route('/candidate/activity', methods=['GET'])
@jwt_required()
def get_candidate_activity():
    """Activité récente du candidat"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Accès réservé aux candidats", 403)

    candidate = user.candidate
    if not candidate:
        return error_response("Profil candidat non trouvé", 404)

    # Recent applications
    recent_applications = JobApplication.query.filter_by(
        candidate_id=candidate.id
    ).order_by(desc(JobApplication.created_at)).limit(10).all()

    # Recent matches
    recent_matches = Match.query.filter_by(
        candidate_id=candidate.id
    ).order_by(desc(Match.created_at)).limit(10).all()

    activities = []

    # Combine and sort by date
    for app in recent_applications:
        activities.append({
            'type': 'application',
            'date': app.created_at.isoformat() if app.created_at else None,
            'job_title': app.job.title if app.job else 'N/A',
            'company': app.job.company.name if app.job and app.job.company else 'N/A',
            'status': app.status
        })

    for match in recent_matches:
        activities.append({
            'type': 'match',
            'date': match.created_at.isoformat() if match.created_at else None,
            'job_title': match.job.title if match.job else 'N/A',
            'company': match.job.company.name if match.job and match.job.company else 'N/A',
            'score': round(match.match_score, 1)
        })

    # Sort by date
    activities.sort(key=lambda x: x['date'] or '', reverse=True)

    return success_response(activities[:20])


@analytics_bp.route('/company/activity', methods=['GET'])
@jwt_required()
def get_company_activity():
    """Activité récente de l'entreprise"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Accès réservé aux entreprises", 403)

    company = user.company
    if not company:
        return error_response("Profil entreprise non trouvé", 404)

    # Recent applications received
    recent_applications = db.session.query(JobApplication).join(Job).filter(
        Job.company_id == company.id
    ).order_by(desc(JobApplication.created_at)).limit(20).all()

    activities = []

    for app in recent_applications:
        activities.append({
            'type': 'application_received',
            'date': app.created_at.isoformat() if app.created_at else None,
            'candidate_name': app.candidate.full_name if app.candidate else 'N/A',
            'job_title': app.job.title if app.job else 'N/A',
            'status': app.status,
            'match_score': round(app.match_score, 1) if app.match_score else None
        })

    return success_response(activities)


@analytics_bp.route('/export/pdf', methods=['GET'])
@jwt_required()
def export_analytics_pdf():
    """
    Exporter les analytics en PDF

    Génère un rapport PDF complet basé sur le rôle de l'utilisateur
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("Utilisateur non trouvé", 404)

    try:
        if user.role == 'candidate':
            candidate = user.candidate
            if not candidate:
                return error_response("Profil candidat non trouvé", 404)

            # Gather candidate stats for PDF
            stats = {
                'candidate_info': {
                    'full_name': candidate.full_name or 'N/A',
                    'email': user.email or 'N/A',
                    'phone': candidate.phone or 'N/A',
                    'location': candidate.location or 'N/A',
                    'experience_years': candidate.experience_years or 0,
                    'education_level': candidate.education_level or 'N/A',
                    'availability': candidate.availability or 'N/A',
                    'skills': candidate.skills or []
                },
                'global_stats': {
                    'total_applications': JobApplication.query.filter_by(candidate_id=candidate.id).count(),
                    'accepted_applications': JobApplication.query.filter_by(candidate_id=candidate.id, status='accepted').count(),
                    'pending_applications': JobApplication.query.filter_by(candidate_id=candidate.id, status='pending').count(),
                    'rejected_applications': JobApplication.query.filter_by(candidate_id=candidate.id, status='rejected').count(),
                    'total_matches': Match.query.filter_by(candidate_id=candidate.id).count(),
                    'mutual_matches': Match.query.filter_by(candidate_id=candidate.id, status='mutual_interest').count(),
                    'profile_views': 0,  # TODO: implement view tracking
                    'avg_match_score': db.session.query(func.avg(Match.match_score)).filter_by(candidate_id=candidate.id).scalar() or 0,
                    'acceptance_rate': 0
                },
                'recent_activity': []
            }

            # Calculate acceptance rate
            total_apps = stats['global_stats']['total_applications']
            if total_apps > 0:
                accepted = stats['global_stats']['accepted_applications']
                stats['global_stats']['acceptance_rate'] = (accepted / total_apps) * 100

            # Recent activity
            recent_applications = JobApplication.query.filter_by(
                candidate_id=candidate.id
            ).order_by(desc(JobApplication.created_at)).limit(10).all()

            for app in recent_applications:
                activity_date = app.created_at.strftime('%d/%m/%Y') if app.created_at else 'N/A'
                job_title = app.job.title if app.job else 'N/A'
                company_name = app.job.company.name if app.job and app.job.company else 'N/A'

                stats['recent_activity'].append({
                    'date': activity_date,
                    'type': 'Candidature',
                    'description': f"{job_title} chez {company_name} - {app.status}"
                })

            # Generate PDF
            pdf_buffer = generate_candidate_analytics_pdf(stats)
            filename = f"analytics_candidat_{candidate.full_name}_{datetime.now().strftime('%Y%m%d')}.pdf"

        elif user.role == 'company':
            company = user.company
            if not company:
                return error_response("Profil entreprise non trouvé", 404)

            # Gather company stats for PDF
            stats = {
                'company_info': {
                    'name': company.name or 'N/A',
                    'email': company.email or 'N/A',
                    'phone': company.phone or 'N/A',
                    'industry': company.industry or 'N/A',
                    'size': company.size or 'N/A',
                    'location': company.location or 'N/A',
                    'website': company.website or 'N/A'
                },
                'global_stats': {
                    'active_jobs': Job.query.filter_by(company_id=company.id, is_active=True).count(),
                    'total_jobs': Job.query.filter_by(company_id=company.id).count(),
                    'total_applications': 0,
                    'pending_applications': 0,
                    'accepted_applications': 0,
                    'rejected_applications': 0,
                    'total_matches': 0,
                    'high_quality_matches': 0,
                    'total_job_views': 0,  # TODO: implement view tracking
                    'conversion_rate': 0
                },
                'top_jobs': [],
                'recent_activity': []
            }

            # Applications stats
            stats['global_stats']['total_applications'] = db.session.query(JobApplication).join(Job).filter(
                Job.company_id == company.id
            ).count()

            stats['global_stats']['pending_applications'] = db.session.query(JobApplication).join(Job).filter(
                Job.company_id == company.id,
                JobApplication.status == 'pending'
            ).count()

            stats['global_stats']['accepted_applications'] = db.session.query(JobApplication).join(Job).filter(
                Job.company_id == company.id,
                JobApplication.status == 'accepted'
            ).count()

            stats['global_stats']['rejected_applications'] = db.session.query(JobApplication).join(Job).filter(
                Job.company_id == company.id,
                JobApplication.status == 'rejected'
            ).count()

            # Matches stats
            stats['global_stats']['total_matches'] = db.session.query(Match).join(Job).filter(
                Job.company_id == company.id
            ).count()

            stats['global_stats']['high_quality_matches'] = db.session.query(Match).join(Job).filter(
                Job.company_id == company.id,
                Match.match_score >= 80
            ).count()

            # Conversion rate
            total_apps = stats['global_stats']['total_applications']
            if total_apps > 0:
                accepted = stats['global_stats']['accepted_applications']
                stats['global_stats']['conversion_rate'] = (accepted / total_apps) * 100

            # Top performing jobs
            top_jobs = db.session.query(
                Job.id,
                Job.title,
                func.count(JobApplication.id).label('applications_count'),
                func.count(Match.id).label('matches_count')
            ).outerjoin(JobApplication).outerjoin(Match).filter(
                Job.company_id == company.id
            ).group_by(Job.id, Job.title).order_by(
                desc('applications_count')
            ).limit(5).all()

            for job in top_jobs:
                stats['top_jobs'].append({
                    'title': job.title,
                    'applications_count': job.applications_count or 0,
                    'matches_count': job.matches_count or 0,
                    'views': 0  # TODO: implement view tracking
                })

            # Recent activity
            recent_applications = db.session.query(JobApplication).join(Job).filter(
                Job.company_id == company.id
            ).order_by(desc(JobApplication.created_at)).limit(10).all()

            for app in recent_applications:
                activity_date = app.created_at.strftime('%d/%m/%Y') if app.created_at else 'N/A'
                candidate_name = app.candidate.full_name if app.candidate else 'N/A'
                job_title = app.job.title if app.job else 'N/A'

                stats['recent_activity'].append({
                    'date': activity_date,
                    'type': 'Candidature reçue',
                    'description': f"{candidate_name} - {job_title}"
                })

            # Generate PDF
            pdf_buffer = generate_company_analytics_pdf(stats)
            filename = f"analytics_entreprise_{company.name}_{datetime.now().strftime('%Y%m%d')}.pdf"

        else:
            return error_response("Rôle utilisateur invalide", 400)

        # Send PDF file
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return error_response(f"Erreur lors de la génération du PDF: {str(e)}", 500)


# Instance globale
analytics_service = None
