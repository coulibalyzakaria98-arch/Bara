import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Bell,
  Copy,
  Check
} from 'lucide-react';
import '../../styles/index.css';

/**
 * Modal Component
 * Affiche une modale avec animation
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  footer = null,
  closeOnBackdrop = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`pointer-events-auto bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto ${sizeClasses[size]} w-full mx-4 ${className}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-blue-100">
                <h2 className="text-xl font-bold text-blue-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-blue-100 p-6 flex gap-3 justify-end">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Toast Notification Component
 */
const toastContainers = {};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info size={20} className="text-blue-600" />,
      title: 'Info'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle size={20} className="text-green-600" />,
      title: 'Succès'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle size={20} className="text-red-600" />,
      title: 'Erreur'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertTriangle size={20} className="text-yellow-600" />,
      title: 'Attention'
    }
  };

  const variant = variants[type] || variants.info;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className={`${variant.bg} border-l-4 ${variant.border} rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-md`}
    >
      {variant.icon}
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-900">{variant.title}</p>
        <p className="text-sm text-gray-700 mt-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
    <AnimatePresence>
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </AnimatePresence>
  </div>
);

/**
 * Confirmation Dialog Component
 */
export const ConfirmDialog = ({
  isOpen = false,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  message = 'Êtes-vous sûr ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDangerous = false
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
    size="sm"
    closeOnBackdrop={false}
    footer={
      <>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border-2 border-blue-200 text-blue-900 font-semibold hover:bg-blue-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmText}
        </button>
      </>
    }
  >
    <p className="text-gray-700">{message}</p>
  </Modal>
);

/**
 * Alert Component
 * Affiche une alerte inline
 */
export const Alert = ({
  type = 'info',
  title = '',
  message = '',
  onClose = null,
  className = ''
}) => {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-900',
      text: 'text-blue-800',
      icon: <Info size={20} className="text-blue-600" />
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-900',
      text: 'text-green-800',
      icon: <CheckCircle size={20} className="text-green-600" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'text-red-900',
      text: 'text-red-800',
      icon: <AlertCircle size={20} className="text-red-600" />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: 'text-yellow-900',
      text: 'text-yellow-800',
      icon: <AlertTriangle size={20} className="text-yellow-600" />
    }
  };

  const variant = variants[type] || variants.info;

  return (
    <div
      className={`${variant.bg} border-l-4 ${variant.border} rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        {variant.icon}
        <div className="flex-1">
          {title && <p className={`font-semibold ${variant.title}`}>{title}</p>}
          <p className={`${variant.text} ${title ? 'mt-1 text-sm' : ''}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${variant.text} hover:opacity-70 flex-shrink-0`}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Tooltip Component
 */
export const Tooltip = ({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute ${positionClasses[position]} bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-50 pointer-events-none`}
          >
            {content}
            <div className="absolute w-2 h-2 bg-gray-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Notification Badge Component
 */
export const NotificationBadge = ({
  count = 0,
  children,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  };

  return (
    <div className="relative inline-block">
      {children}
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute ${positionClasses[position]} -translate-y-1/2 translate-x-1/2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center`}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </div>
  );
};

/**
 * Drawer/Sidebar Component
 */
export const Drawer = ({
  isOpen = false,
  onClose,
  title,
  children,
  position = 'right',
  className = ''
}) => {
  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{
              x: position === 'left' ? -400 : 400,
              opacity: 0
            }}
            animate={{
              x: 0,
              opacity: 1
            }}
            exit={{
              x: position === 'left' ? -400 : 400,
              opacity: 0
            }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed top-0 ${positionClasses[position]} h-screen w-96 bg-white shadow-xl z-50 flex flex-col ${className}`}
          >
            <div className="flex items-center justify-between p-6 border-b border-blue-100">
              <h2 className="text-xl font-bold text-blue-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default {
  Modal,
  Toast,
  ToastContainer,
  ConfirmDialog,
  Alert,
  Tooltip,
  NotificationBadge,
  Drawer,
  useToast
};
