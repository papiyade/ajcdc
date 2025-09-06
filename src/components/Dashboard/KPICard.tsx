import React from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  onClick
}: KPICardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary',
      border: 'border-primary-200'
    },
    success: {
      bg: 'bg-green-50',
      icon: 'text-greenaj',
      border: 'border-green-200'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-bicblue',
      border: 'border-blue-200'
    },
    warning: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    danger: {
      bg: 'bg-red-50',
      icon: 'text-redaj',
      border: 'border-red-200'
    }
  };

  const colors = colorClasses[color];

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border p-6 transition-all duration-200',
        colors.border,
        onClick && 'cursor-pointer hover:shadow-md hover:scale-105'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={clsx(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        <div className={clsx(
          'w-12 h-12 rounded-lg flex items-center justify-center',
          colors.bg
        )}>
          <Icon className={clsx('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  );
}

