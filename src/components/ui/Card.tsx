import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-card bg-surface border border-border p-5 shadow-sm transition-shadow',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-divider">
          <div>
            {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  return (
    <div className={cn('rounded-card bg-surface border border-border p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted">{title}</span>
        {icon && (
          <div className="w-10 h-10 rounded-[8px] bg-primary-soft text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        {trend && <p className="text-xs font-medium text-status-available mt-1">{trend}</p>}
      </div>
    </div>
  );
};

