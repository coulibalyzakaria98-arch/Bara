import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  User,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Heart,
  Mail,
  Phone,
  Globe,
  FileText,
  Target,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { matchesAPI, handleAPIError } from '../../services/api';
import MessageThread from './MessageThread';

const MatchDetails = ({ matchId, userRole, onBack }) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadMatchDetails();
  }, [matchId]);

  const loadMatchDetails = async () => {
    setLoading(true);
    try {
      const response = await matchesAPI.getById(matchId);
      if (response.success) {
        setMatch(response.data);
        setNotes(response.data.notes || '');
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
      onBack?.();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      await matchesAPI.setAction(matchId, action, notes || null);
      toast.success('Action enregistrée');
      loadMatchDetails();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const handleToggleFavorite = async () => {
    const isFavorite = userRole === 'candidate'
      ? match.is_favorite_candidate
      : match.is_favorite_company;

    try {
      await matchesAPI.toggleFavorite(matchId, !isFavorite);
      toast.success(!isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
      loadMatchDetails();
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

  if (loading) {
    return (
      <div className="match-details-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Chargement des détails...</p>
        </div>
        <style jsx>{`
          .match-details-page {
            min-height: 100vh;
            background: #0f172a;
            padding: 2rem;
          }
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem;
          }
          .loading-state p {
            color: #94a3b8;
            margin-top: 1rem;
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
        `}</style>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  const grade = getScoreGrade(match.match_score);
  const isFavorite = userRole === 'candidate'
    ? match.is_favorite_candidate
    : match.is_favorite_company;

  const entity = userRole === 'candidate' ? match.job : match.candidate;
  const scoreBreakdown = match.match_details?.score_breakdown || {};

  return (
    <div className="match-details-page">
      {/* Header */}
      <div className="details-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour aux matchs</span>
        </button>

        <button
          className={`favorite-btn-header ${isFavorite ? 'active' : ''}`}
          onClick={handleToggleFavorite}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          <span>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
        </button>
      </div>

      <div className="details-container">
        {/* Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="score-section"
        >
          <div className="score-hero">
            <div
              className="score-circle"
              style={{ borderColor: getScoreColor(match.match_score) }}
            >
              <div className="score-value">{Math.round(match.match_score)}%</div>
              <div className="score-emoji">{grade.emoji}</div>
            </div>
            <div className="score-info">
              <h1>Match {grade.label}</h1>
              <p>
                {userRole === 'candidate'
                  ? `Cette offre correspond à ${Math.round(match.match_score)}% à votre profil`
                  : `Ce candidat correspond à ${Math.round(match.match_score)}% à vos besoins`}
              </p>
            </div>
          </div>

          {match.is_mutual_interest && (
            <div className="mutual-badge">
              💜 Intérêt mutuel - Les deux parties sont intéressées !
            </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column - Entity Info */}
          <div className="left-column">
            {/* Entity Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="entity-card"
            >
              {userRole === 'candidate' ? (
                // Job Info
                <>
                  <div className="entity-icon job">
                    <Briefcase size={40} />
                  </div>
                  <h2>{entity?.title}</h2>
                  <div className="entity-subtitle">{entity?.company?.name}</div>

                  <div className="entity-meta">
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>{entity?.location || 'Non spécifié'}</span>
                    </div>
                    <div className="meta-item">
                      <FileText size={16} />
                      <span>{entity?.contract_type || 'CDI'}</span>
                    </div>
                    {entity?.salary_range && (
                      <div className="meta-item">
                        <Award size={16} />
                        <span>{entity.salary_range}</span>
                      </div>
                    )}
                  </div>

                  {entity?.description && (
                    <div className="entity-description">
                      <h3>📋 Description du poste</h3>
                      <p>{entity.description}</p>
                    </div>
                  )}

                  {entity?.required_skills && entity.required_skills.length > 0 && (
                    <div className="skills-section">
                      <h3>🎯 Compétences requises</h3>
                      <div className="skills-list">
                        {entity.required_skills.map((skill, idx) => (
                          <span key={idx} className="skill-badge">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Candidate Info
                <>
                  <div className="entity-icon candidate">
                    <User size={40} />
                  </div>
                  <h2>{entity?.full_name}</h2>
                  <div className="entity-subtitle">{entity?.title || 'Candidat'}</div>

                  <div className="entity-meta">
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>{entity?.location || 'Non spécifié'}</span>
                    </div>
                    {entity?.experience_years && (
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{entity.experience_years} ans d'expérience</span>
                      </div>
                    )}
                    {entity?.education_level && (
                      <div className="meta-item">
                        <Award size={16} />
                        <span>{entity.education_level}</span>
                      </div>
                    )}
                  </div>

                  {entity?.bio && (
                    <div className="entity-description">
                      <h3>👤 À propos</h3>
                      <p>{entity.bio}</p>
                    </div>
                  )}

                  {entity?.skills && entity.skills.length > 0 && (
                    <div className="skills-section">
                      <h3>💼 Compétences</h3>
                      <div className="skills-list">
                        {entity.skills.map((skill, idx) => (
                          <span key={idx} className="skill-badge">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Contact Info (if mutual interest) */}
              {match.is_mutual_interest && (
                <div className="contact-section">
                  <h3>📞 Coordonnées</h3>
                  {entity?.email && (
                    <a href={`mailto:${entity.email}`} className="contact-item">
                      <Mail size={16} />
                      <span>{entity.email}</span>
                    </a>
                  )}
                  {entity?.phone && (
                    <a href={`tel:${entity.phone}`} className="contact-item">
                      <Phone size={16} />
                      <span>{entity.phone}</span>
                    </a>
                  )}
                  {entity?.website && (
                    <a href={entity.website} target="_blank" rel="noopener noreferrer" className="contact-item">
                      <Globe size={16} />
                      <span>Site web</span>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Match Analysis */}
          <div className="right-column">
            {/* Score Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="analysis-card"
            >
              <h3>
                <TrendingUp size={20} />
                Analyse détaillée du match
              </h3>

              <div className="score-breakdown">
                {Object.entries(scoreBreakdown).map(([key, value]) => {
                  const labels = {
                    skills: { label: 'Compétences', icon: '🎯', weight: 40 },
                    experience: { label: 'Expérience', icon: '💼', weight: 25 },
                    education: { label: 'Formation', icon: '🎓', weight: 15 },
                    location: { label: 'Localisation', icon: '📍', weight: 10 },
                    keywords: { label: 'Mots-clés', icon: '🔑', weight: 10 }
                  };

                  const info = labels[key] || { label: key, icon: '📊', weight: 0 };
                  const score = typeof value === 'number' ? value : 0;

                  return (
                    <div key={key} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-label">
                          {info.icon} {info.label}
                        </span>
                        <span className="breakdown-weight">
                          {score.toFixed(0)}% (poids: {info.weight}%)
                        </span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{
                            width: `${score}%`,
                            background: getScoreColor(score)
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Match Reasons */}
            {match.match_reasons && match.match_reasons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="analysis-card"
              >
                <h3>
                  <Sparkles size={20} />
                  Pourquoi ce match ?
                </h3>
                <div className="reasons-list">
                  {match.match_reasons.map((reason, idx) => (
                    <div key={idx} className="reason-item">
                      ✓ {reason}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Matched Skills */}
            {match.match_details?.skills_match?.matched_skills && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="analysis-card"
              >
                <h3>
                  <Target size={20} />
                  Compétences correspondantes
                </h3>
                <div className="matched-skills-grid">
                  {match.match_details.skills_match.matched_skills.map((skill, idx) => (
                    <span key={idx} className="matched-skill-tag">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="actions-card"
            >
              <h3>Vos actions</h3>

              <textarea
                className="notes-textarea"
                placeholder="Ajouter des notes sur ce match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />

              <div className="action-buttons">
                <button
                  className="action-btn primary"
                  onClick={() => handleAction('interested')}
                >
                  <CheckCircle size={18} />
                  Marquer comme intéressé
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => handleAction('not_interested')}
                >
                  <XCircle size={18} />
                  Pas intéressé
                </button>
              </div>

              {match.company_action_at || match.candidate_action_at ? (
                <div className="action-history">
                  <h4>Historique</h4>
                  {userRole === 'company' && match.company_action && (
                    <div className="history-item">
                      Vous: {match.company_action === 'interested' ? '✓ Intéressé' : '✗ Pas intéressé'}
                      {match.company_action_at && ` - ${new Date(match.company_action_at).toLocaleDateString()}`}
                    </div>
                  )}
                  {userRole === 'candidate' && match.candidate_action && (
                    <div className="history-item">
                      Vous: {match.candidate_action === 'interested' ? '✓ Intéressé' : '✗ Pas intéressé'}
                      {match.candidate_action_at && ` - ${new Date(match.candidate_action_at).toLocaleDateString()}`}
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>

            {/* Messaging */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="messaging-card"
            >
              <h3>💬 Messagerie</h3>
              <MessageThread
                matchId={matchId}
                userRole={userRole}
                isMutualInterest={match.is_mutual_interest}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .match-details-page {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
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

        .favorite-btn-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s;
        }

        .favorite-btn-header:hover,
        .favorite-btn-header.active {
          color: #ec4899;
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.1);
        }

        .details-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .score-section {
          margin-bottom: 2rem;
        }

        .score-hero {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          margin-bottom: 1rem;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 6px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
        }

        .score-emoji {
          font-size: 1.5rem;
          margin-top: 0.25rem;
        }

        .score-info h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .score-info p {
          color: #94a3b8;
          font-size: 1rem;
          margin: 0;
        }

        .mutual-badge {
          padding: 1rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 16px;
          text-align: center;
          color: #ec4899;
          font-weight: 600;
          font-size: 1rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .entity-card,
        .analysis-card,
        .actions-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .entity-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1.5rem;
        }

        .entity-icon.job {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
        }

        .entity-icon.candidate {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }

        .entity-card h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .entity-subtitle {
          font-size: 1rem;
          color: #06b6d4;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .entity-meta {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .entity-description,
        .skills-section,
        .contact-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .entity-description h3,
        .skills-section h3,
        .contact-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 1rem 0;
        }

        .entity-description p {
          color: #cbd5e1;
          line-height: 1.6;
          margin: 0;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-badge {
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          font-size: 0.875rem;
          color: #a78bfa;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: #06b6d4;
          text-decoration: none;
          transition: all 0.3s;
          margin-bottom: 0.5rem;
        }

        .contact-item:hover {
          background: rgba(6, 182, 212, 0.1);
          transform: translateX(5px);
        }

        .analysis-card h3,
        .actions-card h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 1.5rem 0;
        }

        .score-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .breakdown-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #e2e8f0;
        }

        .breakdown-weight {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .breakdown-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .reasons-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .reason-item {
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.05);
          border-left: 3px solid #10b981;
          border-radius: 8px;
          color: #10b981;
          font-size: 0.875rem;
        }

        .matched-skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .matched-skill-tag {
          padding: 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 8px;
          font-size: 0.875rem;
          color: #06b6d4;
          text-align: center;
        }

        .notes-textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.875rem;
          resize: vertical;
          margin-bottom: 1rem;
          font-family: inherit;
        }

        .notes-textarea:focus {
          outline: none;
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
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

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-history {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-history h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .history-item {
          font-size: 0.875rem;
          color: #cbd5e1;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .messaging-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .messaging-card h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 1.5rem 0;
        }

        @media (max-width: 968px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .score-hero {
            flex-direction: column;
            text-align: center;
          }

          .details-header {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchDetails;
