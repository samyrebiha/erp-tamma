import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Receipt,
  Users,
  Truck,
  BarChart3,
  Settings,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  showroomName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, showroomName = 'معرض السيارات' }) => {
  const navItems = [
    { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { to: '/vehicles', label: 'المخزون والسيارات', icon: Car },
    { to: '/sales', label: 'المبيعات والتسليم', icon: Receipt },
    { to: '/customers', label: 'إدارة العملاء', icon: Users },
    { to: '/suppliers', label: 'إدارة الموردين', icon: Truck },
    { to: '/reports', label: 'التقارير والمؤشرات', icon: BarChart3 },
    { to: '/settings', label: 'إعدادات المعرض', icon: Settings },
  ];

  return (
    <>
      {/* خلفية معتمة للهواتف والشاشات اللمسية */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-64 bg-surface border-l border-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 no-print',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ترويسة الشريط الجانبي */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-divider">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-navy truncate" title={showroomName}>
                {showroomName}
              </h1>
              <p className="text-[11px] text-text-muted">نظام الإدارة الداخلي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-text-muted hover:text-text-primary hover:bg-page lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* عناصر التنقل */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-all select-none',
                    isActive
                      ? 'bg-primary-soft text-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:bg-page hover:text-text-primary'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* تذييل الشريط الجانبي */}
        <div className="p-3 border-t border-divider bg-page/50">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <div className="truncate">
              <span className="block font-semibold text-text-secondary">ERP Tamma v1.0</span>
              <span className="text-[10px]">العملة: د.ج (دينار جزائري)</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

