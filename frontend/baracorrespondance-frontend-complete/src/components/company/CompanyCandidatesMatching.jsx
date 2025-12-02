import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  MapPin,
  Award,
  Briefcase,
  Star,
  TrendingUp,
  Filter,
  Eye,
  MessageCircle,
  Heart,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { matchesAPI, jobsAPI, handleAPIError } from '../../services/api';
import MatchDetails from '../shared/MatchDetails';

const CompanyCandidatesMatching = ({ onBack }) => {
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // score, date, name
  const [minScore, setMinScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, interested
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  useEffect(() => {
    loadJobs();
    loadMatches();
    loadStats();
  }, [selectedJobId, minScore, statusFilter]);

  const loadJobs = async () => {
    try {
      const response = await jobsAPI.getCompanyJobs();
      if (response.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Erreur chargement jobs:', error);
    }
  };

  const loadMatches = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (minScore > 0) filters.min_score = minScore;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await matchesAPI.getAll(filters);
      if (response.success) {
        let matchesData = response.data.matches || [];

        // Filtrer par job si sélectionné
        if (selectedJobId !== 'all') {
          matchesData = matchesData.filter(m => m.job_id === parseInt(selectedJobId));
        }

        setMatches(matchesData);
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
    if (score >= 90) return '🌟 Excellent';
    if (score >= 80) return '⭐ Très bon';
    if (score >= 70) return '✨ Bon';
    return '👍 Correct';
  };

  const sortedMatches = [...matches].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.match_score - a.match_score;
      case 'date':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'name':
        return (a.candidate?.full_name || '').localeCompare(b.candidate?.full_name || '');
      default:
        return 0;
    }
  });

  // Si un match est sélectionné, afficher les détails
  if (selectedMatchId) {
    return (
      <MatchDetails
        matchId={selectedMatchId}
        userRole="company"
        onBack={() => {
          setSelectedMatchId(null);
          loadMatches();
        }}
      />
    );
  }

  return (
    <div className="company-matching">
      {/* Header */}
      <div className="matching-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="header-title">
          <h1>🎯 Candidats Correspondants</h1>
          <p>Talents détectés automatiquement pour vos offres</p>
        </div>

        <div className="placeholder" />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <TrendingUp size={24} color="#06b6d4" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total_matches || 0}</div>
              <div className="stat-label">Matchs totaux</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Star size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.new_matches || 0}</div>
              <div className="stat-label">Nouveaux</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
              <Heart size={24} color="#ec4899" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.mutual_interest || 0}</div>
              <div className="stat-label">Intérêt mutuel</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          {/* Job Filter */}
          <div className="filter-group">
            <label>
              <Briefcase size={16} />
              Filtrer par offre
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="all">Toutes les offres ({matches.length})</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({matches.filter(m => m.job_id === job.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label>
              <Filter size={16} />
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">Score (décroissant)</option>
              <option value="date">Date (récent)</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>
              <Star size={16} />
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="new">Nouveaux</option>
              <option value="interested">Intéressants</option>
            </select>
          </div>

          {/* Score Filter */}
          <div className="filter-group">
            <label>
              <TrendingUp size={16} />
              Score min: {minScore}%
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
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="candidates-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Chargement des candidats...</p>
          </div>
        ) : sortedMatches.length === 0 ? (
          <div className="empty-state">
            <User size={64} color="#475569" />
            <h3>Aucun candidat trouvé</h3>
            <p>
              {selectedJobId !== 'all'
                ? 'Aucun candidat ne correspond à cette offre pour le moment'
                : 'Créez des offres d\'emploi pour commencer à recevoir des matchs automatiques'}
            </p>
          </div>
        ) : (
          <div className="candidates-grid">
            {sortedMatches.map((match) => {
              const candidate = match.candidate;
              const job = match.job;
              const grade = getScoreGrade(match.match_score);

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="candidate-card"
                >
                  {/* Score Badge */}
                  <div
                    className="match-score-badge"
                    style={{ background: getScoreColor(match.match_score) }}
                  >
                    <span className="score-value">{Math.round(match.match_score)}%</span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    className={`favorite-btn ${match.is_favorite_company ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(match.id, match.is_favorite_company)}
                  >
                    <Heart
                      size={20}
                      fill={match.is_favorite_company ? 'currentColor' : 'none'}
                    />
                  </button>

                  {/* Candidate Info */}
                  <div className="candidate-avatar">
                    <User size={32} />
                  </div>

                  <h3>{candidate?.full_name || 'Candidat'}</h3>
                  <p className="candidate-title">{candidate?.title || 'Profil professionnel'}</p>

                  <div className="candidate-meta">
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{candidate?.location || 'Non spécifié'}</span>
                    </div>
                    {candidate?.experience_years && (
                      <div className="meta-item">
                        <Briefcase size={14} />
                        <span>{candidate.experience_years} ans d'exp.</span>
                      </div>
                    )}
                    {candidate?.education_level && (
                      <div className="meta-item">
                        <Award size={14} />
                        <span>{candidate.education_level}</span>
                      </div>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="match-job">
                    <strong>Pour :</strong> {job?.title}
                  </div>

                  {/* Match Grade */}
                  <div className="match-grade">{grade}</div>

                  {/* Match Reasons */}
                  {match.match_reasons && match.match_reasons.length > 0 && (
                    <div className="match-reasons">
                      {match.match_reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="reason-item">
                          ✓ {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Match */}
                  {match.match_details?.skills_match?.matched_skills && (
                    <div className="matched-skills">
                      {match.match_details.skills_match.matched_skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                      {match.match_details.skills_match.matched_skills.length > 3 && (
                        <span className="skill-tag">+{match.match_details.skills_match.matched_skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="candidate-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => setSelectedMatchId(match.id)}
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleAction(match.id, 'interested')}
                    >
                      <CheckCircle size={16} />
                      Intéressé
                    </button>
                  </div>

                  {/* Mutual Interest Badge */}
                  {match.is_mutual_interest && (
                    <div className="mutual-badge">
                      💜 Intérêt mutuel
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .company-matching {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .matching-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 2rem;
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

        .header-title {
          flex: 1;
          text-align: center;
        }

        .header-title h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .header-title p {
          color: #94a3b8;
          margin: 0;
        }

        .placeholder {
          width: 150px;
        }

        .stats-row {
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

        .filters-section {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #cbd5e1;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #06b6d4;
        }

        .score-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
        }

        .score-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
        }

        .score-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
        }

        .candidates-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-state p,
        .empty-state p {
          color: #94a3b8;
          margin-top: 1rem;
          max-width: 500px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 1rem 0 0.5rem 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .candidates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .candidate-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .candidate-card:hover {
          border-color: rgba(6, 182, 212, 0.3);
          transform: translateY(-5px);
        }

        .match-score-badge {
          position: absolute;
          top: -10px;
          right: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .score-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
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

        .candidate-avatar {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
        }

        .candidate-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin: 0 0 0.5rem 0;
        }

        .candidate-title {
          text-align: center;
          font-size: 0.875rem;
          color: #06b6d4;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .candidate-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .match-job {
          padding: 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 8px;
          font-size: 0.875rem;
          color: #06b6d4;
          margin-bottom: 0.75rem;
        }

        .match-job strong {
          color: #67e8f9;
        }

        .match-grade {
          text-align: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: #10b981;
          margin-bottom: 1rem;
        }

        .match-reasons {
          margin-bottom: 1rem;
        }

        .reason-item {
          font-size: 0.875rem;
          color: #10b981;
          padding: 0.25rem 0;
        }

        .matched-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 6px;
          font-size: 0.75rem;
          color: #a78bfa;
        }

        .candidate-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
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
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: white;
        }

        .action-btn.secondary {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .mutual-badge {
          text-align: center;
          padding: 0.75rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 10px;
          color: #ec4899;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .matching-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-title {
            text-align: left;
          }

          .placeholder {
            display: none;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .candidates-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyCandidatesMatching;
