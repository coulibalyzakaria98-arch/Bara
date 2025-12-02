import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width = 'w-full', height = 'h-4', className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`skeleton ${width} ${height} ${className} rounded-lg mb-4`}
        />
      ))}
    </>
  );
};

const SkeletonCard = () => {
  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <div className="flex gap-4 mb-4">
        <div className="skeleton w-16 h-16 rounded-lg" />
        <div className="flex-1">
          <Skeleton height="h-4" className="w-3/4 mb-2" />
          <Skeleton height="h-3" className="w-1/2" />
        </div>
      </div>
      <Skeleton count={3} height="h-3" className="mb-2" />
    </motion.div>
  );
};

const LoadingSpinner = ({ size = 'md', text = 'Chargement...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full`}
      />
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
};

const PulseLoader = ({ text = 'Traitement en cours...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: idx * 0.2,
            }}
            className="w-3 h-3 rounded-full bg-primary-500"
          />
        ))}
      </div>
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
};

const ProgressLoader = ({ progress = 65, text = 'Chargement...' }) => {
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-900">{text}</p>
        <span className="text-xs font-bold text-primary-600">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
        />
      </div>
    </div>
  );
};

const SkeletonGrid = ({ count = 6, columns = 3 }) => {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};

export {
  Skeleton,
  SkeletonCard,
  SkeletonGrid,
  LoadingSpinner,
  PulseLoader,
  ProgressLoader,
};
