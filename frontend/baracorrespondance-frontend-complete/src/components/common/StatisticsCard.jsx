import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatisticsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = 'up',
  color = 'primary',
  chart,
  details
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-700 text-primary-600',
    secondary: 'from-secondary-500 to-secondary-700 text-secondary-600',
    accent: 'from-accent-500 to-accent-700 text-accent-600',
    success: 'from-green-500 to-green-700 text-green-600',
    warning: 'from-yellow-500 to-yellow-700 text-yellow-600',
    error: 'from-red-500 to-red-700 text-red-600',
  };

  const [bgGradient, textColor] = colorClasses[color].split(' text-');

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="card relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl opacity-10`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-slate-900">{value}</h3>
              {change && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                    trend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {change}
                </motion.div>
              )}
            </div>
          </div>

          {Icon && (
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className={`w-16 h-16 rounded-lg bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white`}
            >
              <Icon size={32} />
            </motion.div>
          )}
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="mb-6 space-y-2">
            {details.map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{detail.label}</span>
                <span className="font-semibold text-slate-900">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chart Preview */}
        {chart && (
          <div className="pt-6 border-t-2 border-primary-100">
            <div className="flex items-end justify-between gap-2 h-16">
              {chart.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg hover:shadow-lg cursor-pointer"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatisticsCard;
