import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Users,
  Briefcase,
  Target,
  Star,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../styles/index.css';

/**
 * Stat Card Component
 * Affiche une statistique avec tendance
 */
export const StatCard = ({
  title = 'Statistique',
  value = 0,
  prefix = '',
  suffix = '',
  trend = null,
  icon: Icon = Target,
  color = 'blue',
  onClick = null,
  className = ''
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
    red: 'from-red-50 to-red-100 border-red-200'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  const trendColor = trend > 0 ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {prefix}{value.toLocaleString()}{suffix}
            </span>
            {trend !== null && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-1 ${trendColor}`}
              >
                <TrendIcon size={18} />
                <span className="text-sm font-semibold">
                  {Math.abs(trend)}%
                </span>
              </motion.div>
            )}
          </div>
        </div>
        <motion.div
          whileHover={{ rotate: 15 }}
          className={`${iconColors[color]} p-3 bg-white rounded-lg`}
        >
          <Icon size={24} />
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Chart Card Component
 * Affiche une carte avec graphique simple
 */
export const ChartCard = ({
  title = 'Graphique',
  data = [],
  type = 'bar', // 'bar', 'line', 'pie'
  color = 'blue',
  className = ''
}) => {
  const max = Math.max(...data.map(d => d.value || 0), 1);

  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    green: 'bg-gradient-to-r from-green-400 to-green-600',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
    orange: 'bg-gradient-to-r from-orange-400 to-orange-600'
  };

  return (
    <div className={`bg-white border-2 border-blue-100 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-bold text-blue-900 mb-4">{title}</h3>

      {type === 'bar' && (
        <div className="flex items-end justify-around gap-2 h-40">
          {data.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              className={`flex-1 rounded-t-lg ${colorClasses[color]} group cursor-pointer relative`}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}: {item.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {type === 'line' && (
        <svg
          viewBox="0 0 200 100"
          className="w-full h-40 stroke-current text-blue-500 fill-none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline
            points={data
              .map(
                (item, i) =>
                  `${(i / (data.length - 1 || 1)) * 200},${
                    100 - (item.value / max) * 80
                  }`
              )
              .join(' ')}
          />
        </svg>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, idx) => (
          <div key={idx} className="text-xs">
            <span className="font-semibold text-gray-700">{item.label}</span>
            <span className="text-gray-500"> {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Progress Card Component
 * Affiche un indicateur de progression
 */
export const ProgressCard = ({
  title = 'Progression',
  percentage = 0,
  target = 100,
  current = 0,
  color = 'blue',
  showLabel = true,
  showPercentage = true,
  className = ''
}) => {
  const progressPercentage = Math.min((percentage / target) * 100, 100);

  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    green: 'bg-gradient-to-r from-green-400 to-green-600',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
    orange: 'bg-gradient-to-r from-orange-400 to-orange-600'
  };

  return (
    <div className={`bg-white border-2 border-blue-100 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-900">{title}</h3>
        {showPercentage && (
          <span className="text-sm font-bold text-blue-600">
            {progressPercentage.toFixed(0)}%
          </span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: 'spring', damping: 20 }}
          className={`h-full ${colorClasses[color]}`}
        />
      </div>

      {showLabel && (
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{current}</span> / {target}
        </div>
      )}
    </div>
  );
};

/**
 * KPI Card Component
 * Indicateur clé de performance
 */
export const KPICard = ({
  title = 'KPI',
  value = 0,
  unit = '',
  description = '',
  status = 'neutral', // 'good', 'warning', 'danger', 'neutral'
  icon: Icon = Target,
  className = ''
}) => {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
    neutral: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    neutral: 'text-blue-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`border-2 rounded-lg p-4 ${statusColors[status]} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={24} className={iconColors[status]} />
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {value}{unit}
          </p>
          {description && (
            <p className="text-xs mt-1 opacity-75">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Comparison Card Component
 * Compare deux valeurs
 */
export const ComparisonCard = ({
  title = 'Comparaison',
  value1 = { label: 'Valeur 1', value: 0 },
  value2 = { label: 'Valeur 2', value: 0 },
  className = ''
}) => {
  const total = value1.value + value2.value;
  const percentage1 = total > 0 ? (value1.value / total) * 100 : 0;
  const percentage2 = total > 0 ? (value2.value / total) * 100 : 0;

  return (
    <div className={`bg-white border-2 border-blue-100 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-bold text-blue-900 mb-4">{title}</h3>

      {/* Stacked Bar */}
      <div className="flex items-end gap-2 mb-4 h-20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage1}%` }}
          transition={{ type: 'spring' }}
          className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-lg"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage2}%` }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-t-lg"
        />
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">{value1.label}</p>
          <p className="text-2xl font-bold text-blue-600">
            {value1.value}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {percentage1.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{value2.label}</p>
          <p className="text-2xl font-bold text-purple-600">
            {value2.value}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {percentage2.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Activity Card Component
 * Affiche les activités récentes
 */
export const ActivityCard = ({
  title = 'Activité récente',
  activities = [],
  className = ''
}) => {
  return (
    <div className={`bg-white border-2 border-blue-100 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-bold text-blue-900 mb-4">{title}</h3>

      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0 mt-1">
              {activity.icon ? (
                <activity.icon size={16} className="text-blue-600" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default {
  StatCard,
  ChartCard,
  ProgressCard,
  KPICard,
  ComparisonCard,
  ActivityCard
};
