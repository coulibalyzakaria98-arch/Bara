"""
================================================================
Routes Skill Tests - BaraCorrespondance AI
================================================================
API pour les tests de compétences
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc
from datetime import datetime

from app import db
from app.models import User, Candidate, SkillTest, TestResult
from app.utils.helpers import success_response, error_response, safe_int

skill_tests_bp = Blueprint('skill_tests', __name__)


@skill_tests_bp.route('', methods=['GET'])
def get_tests():
    """
    Liste tous les tests disponibles

    Query params:
        - skill_category: Filtrer par catégorie
        - difficulty: Filtrer par difficulté
        - page: Numéro de page
        - per_page: Nombre de résultats par page
    """
    skill_category = request.args.get('skill_category')
    difficulty = request.args.get('difficulty')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = SkillTest.query.filter_by(is_active=True)

    if skill_category:
        query = query.filter_by(skill_category=skill_category)

    if difficulty:
        query = query.filter_by(difficulty=difficulty)

    query = query.order_by(desc(SkillTest.created_at))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    tests = [{
        **test.to_dict(include_answers=False),
        'completion_count': test.completion_count,
        'pass_rate': test.pass_rate,
        'average_score': test.average_score
    } for test in pagination.items]

    return success_response({
        'tests': tests,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'total_items': pagination.total
        }
    })


@skill_tests_bp.route('/<int:test_id>', methods=['GET'])
def get_test(test_id):
    """Obtenir les détails d'un test (sans les réponses correctes)"""
    test = SkillTest.query.get(test_id)

    if not test:
        return error_response("Test non trouvé", 404)

    if not test.is_active:
        return error_response("Test non disponible", 404)

    return success_response({
        **test.to_dict(include_answers=False),
        'completion_count': test.completion_count,
        'pass_rate': test.pass_rate,
        'average_score': test.average_score
    })


@skill_tests_bp.route('/<int:test_id>/start', methods=['POST'])
@jwt_required()
def start_test(test_id):
    """
    Commencer un test

    Retourne les questions sans les réponses correctes
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent passer les tests", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    test = SkillTest.query.get(test_id)

    if not test:
        return error_response("Test non trouvé", 404)

    if not test.is_active:
        return error_response("Test non disponible", 404)

    # Vérifier si le candidat a déjà passé ce test
    existing_result = TestResult.query.filter_by(
        candidate_id=user.candidate.id,
        test_id=test_id
    ).first()

    if existing_result:
        return error_response("Vous avez déjà passé ce test", 400)

    # Retourner le test avec les questions (sans réponses)
    return success_response({
        'test': test.to_dict(include_answers=False),
        'started_at': datetime.utcnow().isoformat()
    })


@skill_tests_bp.route('/<int:test_id>/submit', methods=['POST'])
@jwt_required()
def submit_test(test_id):
    """
    Soumettre les réponses d'un test

    Body:
        - answers: Liste des réponses [{"question_id": 0, "answer": 2}, ...]
        - started_at: Timestamp de début
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent passer les tests", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    test = SkillTest.query.get(test_id)

    if not test:
        return error_response("Test non trouvé", 404)

    data = request.get_json()

    if not data.get('answers'):
        return error_response("Réponses manquantes", 400)

    # Vérifier si déjà passé
    existing_result = TestResult.query.filter_by(
        candidate_id=user.candidate.id,
        test_id=test_id
    ).first()

    if existing_result:
        return error_response("Vous avez déjà passé ce test", 400)

    # Corriger les réponses
    answers_data = data['answers']
    corrected_answers = []
    points_earned = 0
    points_total = 0

    for answer in answers_data:
        question_id = answer['question_id']
        user_answer = answer['answer']

        if question_id < len(test.questions):
            question = test.questions[question_id]
            correct_answer = question.get('correct_answer')
            points = question.get('points', 10)
            is_correct = user_answer == correct_answer

            points_total += points
            if is_correct:
                points_earned += points

            corrected_answers.append({
                'question_id': question_id,
                'answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'points': points if is_correct else 0
            })

    # Calculer le score (%)
    score = round((points_earned / points_total) * 100) if points_total > 0 else 0
    passed = score >= test.pass_score

    # Calculer la durée
    started_at = datetime.fromisoformat(data.get('started_at', datetime.utcnow().isoformat()))
    completed_at = datetime.utcnow()
    duration_seconds = int((completed_at - started_at).total_seconds())

    # Créer le résultat
    result = TestResult(
        candidate_id=user.candidate.id,
        test_id=test_id,
        score=score,
        points_earned=points_earned,
        points_total=points_total,
        passed=passed,
        answers=corrected_answers,
        started_at=started_at,
        completed_at=completed_at,
        duration_seconds=duration_seconds
    )

    db.session.add(result)
    db.session.commit()

    return success_response({
        'result': result.to_dict(include_answers=True),
        'message': 'Félicitations, vous avez réussi le test!' if passed else 'Test non réussi, continuez à vous entraîner!'
    }, status_code=201)


@skill_tests_bp.route('/results', methods=['GET'])
@jwt_required()
def get_my_results():
    """Obtenir tous mes résultats de tests"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'candidate':
        return error_response("Seuls les candidats peuvent voir leurs résultats", 403)

    if not user.candidate:
        return error_response("Profil candidat non trouvé", 404)

    results = TestResult.query.filter_by(
        candidate_id=user.candidate.id
    ).order_by(desc(TestResult.completed_at)).all()

    # Stats globales
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r.passed)
    average_score = sum(r.score for r in results) / total_tests if total_tests > 0 else 0

    return success_response({
        'results': [r.to_dict(include_answers=True) for r in results],
        'stats': {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': total_tests - passed_tests,
            'average_score': round(average_score, 1),
            'pass_rate': round((passed_tests / total_tests) * 100, 1) if total_tests > 0 else 0
        }
    })


@skill_tests_bp.route('/results/<int:result_id>', methods=['GET'])
@jwt_required()
def get_result(result_id):
    """Obtenir les détails d'un résultat"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    result = TestResult.query.get(result_id)

    if not result:
        return error_response("Résultat non trouvé", 404)

    # Vérifier les permissions
    if user.role == 'candidate':
        if not user.candidate or result.candidate_id != user.candidate.id:
            return error_response("Accès refusé", 403)
    elif user.role == 'company':
        # Les entreprises peuvent voir les résultats des candidats
        pass
    else:
        return error_response("Accès refusé", 403)

    return success_response(result.to_dict(include_answers=True))


@skill_tests_bp.route('/categories', methods=['GET'])
def get_categories():
    """Obtenir toutes les catégories de compétences disponibles"""
    categories = db.session.query(SkillTest.skill_category).filter_by(is_active=True).distinct().all()

    return success_response({
        'categories': [cat[0] for cat in categories]
    })


@skill_tests_bp.route('/candidate/<int:candidate_id>/results', methods=['GET'])
@jwt_required()
def get_candidate_results(candidate_id):
    """Obtenir les résultats d'un candidat (pour les entreprises)"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Seules les entreprises peuvent voir les résultats des candidats", 403)

    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("Candidat non trouvé", 404)

    results = TestResult.query.filter_by(candidate_id=candidate_id).order_by(desc(TestResult.completed_at)).all()

    # Stats
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r.passed)
    average_score = sum(r.score for r in results) / total_tests if total_tests > 0 else 0

    return success_response({
        'candidate': {
            'id': candidate.id,
            'name': candidate.full_name,
            'avatar_url': candidate.avatar_url
        },
        'results': [r.to_dict(include_answers=False) for r in results],  # Sans les détails des réponses
        'stats': {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'average_score': round(average_score, 1),
            'pass_rate': round((passed_tests / total_tests) * 100, 1) if total_tests > 0 else 0
        }
    })


# ================================================================
# ROUTES ADMIN (Création/Modification de tests)
# ================================================================

@skill_tests_bp.route('/admin', methods=['POST'])
@jwt_required()
def create_test():
    """
    Créer un nouveau test (admin uniquement)

    Body:
        - title: Titre du test
        - description: Description
        - skill_category: Catégorie
        - difficulty: Difficulté
        - questions: Liste des questions
        - duration_minutes: Durée
        - pass_score: Score minimum
    """
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    # TODO: Vérifier les permissions admin
    # Pour l'instant, seules les entreprises peuvent créer des tests
    if not user or user.role != 'company':
        return error_response("Seules les entreprises peuvent créer des tests", 403)

    data = request.get_json()

    # Validation
    required_fields = ['title', 'skill_category', 'difficulty', 'questions']
    for field in required_fields:
        if not data.get(field):
            return error_response(f"{field} est requis", 400)

    # Créer le test
    test = SkillTest(
        title=data['title'],
        description=data.get('description'),
        skill_category=data['skill_category'],
        difficulty=data['difficulty'],
        questions=data['questions'],
        duration_minutes=data.get('duration_minutes', 30),
        pass_score=data.get('pass_score', 70),
        created_by=user_id
    )

    db.session.add(test)
    db.session.commit()

    return success_response(test.to_dict(include_answers=True), "Test créé avec succès", 201)


@skill_tests_bp.route('/admin/<int:test_id>', methods=['PUT'])
@jwt_required()
def update_test(test_id):
    """Modifier un test (admin uniquement)"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Seules les entreprises peuvent modifier des tests", 403)

    test = SkillTest.query.get(test_id)

    if not test:
        return error_response("Test non trouvé", 404)

    # Vérifier que c'est le créateur
    if test.created_by != user_id:
        return error_response("Vous ne pouvez modifier que vos propres tests", 403)

    data = request.get_json()

    # Update fields
    if 'title' in data:
        test.title = data['title']
    if 'description' in data:
        test.description = data['description']
    if 'skill_category' in data:
        test.skill_category = data['skill_category']
    if 'difficulty' in data:
        test.difficulty = data['difficulty']
    if 'questions' in data:
        test.questions = data['questions']
    if 'duration_minutes' in data:
        test.duration_minutes = data['duration_minutes']
    if 'pass_score' in data:
        test.pass_score = data['pass_score']
    if 'is_active' in data:
        test.is_active = data['is_active']

    db.session.commit()

    return success_response(test.to_dict(include_answers=True), "Test mis à jour avec succès")


@skill_tests_bp.route('/admin/<int:test_id>', methods=['DELETE'])
@jwt_required()
def delete_test(test_id):
    """Supprimer un test (admin uniquement)"""
    user_id = safe_int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'company':
        return error_response("Seules les entreprises peuvent supprimer des tests", 403)

    test = SkillTest.query.get(test_id)

    if not test:
        return error_response("Test non trouvé", 404)

    if test.created_by != user_id:
        return error_response("Vous ne pouvez supprimer que vos propres tests", 403)

    db.session.delete(test)
    db.session.commit()

    return success_response(None, "Test supprimé avec succès")
