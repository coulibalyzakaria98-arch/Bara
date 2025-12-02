import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { messagesAPI, handleAPIError } from '../../services/api';

const MessageThread = ({ matchId, userRole, isMutualInterest }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isMutualInterest) {
      loadMessages();
      // Poll pour les nouveaux messages toutes les 10 secondes
      const interval = setInterval(loadMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [matchId, isMutualInterest]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(matchId);
      if (response.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      if (loading) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await messagesAPI.sendMessage(matchId, newMessage.trim());
      if (response.success) {
        setNewMessage('');
        loadMessages();
        toast.success('Message envoyé');
      }
    } catch (error) {
      const { message } = handleAPIError(error);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isMutualInterest) {
    return (
      <div className="message-thread-locked">
        <MessageCircle size={48} color="#64748b" />
        <h3>Messagerie verrouillée</h3>
        <p>
          La messagerie est disponible uniquement lorsque les deux parties
          ont marqué un intérêt mutuel pour ce match.
        </p>

        <style jsx>{`
          .message-thread-locked {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
          }

          .message-thread-locked h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #e2e8f0;
            margin: 1rem 0 0.5rem 0;
          }

          .message-thread-locked p {
            color: #94a3b8;
            max-width: 400px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="message-thread-loading">
        <Loader className="spinner" size={32} />
        <p>Chargement de la conversation...</p>

        <style jsx>{`
          .message-thread-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
          }

          .message-thread-loading p {
            color: #94a3b8;
            margin-top: 1rem;
          }

          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="message-thread">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <MessageCircle size={48} color="#64748b" />
            <p>Aucun message pour le moment</p>
            <span>Commencez la conversation !</span>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isSent = message.sender_type === userRole;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`message-bubble ${isSent ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">
                    {formatTimestamp(message.created_at)}
                    {isSent && message.is_read && ' · Lu'}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <textarea
          className="message-input"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          rows={2}
          maxLength={2000}
          disabled={sending}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <Loader className="spinner" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>

      <style jsx>{`
        .message-thread {
          display: flex;
          flex-direction: column;
          height: 500px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #64748b;
        }

        .no-messages p {
          font-size: 1rem;
          font-weight: 500;
          color: #94a3b8;
          margin: 1rem 0 0.25rem 0;
        }

        .no-messages span {
          font-size: 0.875rem;
          color: #64748b;
        }

        .message-bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-bubble.sent {
          align-self: flex-end;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: white;
        }

        .message-bubble.received {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }

        .message-content {
          font-size: 0.875rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .message-timestamp {
          font-size: 0.625rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        .message-form {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.875rem;
          resize: none;
          font-family: inherit;
          transition: all 0.3s;
        }

        .message-input:focus {
          outline: none;
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
        }

        .message-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MessageThread;
