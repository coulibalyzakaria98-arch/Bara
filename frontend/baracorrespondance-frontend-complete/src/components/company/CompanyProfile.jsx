import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Calendar,
  Edit3,
  Camera,
  Settings,
  Save,
  X,
  Briefcase,
  FileText,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadAPI, handleAPIError } from '../../services/api';

const CompanyProfile = ({ user, onBack, onUpdateUser, onLogout }) => {
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
    company_name: user?.profile?.name || user?.company_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    description: user?.profile?.description || '',
    website: user?.profile?.website || '',
    city: user?.profile?.city || '',
    country: user?.profile?.country || 'Guinée',
    industry: user?.profile?.industry || '',
    company_size: user?.profile?.company_size || '',
    founded_year: user?.profile?.founded_year || '',
    linkedin_url: user?.profile?.linkedin_url || '',
    benefits: user?.profile?.benefits || []
  });
  const [newBenefit, setNewBenefit] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to update profile
      if (onUpdateUser) {
        onUpdateUser(formData);
      }
      setIsEditing(false);
      toast.success('Profil entreprise mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop volumineuse. Maximum 5MB');
        return;
      }

      const loadingToast = toast.loading('Upload en cours...');

      try {
        const response = await uploadAPI.uploadLogo(file);

        if (response.success) {
          // Update user with new logo URL
          if (onUpdateUser) {
            const updatedUser = {
              ...user,
              profile: {
                ...user.profile,
                logo_url: response.data.logo_url
              }
            };
            onUpdateUser(updatedUser);
          }
          toast.success('Logo mis à jour', { id: loadingToast });
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
      {/* Logo et infos principales */}
      <div className="profile-header-card">
        <div className="avatar-section">
          <div className="avatar-large company">
            {user?.profile?.logo_url ? (
              <img src={user.profile.logo_url} alt="Logo" />
            ) : (
              <Building2 size={48} />
            )}
            {isEditing && (
              <button
                className="avatar-edit-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          {!isEditing ? (
            <div className="user-info">
              <h2>{formData.company_name || 'Nom de l\'entreprise'}</h2>
              <p className="user-title">{formData.industry || 'Secteur d\'activité'}</p>
              <p className="user-location">
                <MapPin size={14} />
                {formData.city || 'Ville'}, {formData.country}
              </p>
            </div>
          ) : (
            <div className="user-info-edit">
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Nom de l'entreprise"
                className="edit-input large"
              />
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Secteur d'activité"
                className="edit-input"
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={16} />
            Modifier le profil
          </button>
        )}
      </div>

      {/* Informations détaillées */}
      <div className="profile-details-grid">
        {/* Contact */}
        <div className="profile-card">
          <h3><Mail size={18} /> Contact</h3>
          {!isEditing ? (
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{formData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Téléphone</span>
                <span className="info-value">{formData.phone || 'Non renseigné'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Site web</span>
                <span className="info-value">{formData.website || 'Non renseigné'}</span>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="edit-input"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Téléphone"
                className="edit-input"
              />
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Site web"
                className="edit-input"
              />
            </div>
          )}
        </div>

        {/* Localisation */}
        <div className="profile-card">
          <h3><MapPin size={18} /> Localisation</h3>
          {!isEditing ? (
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Ville</span>
                <span className="info-value">{formData.city || 'Non renseigné'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pays</span>
                <span className="info-value">{formData.country}</span>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ville"
                className="edit-input"
              />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="edit-input"
              >
                <option value="Guinée">Guinée</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Mali">Mali</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="France">France</option>
              </select>
            </div>
          )}
        </div>

        {/* Informations entreprise */}
        <div className="profile-card">
          <h3><Building2 size={18} /> Entreprise</h3>
          {!isEditing ? (
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Taille</span>
                <span className="info-value">{formData.company_size || 'Non renseigné'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Année de création</span>
                <span className="info-value">{formData.founded_year || 'Non renseigné'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">LinkedIn</span>
                <span className="info-value">{formData.linkedin_url || 'Non renseigné'}</span>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                className="edit-input"
              >
                <option value="">Taille de l'entreprise</option>
                <option value="1-10">1-10 employés</option>
                <option value="11-50">11-50 employés</option>
                <option value="51-200">51-200 employés</option>
                <option value="201-500">201-500 employés</option>
                <option value="500+">500+ employés</option>
              </select>
              <input
                type="number"
                name="founded_year"
                value={formData.founded_year}
                onChange={handleChange}
                placeholder="Année de création"
                className="edit-input"
                min="1900"
                max={new Date().getFullYear()}
              />
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="URL LinkedIn"
                className="edit-input"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="profile-card full-width">
          <h3><FileText size={18} /> À propos</h3>
          {!isEditing ? (
            <p className="bio-text">{formData.description || 'Aucune description'}</p>
          ) : (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de l'entreprise..."
              className="edit-textarea"
              rows={4}
            />
          )}
        </div>

        {/* Avantages */}
        <div className="profile-card full-width">
          <h3><Award size={18} /> Avantages proposés</h3>
          <div className="skills-container">
            {formData.benefits.map((benefit, index) => (
              <span key={index} className="skill-tag">
                {benefit}
                {isEditing && (
                  <button onClick={() => handleRemoveBenefit(benefit)} className="remove-skill">
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <div className="add-skill-input">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Ajouter un avantage..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                />
                <button onClick={handleAddBenefit}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boutons de sauvegarde */}
      {isEditing && (
        <div className="edit-actions">
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>
            <X size={16} />
            Annuler
          </button>
          <button className="save-btn" onClick={handleSave}>
            <Save size={16} />
            Enregistrer
          </button>
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
        <h3>Notifications</h3>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Nouvelles candidatures</span>
            <span className="setting-desc">Recevoir des alertes pour les nouvelles candidatures</span>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Matchs de candidats</span>
            <span className="setting-desc">Notification quand un candidat correspond à vos offres</span>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Newsletter</span>
            <span className="setting-desc">Recevoir les actualités BaraCorrespondance</span>
          </div>
          <label className="toggle">
            <input type="checkbox" />
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
          Supprimer le compte
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
              Cette action est irréversible. Toutes vos données, offres d'emploi et candidatures seront définitivement supprimées.
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
      {/* Navigation */}
      <nav className="profile-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="nav-brand">
          <h1>Mon Profil Entreprise</h1>
        </div>

        <div className="nav-actions">
          {onLogout && (
            <button className="logout-btn-small" onClick={onLogout}>
              Déconnexion
            </button>
          )}
        </div>
      </nav>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Building2 size={18} />
          Profil
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          Paramètres
        </button>
      </div>

      {/* Content */}
      <div className="profile-main">
        {activeTab === 'profile' ? <ProfileTab /> : <SettingsTab />}
      </div>
    </div>
  );
};

export default CompanyProfile;
