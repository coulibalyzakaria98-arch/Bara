import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI, handleAPIError } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Charger l'utilisateur depuis localStorage (seulement si les tokens existent)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    // Only restore user if both user data and token exist
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
        console.log('✅ Session restaurée depuis localStorage');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } else if (storedUser && !accessToken) {
      // User exists but no token - clear invalid session
      console.log('⚠️ Session invalide détectée, nettoyage...');
      localStorage.removeItem('user');
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log("🔐 Tentative de connexion:", email);

    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        const { user: userData, access_token, refresh_token } = response.data;

        console.log('✅ Login réussi, tokens reçus:', {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          user: userData
        });

        // Store tokens
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        toast.success(`Bienvenue ${userData.full_name || userData.email} !`);
        return true;
      }

      toast.error(response.message || 'Erreur de connexion');
      return false;
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      const { message } = handleAPIError(error);
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    console.log("🆕 Tentative d'inscription:", userData);

    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        const { user: newUser, access_token, refresh_token } = response.data;

        console.log('✅ Inscription réussie, réponse complète:', response);
        console.log('✅ Tokens reçus:', {
          access_token: access_token ? access_token.substring(0, 20) + '...' : 'MANQUANT',
          refresh_token: refresh_token ? 'présent' : 'MANQUANT',
          user: newUser
        });

        if (!access_token) {
          console.error('❌ ERREUR: access_token manquant dans la réponse!');
          toast.error('Erreur: token non reçu du serveur');
          return { success: false, message: 'Token manquant' };
        }

        // Store tokens
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Verify storage
        console.log('✅ Vérification localStorage:', {
          storedToken: localStorage.getItem('accessToken') ? 'OK' : 'ÉCHEC',
          storedUser: localStorage.getItem('user') ? 'OK' : 'ÉCHEC'
        });

        setUser(newUser);
        toast.success('Compte créé avec succès !');
        return { success: true, user: newUser };
      }

      toast.error(response.message || 'Erreur lors de l\'inscription');
      return { success: false, message: response.message };
    } catch (error) {
      console.error("❌ Erreur d'inscription:", error);
      const { message, errors } = handleAPIError(error);
      toast.error(message);
      return { success: false, message, errors };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success('Déconnexion réussie');
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Mettre à jour aussi dans la liste des utilisateurs enregistrés
    const updatedUsers = registeredUsers.map(u => 
      u.email === user.email ? { ...u, ...updates } : u
    );
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    toast.success('Profil mis à jour');
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    registeredUsers, // Pour le debug si nécessaire
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
