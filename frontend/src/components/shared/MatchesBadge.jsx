import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { matchesAPI } from '../../services/api';

const MatchesBadge = ({ onClick }) => {
  const [newMatchesCount, setNewMatchesCount] = useState(0);

  useEffect(() => {
    loadNewMatchesCount();

    // Poll toutes les 30 secondes
    const interval = setInterval(() => {
      loadNewMatchesCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNewMatchesCount = async () => {
    try {
      const response = await matchesAPI.getStats();
      if (response.success) {
        setNewMatchesCount(response.data.new_matches || 0);
      }
    } catch (error) {
      // Silent fail pour le polling
    }
  };

  return (
    <button
      className="matches-badge-button"
      onClick={onClick}
      title="Mes matchs"
    >
      <Target size={20} />
      {newMatchesCount > 0 && (
        <span className="matches-badge-count">
          {newMatchesCount > 9 ? '9+' : newMatchesCount}
        </span>
      )}

      <style jsx="true">{`
        .matches-badge-button {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .matches-badge-button:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
          transform: scale(1.05);
        }

        .matches-badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: #10b981;
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </button>
  );
};

export default MatchesBadge;
