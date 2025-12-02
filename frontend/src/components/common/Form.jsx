import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';

const FormField = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required,
  icon: Icon,
  helper,
  successMessage
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const hasError = error && error.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`input-field ${Icon ? 'pl-12' : ''} ${
            hasError ? 'border-red-500 focus:border-red-500' : ''
          } ${successMessage ? 'border-green-500 focus:border-green-500' : ''}`}
        />

        {successMessage && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500"
          >
            <Check size={20} />
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-sm text-red-600"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      {/* Helper Text */}
      {helper && !hasError && (
        <p className="text-xs text-slate-500 mt-2">{helper}</p>
      )}
    </motion.div>
  );
};

const FormGroup = ({ children, title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
};

const Form = ({ children, onSubmit, isLoading, submitText = 'Envoyer' }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="space-y-6"
    >
      {children}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
        type="submit"
        className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Traitement...
          </>
        ) : (
          submitText
        )}
      </motion.button>
    </form>
  );
};

export { FormField, FormGroup, Form };
