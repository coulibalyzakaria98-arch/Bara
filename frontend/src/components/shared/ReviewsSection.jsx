import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, User, Briefcase, MessageSquare, Shield, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI, handleAPIError } from '../../services/api';

const ReviewsSection = ({ entityType, entityId, canReview = false, reviewerId = null }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [entityType, entityId, page]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = entityType === 'candidate'
        ? await reviewsAPI.getCandidateReviews(entityId, page, 5)
        : await reviewsAPI.getCompanyReviews(entityId, page, 5);

      setReviews(response.data.reviews || []);
      setPagination(response.data.pagination);
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reviewsAPI.getStats(entityType, entityId);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const renderStars = (rating, size = 20) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rating ? '#f59e0b' : 'none'}
            color={star <= rating ? '#f59e0b' : '#64748b'}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats || !stats.rating_distribution) return null;

    const total = stats.total_reviews;
    if (total === 0) return null;

    return (
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
          Distribution des notes
        </h4>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.rating_distribution[rating] || 0;
          const percentage = (count / total) * 100;

          return (
            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '80px' }}>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', minWidth: '1rem' }}>{rating}</span>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
              </div>
              <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    transition: 'width 0.5s'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '40px' }}>
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      toast.success('Merci pour votre retour!');
      loadReviews();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p>Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      {stats && stats.total_reviews > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem' }}>
            {/* Average Rating */}
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.5rem' }}>
                {stats.average_rating}
              </div>
              {renderStars(Math.round(stats.average_rating), 24)}
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                {stats.total_reviews} avis
              </p>
            </div>

            {/* Distribution */}
            <div style={{ flex: 1 }}>
              {renderRatingDistribution()}
            </div>
          </div>

          {/* Aspect Averages */}
          {stats.aspect_averages && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                Évaluations détaillées
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {stats.aspect_averages.professionalism > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Professionnalisme</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                        {stats.aspect_averages.professionalism}/5
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.aspect_averages.professionalism / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                    </div>
                  </div>
                )}
                {stats.aspect_averages.communication > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Communication</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                        {stats.aspect_averages.communication}/5
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.aspect_averages.communication / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
                    </div>
                  </div>
                )}
                {stats.aspect_averages.reliability > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Fiabilité</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                        {stats.aspect_averages.reliability}/5
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.aspect_averages.reliability / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                    </div>
                  </div>
                )}
                {stats.aspect_averages.skills > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Compétences</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                        {stats.aspect_averages.skills}/5
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.aspect_averages.skills / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Review Button */}
      {canReview && !showReviewForm && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReviewForm(true)}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <MessageSquare size={18} />
          Laisser un avis
        </motion.button>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            entityType={entityType}
            entityId={entityId}
            onClose={() => setShowReviewForm(false)}
            onSuccess={() => {
              setShowReviewForm(false);
              loadReviews();
              loadStats();
            }}
          />
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Aucun avis pour le moment</p>
          {canReview && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Soyez le premier à laisser un avis!</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onMarkHelpful={handleMarkHelpful}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              style={{
                padding: '0.5rem 1rem',
                background: page === pageNum ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewCard = ({ review, onMarkHelpful }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            {review.reviewer.role === 'candidate' ? <User size={24} /> : <Briefcase size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                {review.reviewer.name || 'Utilisateur'}
              </h4>
              {review.is_verified && (
                <Shield size={16} color="#10b981" title="Évaluation vérifiée" />
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {renderStars(review.rating, 18)}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.75rem' }}>
          {review.title}
        </h5>
      )}

      {/* Comment */}
      {review.comment && (
        <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1rem' }}>
          {review.comment}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => onMarkHelpful(review.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          <ThumbsUp size={14} />
          Utile ({review.helpful_count})
        </button>
      </div>
    </motion.div>
  );
};

const ReviewForm = ({ entityType, entityId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    professionalism: 0,
    communication: 0,
    reliability: 0,
    skills: 0,
    is_public: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.create({
        reviewed_id: entityId,
        reviewed_type: entityType,
        ...formData
      });

      toast.success('Avis publié avec succès!');
      onSuccess();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 20) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rating ? '#f59e0b' : 'none'}
            color={star <= rating ? '#f59e0b' : '#64748b'}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = (currentValue, onChange, label) => {
    const displayRating = hoveredRating || currentValue;

    return (
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>
          {label} {currentValue > 0 && <span style={{ color: '#f59e0b' }}>({currentValue}/5)</span>}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32}
              fill={star <= displayRating ? '#f59e0b' : 'none'}
              color={star <= displayRating ? '#f59e0b' : '#64748b'}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => onChange(star)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '1.5rem'
      }}
    >
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
        Laisser un avis
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Main Rating */}
        {renderInteractiveStars(formData.rating, (rating) => setFormData({ ...formData, rating }), 'Note générale *')}

        {/* Title */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>
            Titre (optionnel)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Résumez votre expérience..."
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>
            Votre avis (optionnel)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Partagez votre expérience en détail..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Detailed Ratings */}
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem' }}>
            Évaluations détaillées (optionnel)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {renderInteractiveStars(formData.professionalism, (rating) => setFormData({ ...formData, professionalism: rating }), 'Professionnalisme')}
            {renderInteractiveStars(formData.communication, (rating) => setFormData({ ...formData, communication: rating }), 'Communication')}
            {renderInteractiveStars(formData.reliability, (rating) => setFormData({ ...formData, reliability: rating }), 'Fiabilité')}
            {renderInteractiveStars(formData.skills, (rating) => setFormData({ ...formData, skills: rating }), 'Compétences')}
          </div>
        </div>

        {/* Public/Private */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
              Rendre cet avis public
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting || formData.rating === 0}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: submitting || formData.rating === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting || formData.rating === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Publication...' : 'Publier l\'avis'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReviewsSection;
