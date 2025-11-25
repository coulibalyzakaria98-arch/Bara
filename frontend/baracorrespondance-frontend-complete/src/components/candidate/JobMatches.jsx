import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { matchingAPI, handleAPIError } from '../../services/api';

const JobMatches = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await matchingAPI.getMatchedJobs(10, 40);

      if (response.success) {
        setMatches(response.data.matches || []);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const { message } = handleAPIError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 60) return 'Bon match';
    if (score >= 40) return 'Match partiel';
    return 'Match faible';
  };

  if (loading) {
    return (
      <div className="matches-loading">
        <div className="spinner-large" />
        <p>Recherche des offres correspondantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={loadMatches} className="retry-btn">
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="job-matches">
      <div className="matches-header">
        <div>
          <h3>
            <TrendingUp size={24} />
            Offres correspondantes
          </h3>
          <p>{matches.length} offre{matches.length > 1 ? 's' : ''} correspondent à votre profil</p>
        </div>
        <button onClick={loadMatches} className="refresh-btn">
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <Briefcase size={48} />
          <h4>Aucune offre correspondante</h4>
          <p>Complétez votre profil et ajoutez vos compétences pour voir des offres</p>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="match-card"
            >
              <div className="match-score-badge">
                <div className={`score-circle ${getScoreColor(job.match.overall_score)}`}>
                  <span className="score-value">{Math.round(job.match.overall_score)}%</span>
                </div>
                <span className="score-label">{getScoreLabel(job.match.overall_score)}</span>
              </div>

              <div className="job-info">
                <div className="job-header">
                  {job.company?.logo_url ? (
                    <img src={job.company.logo_url} alt={job.company.name} className="company-logo" />
                  ) : (
                    <div className="company-logo-placeholder">
                      {job.company?.name?.charAt(0) || 'E'}
                    </div>
                  )}
                  <div>
                    <h4>{job.title}</h4>
                    <p className="company-name">{job.company?.name}</p>
                  </div>
                </div>

                <div className="job-meta">
                  <span>
                    <MapPin size={14} />
                    {job.city || job.location || 'Non spécifié'}
                  </span>
                  <span>
                    <Clock size={14} />
                    {job.contract_type || 'CDI'}
                  </span>
                  {job.is_remote && (
                    <span className="remote-badge">Télétravail</span>
                  )}
                </div>

                {/* Match Details */}
                <div className="match-details">
                  <div className="detail-item">
                    <span className="detail-label">Compétences</span>
                    <div className="detail-bar">
                      <div
                        className="detail-fill skills"
                        style={{ width: `${job.match.details.skills_score}%` }}
                      />
                    </div>
                    <span className="detail-value">{Math.round(job.match.details.skills_score)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expérience</span>
                    <div className="detail-bar">
                      <div
                        className="detail-fill experience"
                        style={{ width: `${job.match.details.experience_score}%` }}
                      />
                    </div>
                    <span className="detail-value">{Math.round(job.match.details.experience_score)}%</span>
                  </div>
                </div>

                {/* Matched Skills */}
                {job.match.matched_skills?.length > 0 && (
                  <div className="matched-skills">
                    <span className="skills-label">
                      <CheckCircle size={12} />
                      Compétences correspondantes:
                    </span>
                    <div className="skills-tags">
                      {job.match.matched_skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="skill-tag matched">{skill}</span>
                      ))}
                      {job.match.matched_skills.length > 4 && (
                        <span className="skill-tag more">+{job.match.matched_skills.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {job.match.missing_skills?.length > 0 && (
                  <div className="missing-skills">
                    <span className="skills-label">
                      <XCircle size={12} />
                      À développer:
                    </span>
                    <div className="skills-tags">
                      {job.match.missing_skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-tag missing">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="view-job-btn">
                  Voir l'offre
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobMatches;
