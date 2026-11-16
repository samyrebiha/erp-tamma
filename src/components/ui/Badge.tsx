import React from 'react';
import { cn } from '../../lib/utils';
import { VehicleStatus, PaymentStatus } from '../../types';
import { VEHICLE_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../../lib/constants';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  className?: string;
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({ status, className }) => {
  const config = VEHICLE_STATUS_CONFIG[status] || {
    label: status,
    textColor: '#475569',
    bgColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium border transition-colors',
        className
      )}
      style={{
        color: config.textColor,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full ml-1.5 shrink-0"
        style={{ backgroundColor: config.textColor }}
      />
      {config.label}
    </span>
  );
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className }) => {
  const config = PAYMENT_STATUS_CONFIG[status] || {
    label: status,
    textColor: '#475569',
    bgColor: '#F1F5F9',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium border border-transparent',
        className
      )}
      style={{
        color: config.textColor,
        backgroundColor: config.bgColor,
      }}
    >
      {config.label}
    </span>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-page text-text-secondary border-border',
    primary: 'bg-primary-soft text-primary border-blue-200',
    success: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

