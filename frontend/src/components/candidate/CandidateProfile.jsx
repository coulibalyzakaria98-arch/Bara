import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Edit3,
  Camera,
  Settings,
  Save,
  X,
  Globe,
  Calendar,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadAPI, handleAPIError } from '../../services/api';

const CandidateProfile = ({ user, onBack, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.profile?.title || '',
    bio: user?.profile?.bio || '',
    city: user?.profile?.city || '',
    country: user?.profile?.country || 'Guinée',
    linkedin_url: user?.profile?.linkedin_url || '',
    portfolio_url: user?.profile?.portfolio_url || '',
    experience_years: user?.profile?.experience_years || 0,
    education_level: user?.profile?.education_level || '',
    skills: user?.profile?.skills || [],
    languages: user?.profile?.languages || []
  });
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to update profile
      if (onUpdateUser) {
        onUpdateUser(formData);
      }
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop volumineuse. Maximum 5MB');
        return;
      }

      const loadingToast = toast.loading('Upload en cours...');

      try {
        const response = await uploadAPI.uploadAvatar(file);

        if (response.success) {
          // Update user with new avatar URL
          if (onUpdateUser) {
            onUpdateUser({ ...user, avatar_url: response.data.avatar_url });
          }
          toast.success('Photo de profil mise à jour', { id: loadingToast });
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        const { message } = handleAPIError(error);
        toast.error(message || 'Erreur lors de l\'upload', { id: loadingToast });
      }
    }
  };

  const ProfileTab = () => (
    <div className="profile-content">
      {/* Photo et infos principales */}
      <div className="profile-header-card">
        <div className="avatar-section">
          <div className="avatar-large">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" />
            ) : (
              <span>{(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}</span>
            )}
            <button
              className="avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="avatar-info">
            <h2>{user?.full_name || user?.email}</h2>
            <p className="title">{formData.title || 'Titre professionnel non défini'}</p>
            <p className="location">
              <MapPin size={14} />
              {formData.city || 'Ville'}, {formData.country}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={16} />
            Modifier
          </button>
        )}
      </div>

      {/* Formulaire d'édition ou affichage */}
      {isEditing ? (
        <div className="edit-form">
          <div className="form-section">
            <h3>Informations personnelles</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+224 XXX XX XX XX"
                />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Conakry"
                />
              </div>
              <div className="form-group">
                <label>Pays</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Guinée"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Informations professionnelles</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Titre professionnel</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Présentez-vous en quelques lignes..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Années d'expérience</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Niveau d'études</label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez...</option>
                  <option value="bac">Baccalauréat</option>
                  <option value="bac+2">Bac+2</option>
                  <option value="bac+3">Licence (Bac+3)</option>
                  <option value="bac+5">Master (Bac+5)</option>
                  <option value="bac+8">Doctorat (Bac+8)</option>
                </select>
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="form-group">
                <label>Portfolio</label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Compétences</h3>
            <div className="skills-input">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une compétence"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button type="button" onClick={handleAddSkill}>Ajouter</button>
            </div>
            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              <X size={16} />
              Annuler
            </button>
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} />
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-details">
          <div className="detail-section">
            <h3><User size={18} /> Informations personnelles</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <Mail size={16} />
                <div>
                  <span className="label">Email</span>
                  <span className="value">{user?.email}</span>
                </div>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <div>
                  <span className="label">Téléphone</span>
                  <span className="value">{formData.phone || 'Non renseigné'}</span>
                </div>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <div>
                  <span className="label">Localisation</span>
                  <span className="value">{formData.city || 'Non renseigné'}, {formData.country}</span>
                </div>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <div>
                  <span className="label">Membre depuis</span>
                  <span className="value">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3><Briefcase size={18} /> Profil professionnel</h3>
            <div className="detail-grid">
              <div className="detail-item full-width">
                <FileText size={16} />
                <div>
                  <span className="label">Bio</span>
                  <span className="value bio">{formData.bio || 'Aucune bio ajoutée'}</span>
                </div>
              </div>
              <div className="detail-item">
                <Award size={16} />
                <div>
                  <span className="label">Expérience</span>
                  <span className="value">{formData.experience_years} ans</span>
                </div>
              </div>
              <div className="detail-item">
                <GraduationCap size={16} />
                <div>
                  <span className="label">Niveau d'études</span>
                  <span className="value">{formData.education_level || 'Non renseigné'}</span>
                </div>
              </div>
              {formData.linkedin_url && (
                <div className="detail-item">
                  <Globe size={16} />
                  <div>
                    <span className="label">LinkedIn</span>
                    <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer">
                      Voir le profil
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {formData.skills.length > 0 && (
            <div className="detail-section">
              <h3><Award size={18} /> Compétences</h3>
              <div className="skills-display">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      // TODO: Call API to change password
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Call API to delete account
      toast.success('Compte supprimé');
      if (onLogout) onLogout();
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
    }
  };

  const SettingsTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3>Préférences de notification</h3>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Notifications par email</span>
            <span className="setting-desc">Recevoir des alertes pour les nouveaux matchs</span>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Profil visible</span>
            <span className="setting-desc">Permettre aux entreprises de voir votre profil</span>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Sécurité</h3>
        <button className="settings-btn" onClick={() => setShowPasswordModal(true)}>
          Changer le mot de passe
        </button>
        <button className="settings-btn danger" onClick={() => setShowDeleteModal(true)}>
          Supprimer mon compte
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Changer le mot de passe</h3>
            <div className="modal-form">
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowPasswordModal(false)}>
                Annuler
              </button>
              <button className="modal-btn confirm" onClick={handlePasswordChange}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Supprimer le compte</h3>
            <p className="modal-warning">
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="modal-btn danger" onClick={handleDeleteAccount}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="nav-brand">
          <h1>Mon Profil</h1>
        </div>

        <button className="settings-icon" onClick={() => setActiveTab(activeTab === 'settings' ? 'profile' : 'settings')}>
          <Settings size={20} />
        </button>
      </nav>

      <div className="profile-container">
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            Profil
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            Paramètres
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="tab-content"
        >
          {activeTab === 'profile' ? <ProfileTab /> : <SettingsTab />}
        </motion.div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #0f172a;
        }

        .profile-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-btn, .settings-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
        }

        .back-btn:hover, .settings-icon:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-brand h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .profile-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .profile-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tab {
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

        .tab.active {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
          color: #06b6d4;
        }

        .profile-content, .settings-content {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .profile-header-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .avatar-large {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          overflow: hidden;
        }

        .avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #06b6d4;
          border: 2px solid #0f172a;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-info h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .avatar-info .title {
          color: #06b6d4;
          font-size: 1rem;
          margin: 0 0 0.5rem 0;
        }

        .avatar-info .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 12px;
          color: #06b6d4;
          cursor: pointer;
          transition: all 0.3s;
        }

        .edit-btn:hover {
          background: rgba(6, 182, 212, 0.3);
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 1rem 0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }

        .detail-item.full-width {
          grid-column: span 2;
        }

        .detail-item svg {
          color: #06b6d4;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .detail-item .label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .detail-item .value {
          display: block;
          font-size: 0.875rem;
          color: #e2e8f0;
        }

        .detail-item .value.bio {
          line-height: 1.6;
        }

        .detail-item a {
          color: #06b6d4;
          text-decoration: none;
        }

        .skills-display {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-badge {
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 8px;
          color: #06b6d4;
          font-size: 0.875rem;
        }

        /* Edit form styles */
        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 1rem 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #94a3b8;
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
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #06b6d4;
        }

        .skills-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .skills-input input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e2e8f0;
        }

        .skills-input button {
          padding: 0.75rem 1rem;
          background: #06b6d4;
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 6px;
          color: #06b6d4;
          font-size: 0.875rem;
        }

        .skill-tag button {
          background: none;
          border: none;
          color: #06b6d4;
          cursor: pointer;
          padding: 0;
          display: flex;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cancel-btn, .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }

        .save-btn {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          color: #fff;
        }

        /* Settings styles */
        .settings-section {
          margin-bottom: 2rem;
        }

        .settings-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 1rem 0;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .setting-label {
          font-size: 0.875rem;
          color: #e2e8f0;
        }

        .setting-desc {
          font-size: 0.75rem;
          color: #64748b;
        }

        .toggle {
          position: relative;
          width: 48px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          transition: 0.3s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle input:checked + .slider {
          background: #06b6d4;
        }

        .toggle input:checked + .slider:before {
          transform: translateX(24px);
        }

        .settings-btn {
          display: block;
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          margin-bottom: 0.75rem;
          transition: all 0.3s;
        }

        .settings-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .settings-btn.danger {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .settings-btn.danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 1rem;
          }

          .profile-header-card {
            flex-direction: column;
            gap: 1rem;
          }

          .avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .form-grid, .detail-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width,
          .detail-item.full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CandidateProfile;
