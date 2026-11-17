import React, { useState, useEffect } from 'react';
import { Menu, Database, Plus, Clock, Calendar, Car } from 'lucide-react';
import { Button } from '../ui/Button';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
  onQuickAddVehicle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  onQuickAddVehicle,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('ar-DZ', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(now);
      setCurrentDateStr(formatted);
    };

    updateTime();
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-border px-4 lg:px-6 flex items-center justify-between no-print sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-[8px] border border-border text-text-secondary hover:text-text-primary hover:bg-page lg:hidden"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && (
            <h2 className="text-base lg:text-lg font-bold text-text-primary leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-text-muted hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* التاريخ والوقت في الجزائر */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-page border border-border text-xs text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{currentDateStr}</span>
        </div>

        {/* مؤشر اتصال النظام السحابي */}
        <div
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
          title="نظام معرض حسونة أوتو متصل سحابياً بقاعدة البيانات"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>سحابي متصل ومباشر</span>
        </div>

        {onQuickAddVehicle && (
          <Button
            size="sm"
            variant="primary"
            onClick={onQuickAddVehicle}
            icon={<Plus className="w-4 h-4" />}
          >
            إضافة سيارة
          </Button>
        )}
      </div>
    </header>
  );
};
