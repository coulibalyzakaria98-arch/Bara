import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const CandidateAuth = ({ onBack, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profession: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(formData.email, formData.password);
    if (!success) {
      // Error already handled by onLogin
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // Split name into first_name and last_name
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Transform data to match backend API
    const registerData = {
      email: formData.email,
      password: formData.password,
      role: 'candidate',
      first_name: firstName,
      last_name: lastName,
      phone: formData.phone,
      title: formData.profession
    };

    try {
      const result = await onRegister(registerData);
      if (!result || !result.success) {
        // Error already handled by onRegister
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast.error('Une erreur est survenue lors de l\'inscription');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    try {
      // TODO: Call password reset API
      toast.success('Un email de réinitialisation a été envoyé à ' + resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <div className="auth-page">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="auth-container">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="back-btn"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </motion.button>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-card"
        >
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon">🚀</div>
            <h2>{isLogin ? 'Connexion Talent' : 'Créer votre compte'}</h2>
            <p>{isLogin ? 'Connectez-vous pour accéder à votre espace' : 'Rejoignez des milliers de talents'}</p>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>
                  <User size={18} />
                  <span>Nom complet *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom et prénom"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>
                <Mail size={18} />
                <span>Email *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
                className="form-input"
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label>
                    <Phone size={18} />
                    <span>Téléphone</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Briefcase size={18} />
                    <span>Profession *</span>
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    required
                    placeholder="Développeur, Designer, etc."
                    className="form-input"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>
                <Lock size={18} />
                <span>Mot de passe *</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={isLogin ? 'Votre mot de passe' : 'Minimum 8 caractères (maj, min, chiffre)'}
                className="form-input"
              />
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="forgot-password-link"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>
                  <Lock size={18} />
                  <span>Confirmer le mot de passe *</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Retapez votre mot de passe"
                  className="form-input"
                />
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="submit-btn"
            >
              {isLogin ? 'Se connecter' : 'Créer mon compte'}
            </motion.button>
          </form>

          {/* Switch Auth Mode */}
          <div className="auth-switch">
            <p>{isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}</p>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="switch-btn"
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>


          {/* Terms */}
          {!isLogin && (
            <div className="auth-terms">
              <p>En créant un compte, vous acceptez nos 
                <a href="#"> Conditions d'utilisation</a> et notre 
                <a href="#"> Politique de confidentialité</a>
              </p>
            </div>
          )}
        </motion.div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <h3>Réinitialiser le mot de passe</h3>
              <p className="modal-description">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <form onSubmit={handleForgotPassword} className="modal-form">
                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="form-input"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="modal-btn cancel"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="modal-btn confirm">
                    Envoyer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem;
        }

        .auth-container {
          max-width: 500px;
          width: 100%;
          position: relative;
          z-index: 10;
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
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 2rem;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-5px);
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .auth-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.875rem;
          transition: all 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #06b6d4;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }

        .form-input::placeholder {
          color: rgba(226, 232, 240, 0.4);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 0.5rem;
        }

        .submit-btn:hover {
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
        }

        .auth-switch {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-switch p {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .switch-btn {
          background: none;
          border: none;
          color: #06b6d4;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .switch-btn:hover {
          color: #0891b2;
          text-decoration: underline;
        }

        .demo-accounts {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 12px;
          text-align: center;
        }

        .demo-title {
          color: #06b6d4;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .demo-info {
          color: #cbd5e1;
          font-size: 0.75rem;
          font-family: 'Courier New', monospace;
        }

        .auth-terms {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-terms p {
          color: #64748b;
          font-size: 0.75rem;
          text-align: center;
          line-height: 1.6;
        }

        .auth-terms a {
          color: #06b6d4;
          text-decoration: none;
        }

        .auth-terms a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .auth-page {
            padding: 1rem;
          }

          .auth-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CandidateAuth;
