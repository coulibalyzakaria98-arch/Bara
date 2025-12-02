import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsAPI, handleAPIError } from '../../services/api';

const MyApplications = ({ onBack }) => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await applicationsAPI.getMyApplications(filters);
      if (response.success) {
        setApplications(response.data.items || []);
        setStats(response.data.stats || null);
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer votre candidature pour "${jobTitle}" ?`)) {
      return;
    }

    try {
      await applicationsAPI.withdraw(applicationId);
      toast.success('Candidature retirée');
      loadApplications();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'En attente', color: '#f59e0b', icon: <Clock size={14} /> },
      reviewed: { label: 'Examinée', color: '#06b6d4', icon: <Eye size={14} /> },
      accepted: { label: 'Acceptée', color: '#10b981', icon: <CheckCircle size={14} /> },
      rejected: { label: 'Refusée', color: '#ef4444', icon: <XCircle size={14} /> }
    };

    const badge = badges[status] || badges.pending;

    return (
      <div className="status-badge" style={{ background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}40` }}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#06b6d4';
    if (score >= 40) return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <div className="my-applications">
      {/* Header */}
      <div className="applications-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="header-title">
          <h1>📋 Mes Candidatures</h1>
          <p>Suivez l'état de vos candidatures</p>
        </div>

        <div className="placeholder" />
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending || 0}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card reviewed">
            <div className="stat-value">{stats.reviewed || 0}</div>
            <div className="stat-label">Examinées</div>
          </div>
          <div className="stat-card accepted">
            <div className="stat-value">{stats.accepted || 0}</div>
            <div className="stat-label">Acceptées</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{stats.rejected || 0}</div>
            <div className="stat-label">Refusées</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <button
          className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Toutes ({stats?.total || 0})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          En attente ({stats?.pending || 0})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'reviewed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('reviewed')}
        >
          Examinées ({stats?.reviewed || 0})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
          onClick={() => setStatusFilter('accepted')}
        >
          Acceptées ({stats?.accepted || 0})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          Refusées ({stats?.rejected || 0})
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Chargement...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={64} color="#475569" />
            <h3>Aucune candidature</h3>
            <p>
              {statusFilter !== 'all'
                ? `Vous n'avez aucune candidature avec le statut "${statusFilter}"`
                : 'Vous n\'avez pas encore postulé à des offres'}
            </p>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map((app) => {
              const job = app.job;
              const company = app.company;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="application-card"
                >
                  {/* Status */}
                  {getStatusBadge(app.status)}

                  {/* Job Info */}
                  <div className="job-icon">
                    <Briefcase size={28} />
                  </div>

                  <h3>{job?.title || 'Poste'}</h3>

                  {company && (
                    <div className="company-info">
                      <Building size={16} />
                      <span>{company.name}</span>
                    </div>
                  )}

                  {job?.location && (
                    <div className="job-location">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                  )}

                  {/* Match Score */}
                  {app.match_score && (
                    <div className="match-score">
                      <TrendingUp size={16} style={{ color: getScoreColor(app.match_score) }} />
                      <span style={{ color: getScoreColor(app.match_score) }}>
                        {Math.round(app.match_score)}% de correspondance
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="application-dates">
                    <div className="date-item">
                      <Calendar size={14} />
                      <span>Candidature: {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    {app.reviewed_at && (
                      <div className="date-item">
                        <Eye size={14} />
                        <span>Examinée: {new Date(app.reviewed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  {app.cover_letter && (
                    <div className="cover-letter">
                      <strong>Lettre de motivation:</strong>
                      <p>{app.cover_letter.substring(0, 150)}{app.cover_letter.length > 150 ? '...' : ''}</p>
                    </div>
                  )}

                  {/* Company Notes (if any) */}
                  {app.company_notes && app.status !== 'pending' && (
                    <div className="company-notes">
                      <strong>Note de l'entreprise:</strong>
                      <p>{app.company_notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="application-actions">
                    {app.status === 'pending' && (
                      <button
                        className="action-btn delete"
                        onClick={() => handleWithdraw(app.id, job?.title)}
                      >
                        <Trash2 size={16} />
                        Retirer
                      </button>
                    )}
                    {app.status === 'accepted' && (
                      <div className="success-message">
                        🎉 Félicitations ! L'entreprise souhaite vous rencontrer
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .my-applications {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .applications-header {
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
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-card.pending {
          border-color: rgba(245, 158, 11, 0.3);
        }

        .stat-card.reviewed {
          border-color: rgba(6, 182, 212, 0.3);
        }

        .stat-card.accepted {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .stat-card.rejected {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .stat-value {
          font-size: 2rem;
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
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
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
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(139, 92, 246, 0.05);
        }

        .filter-btn.active {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
        }

        .applications-container {
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
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .application-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .application-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-5px);
        }

        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .job-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1rem;
        }

        .application-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1rem 0;
          padding-right: 100px;
        }

        .company-info,
        .job-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .company-info {
          color: #06b6d4;
          font-weight: 500;
        }

        .match-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin: 1rem 0;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .application-dates {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin: 1rem 0;
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .cover-letter,
        .company-notes {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .cover-letter strong,
        .company-notes strong {
          display: block;
          font-size: 0.75rem;
          color: #cbd5e1;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cover-letter p,
        .company-notes p {
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }

        .company-notes {
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .company-notes strong {
          color: #a78bfa;
        }

        .application-actions {
          margin-top: 1rem;
        }

        .action-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        .success-message {
          text-align: center;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          color: #10b981;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .applications-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-title {
            text-align: left;
          }

          .placeholder {
            display: none;
          }

          .applications-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MyApplications;
