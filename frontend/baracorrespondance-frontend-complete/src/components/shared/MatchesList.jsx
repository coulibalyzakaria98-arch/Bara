import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  User,
  MapPin,
  Star,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { matchesAPI, handleAPIError } from '../../services/api';
import MatchDetails from './MatchDetails';

const MatchesList = ({ userRole, onBack }) => {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, new, high_score
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    loadMatches();
    loadStats();
  }, [filter, minScore]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const filters = {};

      if (filter === 'new') {
        filters.status = 'new';
      } else if (filter === 'high_score') {
        filters.min_score = 80;
      }

      // Appliquer le filtre de score minimum
      if (minScore > 0) {
        filters.min_score = minScore;
      }

      const response = await matchesAPI.getAll(filters);
      if (response.success) {
        setMatches(response.data.matches || []);
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await matchesAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleAction = async (matchId, action) => {
    try {
      await matchesAPI.setAction(matchId, action);
      toast.success('Action enregistrée');
      loadMatches();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const handleToggleFavorite = async (matchId, currentValue) => {
    try {
      await matchesAPI.toggleFavorite(matchId, !currentValue);
      toast.success(!currentValue ? 'Ajouté aux favoris' : 'Retiré des favoris');
      loadMatches();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#06b6d4';
    if (score >= 70) return '#f59e0b';
    return '#94a3b8';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return { label: 'Excellent', emoji: '🌟' };
    if (score >= 80) return { label: 'Très bon', emoji: '⭐' };
    if (score >= 70) return { label: 'Bon', emoji: '✨' };
    if (score >= 60) return { label: 'Correct', emoji: '👍' };
    return { label: 'Faible', emoji: '💡' };
  };

  // Show details page if a match is selected
  if (selectedMatchId) {
    return (
      <MatchDetails
        matchId={selectedMatchId}
        userRole={userRole}
        onBack={() => {
          setSelectedMatchId(null);
          loadMatches(); // Refresh list in case anything changed
        }}
      />
    );
  }

  return (
    <div className="matches-page">
      {/* Header */}
      <div className="matches-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
        )}
        <div>
          <h1>
            {userRole === 'candidate' ? '🎯 Opportunités correspondantes' : '👥 Candidats correspondants'}
          </h1>
          <p>
            {userRole === 'candidate'
              ? 'Offres d\'emploi qui matchent avec votre profil'
              : 'Talents détectés automatiquement pour vos offres'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-cards">
          <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <TrendingUp size={24} color="#06b6d4" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total_matches}</div>
              <div className="stat-label">Matchs totaux</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Star size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.new_matches}</div>
              <div className="stat-label">Nouveaux</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <Heart size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.mutual_interest || 0}</div>
              <div className="stat-label">Intérêt mutuel</div>
            </div>
          </motion.div>

          {userRole === 'candidate' && stats.average_score && (
            <motion.div whileHover={{ scale: 1.05 }} className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Award size={24} color="#f59e0b" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.average_score}%</div>
                <div className="stat-label">Score moyen</div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="matches-controls">
        <div className="matches-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            Nouveaux
          </button>
          <button
            className={`filter-btn ${filter === 'high_score' ? 'active' : ''}`}
            onClick={() => setFilter('high_score')}
          >
            Meilleurs scores
          </button>
        </div>

        {/* Score Slider */}
        <div className="score-slider-container">
          <label className="slider-label">
            Score minimum: <strong>{minScore}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="score-slider"
          />
          <div className="slider-markers">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="matches-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Chargement des correspondances...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <Star size={64} color="#475569" />
            <h3>Aucune correspondance trouvée</h3>
            <p>
              {userRole === 'candidate'
                ? 'Uploadez votre CV pour découvrir des opportunités qui matchent avec votre profil'
                : 'Publiez des offres d\'emploi pour attirer des candidats qualifiés'}
            </p>
          </div>
        ) : (
          matches.map((match) => {
            const grade = getScoreGrade(match.match_score);
            const isFavorite = userRole === 'candidate'
              ? match.is_favorite_candidate
              : match.is_favorite_company;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="match-card"
              >
                {/* Score Badge */}
                <div
                  className="match-score-badge"
                  style={{ background: getScoreColor(match.match_score) }}
                >
                  <span className="score-value">{Math.round(match.match_score)}%</span>
                  <span className="score-emoji">{grade.emoji}</span>
                </div>

                {/* Favorite Button */}
                <button
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  onClick={() => handleToggleFavorite(match.id, isFavorite)}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>

                {/* Content */}
                <div className="match-content">
                  {userRole === 'candidate' ? (
                    // Pour candidat : afficher le job
                    <>
                      <div className="match-icon">
                        <Briefcase size={32} />
                      </div>
                      <h3>{match.job?.title}</h3>
                      <div className="match-company">{match.job?.company?.name}</div>
                      <div className="match-meta">
                        <span>
                          <MapPin size={14} />
                          {match.job?.location || 'Non spécifié'}
                        </span>
                        <span className="contract-badge">{match.job?.contract_type}</span>
                      </div>
                    </>
                  ) : (
                    // Pour entreprise : afficher le candidat
                    <>
                      <div className="match-icon candidate">
                        <User size={32} />
                      </div>
                      <h3>{match.candidate?.full_name}</h3>
                      <div className="match-company">{match.candidate?.title || 'Candidat'}</div>
                      <div className="match-meta">
                        <span>
                          <MapPin size={14} />
                          {match.candidate?.location || 'Non spécifié'}
                        </span>
                        {match.candidate?.experience_years && (
                          <span>{match.candidate.experience_years} ans d'exp.</span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Match Reasons */}
                  {match.match_reasons && match.match_reasons.length > 0 && (
                    <div className="match-reasons">
                      {match.match_reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="match-reason">
                          ✓ {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Match */}
                  {match.match_details?.skills_match && (
                    <div className="skills-match">
                      <strong>Compétences matchées:</strong>
                      <div className="skills-tags">
                        {match.match_details.skills_match.matched_skills?.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="match-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => handleAction(match.id, 'interested')}
                    >
                      <CheckCircle size={16} />
                      Intéressé
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleAction(match.id, 'not_interested')}
                    >
                      <XCircle size={16} />
                      Passer
                    </button>
                    <button
                      className="action-btn tertiary"
                      onClick={() => setSelectedMatchId(match.id)}
                    >
                      <Eye size={16} />
                      Détails
                    </button>
                  </div>

                  {/* Status */}
                  {match.is_mutual_interest && (
                    <div className="mutual-interest-badge">
                      💜 Intérêt mutuel !
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .matches-page {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .matches-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-5px);
        }

        .matches-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .matches-header p {
          color: #94a3b8;
          margin: 0.5rem 0 0 0;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .matches-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .matches-filters {
          display: flex;
          gap: 1rem;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .filter-btn:hover {
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.05);
        }

        .filter-btn.active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }

        .score-slider-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 250px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .slider-label {
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .slider-label strong {
          color: #06b6d4;
          font-weight: 700;
        }

        .score-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }

        .score-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
        }

        .score-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.6);
        }

        .score-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          cursor: pointer;
          border: none;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
        }

        .score-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.6);
        }

        .slider-markers {
          display: flex;
          justify-content: space-between;
          font-size: 0.625rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 1rem 0 0.5rem 0;
        }

        .empty-state p {
          color: #64748b;
          max-width: 500px;
        }

        .match-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .match-card:hover {
          border-color: rgba(6, 182, 212, 0.3);
          transform: translateY(-5px);
        }

        .match-score-badge {
          position: absolute;
          top: -10px;
          right: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .score-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
        }

        .score-emoji {
          font-size: 1rem;
        }

        .favorite-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .favorite-btn:hover,
        .favorite-btn.active {
          color: #ec4899;
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.1);
        }

        .match-content {
          padding-top: 1rem;
        }

        .match-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1rem;
        }

        .match-icon.candidate {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }

        .match-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .match-company {
          font-size: 0.875rem;
          color: #06b6d4;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .match-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .match-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .contract-badge {
          padding: 0.25rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 6px;
          color: #06b6d4;
        }

        .match-reasons {
          margin: 1rem 0;
        }

        .match-reason {
          font-size: 0.875rem;
          color: #10b981;
          padding: 0.25rem 0;
        }

        .skills-match {
          margin: 1rem 0;
        }

        .skills-match strong {
          font-size: 0.75rem;
          color: #cbd5e1;
          display: block;
          margin-bottom: 0.5rem;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 6px;
          font-size: 0.75rem;
          color: #a78bfa;
        }

        .match-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .action-btn.secondary {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .action-btn.tertiary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .mutual-interest-badge {
          margin-top: 1rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 10px;
          text-align: center;
          color: #ec4899;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .matches-grid {
            grid-template-columns: 1fr;
          }

          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default MatchesList;
