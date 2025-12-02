import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Section Logo & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="BaraMatch Logo" className="h-24 w-auto bg-white rounded-md p-1" />
            </Link>
            <p className="text-gray-400">La plateforme intelligente qui connecte les talents et les entreprises en Guinée.</p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-bold mb-4">Pour les Candidats</h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="hover:text-primary">Trouver un emploi</Link></li>
              <li><Link to="/register" className="hover:text-primary">Créer un profil</Link></li>
              <li><Link to="/login" className="hover:text-primary">Connexion</Link></li>
            </ul>
          </div>

          {/* Liens pour les entreprises */}
          <div>
            <h4 className="font-bold mb-4">Pour les Entreprises</h4>
            <ul className="space-y-2">
              <li><Link to="/company-register" className="hover:text-primary">Recruter un talent</Link></li>
              <li><Link to="/company-login" className="hover:text-primary">Espace recruteur</Link></li>
              <li><Link to="/pricing" className="hover:text-primary">Nos offres</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Conakry, Guinée</li>
              <li>contact@baramatch.com</li>
              <li>+224 123 456 789</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} BaraMatch. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary"><Twitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Linkedin size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Github size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;