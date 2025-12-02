import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

// Sous-composant pour les champs de formulaire pour éviter la répétition
const FormInput = ({ icon, ...props }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
      {icon}
    </span>
    <input
      {...props}
      className="form-input pl-10" // Padding à gauche pour l'icône
    />
  </div>
);

const CandidateAuth = ({ onLogin, onRegister }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
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

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(formData.email, formData.password);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas.");
    }
    if (formData.password.length < 8) {
      return toast.error("Le mot de passe doit faire au moins 8 caractères.");
    }

    const nameParts = formData.name.trim().split(' ');
    const registerData = {
      email: formData.email,
      password: formData.password,
      role: 'candidate',
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      phone: formData.phone,
      title: formData.profession
    };
    onRegister(registerData);
  };
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.success('Si un compte existe pour ' + resetEmail + ', un email de réinitialisation a été envoyé.');
    setShowForgotPassword(false);
    setResetEmail('');
  };

  const formTitle = isLogin ? 'Connexion Candidat' : 'Devenez Candidat';
  const formSubtitle = isLogin ? 'Accédez à votre espace pour trouver le job de vos rêves.' : 'Créez un compte pour commencer votre recherche.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg p-4 relative">
      <div className="background-pattern"></div>
      
      <div className="w-full max-w-md">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-4">
          <ArrowLeft size={20} />
          Retour
        </button>

        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="text-center mb-8">
            <h1 className="card-title text-2xl">{formTitle}</h1>
            <p className="text-text-muted">{formSubtitle}</p>
          </div>

          <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <FormInput icon={<User size={18} className="text-gray-400" />} type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Mariam Diallo" />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <FormInput icon={<Mail size={18} className="text-gray-400" />} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="votre.email@exemple.com" />
            </div>
            
            {!isLogin && (
               <div className="form-group">
                  <label className="form-label">Profession</label>
                  <FormInput icon={<Briefcase size={18} className="text-gray-400" />} type="text" name="profession" value={formData.profession} onChange={handleChange} required placeholder="Ex: Développeur Full-Stack" />
                </div>
            )}

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <FormInput icon={<Lock size={18} className="text-gray-400" />} type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
              {isLogin && (
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-right text-sm text-primary hover:underline mt-2">
                  Mot de passe oublié ?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe</label>
                <FormInput icon={<Lock size={18} className="text-gray-400" />} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4">
              {isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-border">
            <p className="text-text-muted text-sm">
              {isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'}{' '}
              <button 
                onClick={() => navigate(isLogin ? '/register' : '/login', { state: { userType: 'candidate' } })}
                className="font-semibold text-primary hover:underline"
              >
                {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modale Mot de passe oublié */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Réinitialiser</h2>
              <button onClick={() => setShowForgotPassword(false)} className="modal-close-btn">&times;</button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="modal-body">
                <p className="text-text-muted mb-4">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <FormInput icon={<Mail size={18} className="text-gray-400" />} type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="votre.email@exemple.com" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Envoyer le lien</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CandidateAuth;
