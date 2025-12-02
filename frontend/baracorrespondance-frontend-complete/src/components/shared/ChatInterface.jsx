import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User, Briefcase, MessageCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { messagesAPI, matchesAPI, handleAPIError } from '../../services/api';

const ChatInterface = ({ onBack, userRole }) => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);

  useEffect(() => {
    loadMatches();
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.id);
      // Poll for new messages every 5 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages(selectedMatch.id, true);
      }, 5000);
    } else {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [selectedMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const response = await matchesAPI.getAll({ status: 'mutual_interest' });
      setMatches(response.data.matches || []);
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (matchId, silent = false) => {
    try {
      const response = await messagesAPI.getMessages(matchId);
      setMessages(response.data.messages || []);
    } catch (error) {
      if (!silent) {
        const { message } = handleAPIError(error);
        toast.error(message);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    setIsSending(true);
    try {
      const response = await messagesAPI.sendMessage(selectedMatch.id, newMessage.trim());
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getMatchDisplayName = (match) => {
    if (userRole === 'candidate') {
      return match.job?.company?.name || match.job?.title || 'Entreprise';
    } else {
      return match.candidate?.full_name || 'Candidat';
    }
  };

  const getMatchSubtitle = (match) => {
    if (userRole === 'candidate') {
      return match.job?.title || '';
    } else {
      return match.candidate?.email || '';
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p>Chargement de vos conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MessageCircle size={24} color="#06b6d4" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>Messagerie</h1>
        </div>

        <div style={{ width: '120px' }} />
      </nav>

      {/* Chat Layout */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: 'calc(100vh - 120px)' }}>
        {/* Matches List */}
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.5rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>Conversations ({matches.length})</h3>

          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <MessageCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem' }}>Aucune conversation</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Les matchs mutuels apparaîtront ici</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedMatch(match)}
                  style={{
                    padding: '1rem',
                    background: selectedMatch?.id === match.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedMatch?.id === match.id ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {userRole === 'candidate' ? <Briefcase size={24} /> : <User size={24} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getMatchDisplayName(match)}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getMatchSubtitle(match)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        {selectedMatch ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Chat Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                  {userRole === 'candidate' ? <Briefcase size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', margin: 0 }}>{getMatchDisplayName(selectedMatch)}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>{getMatchSubtitle(selectedMatch)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#64748b' }}>
                  <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Aucun message pour le moment</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Envoyez le premier message!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = (userRole === 'candidate' && msg.sender_type === 'candidate') || (userRole === 'company' && msg.sender_type === 'company');

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            background: isMine ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.05)',
                            border: isMine ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: isMine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                            color: '#fff',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                          }}
                        >
                          {msg.content}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                          <Clock size={12} color="#64748b" />
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{formatMessageTime(msg.created_at)}</p>
                          {isMine && msg.is_read && (
                            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓✓</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                disabled={isSending}
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.875rem' }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: newMessage.trim() && !isSending ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: newMessage.trim() && !isSending ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                <Send size={18} />
                Envoyer
              </button>
            </form>
          </div>
        ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#64748b' }}>
              <MessageCircle size={64} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Sélectionnez une conversation</h3>
            <p style={{ fontSize: '0.875rem' }}>Choisissez un match dans la liste pour commencer à discuter</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
