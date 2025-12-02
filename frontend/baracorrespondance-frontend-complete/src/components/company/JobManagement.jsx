import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, handleAPIError } from '../../services/api';

const JobManagement = ({ onBack }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contract_type: 'CDI',
    salary_range: '',
    required_skills: [],
    experience_level: 'Intermédiaire',
    education_level: '',
    is_remote: false,
    sector: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getCompanyJobs();
      if (response.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description) {
      toast.error('Titre et description requis');
      return;
    }

    try {
      if (editingJob) {
        // Update
        await jobsAPI.updateJob(editingJob.id, formData);
        toast.success('Offre mise à jour');
      } else {
        // Create
        await jobsAPI.createJob(formData);
        toast.success('Offre créée avec succès');
      }

      loadJobs();
      handleCloseForm();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      contract_type: job.contract_type || 'CDI',
      salary_range: job.salary_range || '',
      required_skills: job.required_skills || [],
      experience_level: job.experience_level || 'Intermédiaire',
      education_level: job.education_level || '',
      is_remote: job.is_remote || false,
      sector: job.sector || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    try {
      await jobsAPI.deleteJob(jobId);
      toast.success('Offre supprimée');
      loadJobs();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      await jobsAPI.toggleStatus(jobId);
      toast.success(currentStatus ? 'Offre désactivée' : 'Offre activée');
      loadJobs();
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      contract_type: 'CDI',
      salary_range: '',
      required_skills: [],
      experience_level: 'Intermédiaire',
      education_level: '',
      is_remote: false,
      sector: ''
    });
    setSkillInput('');
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="job-management">
      {/* Header */}
      <div className="management-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="header-title">
          <h1>💼 Gestion des Offres d'Emploi</h1>
          <p>Créez et gérez vos offres d'emploi</p>
        </div>

        <button className="create-btn" onClick={() => setShowForm(true)}>
          <Plus size={20} />
          <span>Nouvelle offre</span>
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="job-form-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingJob ? 'Modifier l\'offre' : 'Créer une offre'}</h2>
                <button className="close-btn" onClick={handleCloseForm}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="job-form">
                <div className="form-grid">
                  {/* Titre */}
                  <div className="form-group full-width">
                    <label>Titre du poste *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Développeur Full Stack"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez le poste, les missions, l'environnement de travail..."
                      rows={6}
                      required
                    />
                  </div>

                  {/* Localisation */}
                  <div className="form-group">
                    <label>Localisation</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Paris, France"
                    />
                  </div>

                  {/* Type de contrat */}
                  <div className="form-group">
                    <label>Type de contrat</label>
                    <select
                      value={formData.contract_type}
                      onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Stage">Stage</option>
                      <option value="Alternance">Alternance</option>
                    </select>
                  </div>

                  {/* Salaire */}
                  <div className="form-group">
                    <label>Fourchette de salaire</label>
                    <input
                      type="text"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      placeholder="Ex: 45K - 60K €"
                    />
                  </div>

                  {/* Niveau d'expérience */}
                  <div className="form-group">
                    <label>Niveau d'expérience</label>
                    <select
                      value={formData.experience_level}
                      onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    >
                      <option value="Débutant">Débutant (0-2 ans)</option>
                      <option value="Intermédiaire">Intermédiaire (2-5 ans)</option>
                      <option value="Confirmé">Confirmé (5-10 ans)</option>
                      <option value="Expert">Expert (10+ ans)</option>
                    </select>
                  </div>

                  {/* Niveau d'éducation */}
                  <div className="form-group">
                    <label>Niveau d'éducation</label>
                    <input
                      type="text"
                      value={formData.education_level}
                      onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                      placeholder="Ex: Bac+5, Master"
                    />
                  </div>

                  {/* Secteur */}
                  <div className="form-group">
                    <label>Secteur d'activité</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      placeholder="Ex: Tech, Finance, Santé"
                    />
                  </div>

                  {/* Télétravail */}
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_remote}
                        onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                      />
                      <span>Télétravail possible</span>
                    </label>
                  </div>

                  {/* Compétences requises */}
                  <div className="form-group full-width">
                    <label>Compétences requises</label>
                    <div className="skills-input">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Tapez une compétence et appuyez sur Entrée"
                      />
                      <button type="button" onClick={handleAddSkill} className="add-skill-btn">
                        Ajouter
                      </button>
                    </div>
                    <div className="skills-list">
                      {formData.required_skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCloseForm} className="cancel-btn">
                    Annuler
                  </button>
                  <button type="submit" className="submit-btn">
                    <Save size={18} />
                    <span>{editingJob ? 'Mettre à jour' : 'Créer l\'offre'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs List */}
      <div className="jobs-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Chargement...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={64} color="#475569" />
            <h3>Aucune offre d'emploi</h3>
            <p>Créez votre première offre pour commencer à attirer des talents</p>
            <button className="create-first-btn" onClick={() => setShowForm(true)}>
              <Plus size={20} />
              Créer ma première offre
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`job-card ${!job.is_active ? 'inactive' : ''}`}
              >
                {/* Status Badge */}
                <div className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                  {job.is_active ? '✓ Active' : '○ Inactive'}
                </div>

                <h3>{job.title}</h3>
                <p className="job-description">{job.description?.substring(0, 150)}...</p>

                <div className="job-meta">
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{job.location || 'Non spécifié'}</span>
                  </div>
                  <div className="meta-item">
                    <Briefcase size={16} />
                    <span>{job.contract_type}</span>
                  </div>
                  {job.salary_range && (
                    <div className="meta-item">
                      <DollarSign size={16} />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="job-skills">
                    {job.required_skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-badge">{skill}</span>
                    ))}
                    {job.required_skills.length > 3 && (
                      <span className="skill-badge">+{job.required_skills.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="job-stats">
                  <div className="stat">
                    <Users size={16} />
                    <span>{job.applications_count || 0} candidatures</span>
                  </div>
                  <div className="stat">
                    <TrendingUp size={16} />
                    <span>{job.matches_count || 0} matchs</span>
                  </div>
                </div>

                <div className="job-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleToggleStatus(job.id, job.is_active)}
                    title={job.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {job.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleEdit(job)}
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(job.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="job-footer">
                  <small>Créée le {new Date(job.created_at).toLocaleDateString()}</small>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .job-management {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .management-header {
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

        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .job-form-modal {
          background: #1e293b;
          border-radius: 24px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .job-form {
          padding: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #cbd5e1;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.875rem;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        .skills-input {
          display: flex;
          gap: 0.5rem;
        }

        .skills-input input {
          flex: 1;
        }

        .add-skill-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #a78bfa;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .add-skill-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .skill-tag {
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          color: #a78bfa;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .skill-tag button {
          background: none;
          border: none;
          color: #a78bfa;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          padding: 0;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }

        .submit-btn {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          color: white;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .jobs-container {
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

        .create-first-btn {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .create-first-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .job-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .job-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-5px);
        }

        .job-card.inactive {
          opacity: 0.6;
        }

        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.inactive {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .job-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.75rem 0;
          padding-right: 80px;
        }

        .job-description {
          color: #cbd5e1;
          font-size: 0.875rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .job-meta {
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

        .job-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .skill-badge {
          padding: 0.25rem 0.75rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 6px;
          font-size: 0.75rem;
          color: #a78bfa;
        }

        .job-stats {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #cbd5e1;
        }

        .job-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          color: #a78bfa;
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .job-footer {
          text-align: center;
        }

        .job-footer small {
          color: #64748b;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .management-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-title {
            text-align: left;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default JobManagement;
