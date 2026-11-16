import React from 'react';
import { Menu, Database, Plus, Printer } from 'lucide-react';
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
  return (
    <header className="h-16 bg-surface border-b border-border px-4 lg:px-6 flex items-center justify-between no-print sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-[8px] border border-border text-text-secondary hover:text-text-primary hover:bg-page lg:hidden"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && <h2 className="text-base lg:text-lg font-bold text-text-primary leading-tight">{title}</h2>}
          {subtitle && <p className="text-xs text-text-muted hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* مؤشر حالة الربط بقاعدة البيانات */}
        <div
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge text-[11px] font-medium border"
          style={{
            backgroundColor: isSupabaseConfigured ? '#F0FDF4' : '#FEFCE8',
            color: isSupabaseConfigured ? '#15803D' : '#A16207',
            borderColor: isSupabaseConfigured ? '#BBF7D0' : '#FEF08A',
          }}
          title={isSupabaseConfigured ? 'متصل بقاعدة بيانات Supabase السحابية' : 'الوضع المحلي / بحاجة لضبط مفاتيح Supabase في ملف .env'}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConfigured ? 'Supabase متصل' : 'الوضع المحلي (Mock)'}</span>
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

