import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Download,
  Share2,
  Eye,
  Trash2,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Palette,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { postersAPI, jobsAPI, handleAPIError } from '../../services/api';

const PosterGenerator = ({ user, onBack }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);

  // Configuration du poster
  const [posterConfig, setPosterConfig] = useState({
    style: 'modern',
    color_scheme: 'blue',
    template_type: 'gradient',
    include_logo: true,
    include_qr_code: false
  });

  // Styles disponibles
  const styles = [
    { id: 'modern', name: 'Moderne', icon: '✨' },
    { id: 'classic', name: 'Classique', icon: '📋' },
    { id: 'creative', name: 'Créatif', icon: '🎨' },
    { id: 'minimal', name: 'Minimaliste', icon: '⚪' },
    { id: 'professional', name: 'Professionnel', icon: '💼' }
  ];

  // Schémas de couleurs
  const colorSchemes = [
    { id: 'blue', name: 'Bleu', color: '#06b6d4' },
    { id: 'purple', name: 'Violet', color: '#8b5cf6' },
    { id: 'green', name: 'Vert', color: '#10b981' },
    { id: 'orange', name: 'Orange', color: '#f59e0b' },
    { id: 'red', name: 'Rouge', color: '#ef4444' }
  ];

  // Templates
  const templates = [
    { id: 'gradient', name: 'Gradient', desc: 'Dégradé moderne' },
    { id: 'split', name: 'Split', desc: 'Division 2 sections' },
    { id: 'minimal', name: 'Minimal', desc: 'Design épuré' }
  ];

  useEffect(() => {
    loadJobs();
    loadPosters();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobsAPI.list({ is_active: true });
      if (response.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Erreur chargement jobs:', error);
    }
  };

  const loadPosters = async () => {
    setLoading(true);
    try {
      const response = await postersAPI.getAll();
      if (response.success) {
        setPosters(response.data.posters || []);
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedJob) {
      toast.error('Veuillez sélectionner une offre d\'emploi');
      return;
    }

    setGenerating(true);
    toast.loading('Génération de l\'affiche en cours...', { id: 'generate' });

    try {
      const response = await postersAPI.generate({
        job_id: selectedJob.id,
        ...posterConfig
      });

      if (response.success) {
        toast.success('Affiche générée avec succès!', { id: 'generate' });
        setSelectedPoster(response.data.poster);
        loadPosters();
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message, { id: 'generate' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (poster) => {
    const url = postersAPI.getDownloadUrl(poster.id);
    window.open(url, '_blank');
    toast.success('Téléchargement démarré');
  };

  const handleDelete = async (posterId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette affiche ?')) return;

    try {
      await postersAPI.delete(posterId);
      toast.success('Affiche supprimée');
      setPosters(posters.filter(p => p.id !== posterId));
      if (selectedPoster?.id === posterId) {
        setSelectedPoster(null);
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    }
  };

  const handleView = (poster) => {
    setSelectedPoster(poster);
  };

  return (
    <div className="poster-generator-page">
      {/* Header */}
      <div className="poster-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <div>
          <h1>Générateur d'Affiches IA</h1>
          <p>Créez des affiches professionnelles pour vos offres d'emploi</p>
        </div>
      </div>

      <div className="poster-content">
        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="poster-config-panel"
        >
          <h3>Configuration</h3>

          {/* Sélection du job */}
          <div className="config-section">
            <label>Offre d'emploi</label>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const job = jobs.find(j => j.id === parseInt(e.target.value));
                setSelectedJob(job);
              }}
              className="job-select"
            >
              <option value="">Sélectionnez une offre</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.city}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div className="config-section">
            <label>
              <Sparkles size={16} />
              Style
            </label>
            <div className="options-grid">
              {styles.map(style => (
                <button
                  key={style.id}
                  className={`option-btn ${posterConfig.style === style.id ? 'active' : ''}`}
                  onClick={() => setPosterConfig({ ...posterConfig, style: style.id })}
                >
                  <span className="option-icon">{style.icon}</span>
                  <span className="option-name">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div className="config-section">
            <label>
              <Palette size={16} />
              Couleurs
            </label>
            <div className="color-options">
              {colorSchemes.map(scheme => (
                <button
                  key={scheme.id}
                  className={`color-btn ${posterConfig.color_scheme === scheme.id ? 'active' : ''}`}
                  onClick={() => setPosterConfig({ ...posterConfig, color_scheme: scheme.id })}
                  style={{ background: scheme.color }}
                  title={scheme.name}
                >
                  {posterConfig.color_scheme === scheme.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="config-section">
            <label>
              <Layout size={16} />
              Template
            </label>
            <div className="template-options">
              {templates.map(template => (
                <button
                  key={template.id}
                  className={`template-btn ${posterConfig.template_type === template.id ? 'active' : ''}`}
                  onClick={() => setPosterConfig({ ...posterConfig, template_type: template.id })}
                >
                  <strong>{template.name}</strong>
                  <span>{template.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="config-section">
            <label>Options</label>
            <div className="checkbox-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={posterConfig.include_logo}
                  onChange={(e) => setPosterConfig({ ...posterConfig, include_logo: e.target.checked })}
                />
                <span>Inclure le logo</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={posterConfig.include_qr_code}
                  onChange={(e) => setPosterConfig({ ...posterConfig, include_qr_code: e.target.checked })}
                />
                <span>Inclure un QR code</span>
              </label>
            </div>
          </div>

          {/* Bouton Générer */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="generate-btn"
            onClick={handleGenerate}
            disabled={!selectedJob || generating}
          >
            {generating ? (
              <>
                <div className="spinner" />
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Générer l'affiche
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Preview/Gallery */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="poster-preview-panel"
        >
          {selectedPoster ? (
            <div className="poster-preview">
              <div className="preview-header">
                <h3>Aperçu</h3>
                <button
                  className="close-preview-btn"
                  onClick={() => setSelectedPoster(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="preview-image">
                <img
                  src={postersAPI.getViewUrl(selectedPoster.id)}
                  alt={selectedPoster.title}
                />
              </div>
              <div className="preview-info">
                <h4>{selectedPoster.title}</h4>
                <p className="preview-headline">{selectedPoster.ai_headline}</p>
                <p className="preview-tagline">{selectedPoster.ai_tagline}</p>
                <div className="preview-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleDownload(selectedPoster)}
                  >
                    <Download size={18} />
                    Télécharger
                  </button>
                  <button className="action-btn secondary">
                    <Share2 size={18} />
                    Partager
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => handleDelete(selectedPoster.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="posters-gallery">
              <h3>Vos affiches ({posters.length})</h3>
              {loading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Chargement...</p>
                </div>
              ) : posters.length === 0 ? (
                <div className="empty-state">
                  <ImageIcon size={48} />
                  <p>Aucune affiche générée</p>
                  <span>Commencez par sélectionner une offre et générer votre première affiche</span>
                </div>
              ) : (
                <div className="gallery-grid">
                  {posters.map(poster => (
                    <motion.div
                      key={poster.id}
                      whileHover={{ scale: 1.02 }}
                      className="gallery-item"
                      onClick={() => handleView(poster)}
                    >
                      <div className="gallery-thumbnail">
                        <img
                          src={postersAPI.getViewUrl(poster.id)}
                          alt={poster.title}
                        />
                        <div className="gallery-overlay">
                          <Eye size={24} />
                        </div>
                      </div>
                      <div className="gallery-info">
                        <h4>{poster.title}</h4>
                        <span className="gallery-date">
                          {new Date(poster.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .poster-generator-page {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .poster-header {
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

        .poster-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .poster-header p {
          color: #94a3b8;
          margin: 0.5rem 0 0 0;
        }

        .poster-content {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
          max-width: 1600px;
        }

        .poster-config-panel,
        .poster-preview-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .poster-config-panel {
          height: fit-content;
        }

        .poster-config-panel h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.5rem 0;
        }

        .config-section {
          margin-bottom: 2rem;
        }

        .config-section label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .job-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .job-select:focus {
          outline: none;
          border-color: #06b6d4;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .option-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s;
        }

        .option-btn:hover {
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.05);
        }

        .option-btn.active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }

        .option-icon {
          font-size: 1.5rem;
        }

        .option-name {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .color-options {
          display: flex;
          gap: 0.75rem;
        }

        .color-btn {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.active {
          border-color: white;
          box-shadow: 0 0 20px currentColor;
        }

        .template-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .template-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
        }

        .template-btn:hover {
          border-color: rgba(6, 182, 212, 0.3);
        }

        .template-btn.active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
        }

        .template-btn strong {
          color: #e2e8f0;
          font-size: 0.875rem;
        }

        .template-btn span {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .checkbox-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #cbd5e1;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .generate-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .generate-btn:not(:disabled):hover {
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .poster-preview {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .close-preview-btn {
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

        .close-preview-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }

        .preview-image {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
        }

        .preview-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .preview-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-info h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .preview-headline {
          font-size: 1rem;
          color: #06b6d4;
          font-weight: 600;
          margin: 0;
        }

        .preview-tagline {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
        }

        .preview-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1rem;
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
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: #fff;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }

        .action-btn.danger {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          flex: 0;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .posters-gallery h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.5rem 0;
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

        .empty-state svg {
          color: #475569;
          margin-bottom: 1rem;
        }

        .empty-state p {
          font-size: 1.125rem;
          font-weight: 600;
          color: #cbd5e1;
          margin: 0 0 0.5rem 0;
        }

        .empty-state span {
          font-size: 0.875rem;
          color: #64748b;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .gallery-item {
          cursor: pointer;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .gallery-item:hover {
          border-color: rgba(6, 182, 212, 0.3);
          transform: translateY(-5px);
        }

        .gallery-thumbnail {
          position: relative;
          aspect-ratio: 9/16;
          background: rgba(0, 0, 0, 0.2);
        }

        .gallery-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          color: white;
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        .gallery-info {
          padding: 1rem;
        }

        .gallery-info h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 0.5rem 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gallery-date {
          font-size: 0.75rem;
          color: #64748b;
        }

        @media (max-width: 1024px) {
          .poster-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PosterGenerator;
