import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Building2, 
  Phone, 
  MapPin,
  Users,
  Briefcase
} from 'lucide-react';
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

const CompanyAuth = ({ onLogin, onRegister }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    sector: '',
    size: '',
    location: ''
  });

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await onLogin(formData.email, formData.password);
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

    const registerData = {
      email: formData.email,
      password: formData.password,
      role: 'company',
      company_name: formData.companyName,
      phone: formData.phone,
      sector: formData.sector,
      size: formData.size,
      location: formData.location
    };

    await onRegister(registerData);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    toast.success('Si un compte existe pour ' + resetEmail + ', un email de réinitialisation a été envoyé.');
    setShowForgotPassword(false);
    setResetEmail('');
  };

  const formTitle = isLogin ? 'Connexion Entreprise' : 'Devenez Partenaire';
  const formSubtitle = isLogin ? 'Accédez à votre espace recrutement' : 'Trouvez les meilleurs talents avec l\'IA';

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
                  <label className="form-label">Nom de l'entreprise</label>
                  <FormInput icon={<Building2 size={18} className="text-gray-400" />} type="text" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Ex: Tech Innovations Inc." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Secteur d'activité</label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="tech">Technologie</option>
                      <option value="finance">Finance</option>
                      <option value="commerce">Commerce</option>
                      <option value="industrie">Industrie</option>
                      <option value="services">Services</option>
                      <option value="sante">Santé</option>
                      <option value="education">Éducation</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Taille de l'entreprise</label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="1-10">1-10 employés</option>
                      <option value="11-50">11-50 employés</option>
                      <option value="51-200">51-200 employés</option>
                      <option value="201-500">201-500 employés</option>
                      <option value="500+">500+ employés</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Localisation</label>
                  <FormInput icon={<MapPin size={18} className="text-gray-400" />} type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Ex: Conakry, Guinée" />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email professionnel</label>
              <FormInput icon={<Mail size={18} className="text-gray-400" />} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="contact@exemple.com" />
            </div>

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
              {isLogin ? 'Se connecter' : 'Créer mon compte entreprise'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-border">
            <p className="text-text-muted text-sm">
              {isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'}{' '}
              <button 
                onClick={() => navigate(isLogin ? '/register' : '/login', { state: { userType: 'company' } })}
                className="font-semibold text-primary hover:underline"
              >
                {isLogin ? 'Créer un compte' : 'Se connecter'}
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
                  <FormInput icon={<Mail size={18} className="text-gray-400" />} type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="contact@entreprise.com" />
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

export default CompanyAuth;
