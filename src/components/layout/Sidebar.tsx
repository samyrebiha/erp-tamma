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
  Sparkles,
  ChevronLeft,
  KeyRound,
  ArrowLeftRight,
  CreditCard,
  Wrench,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  showroomName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  showroomName = 'معرض حسونة لبيع وشراء السيارات',
}) => {
  const navItems = [
    { to: '/', label: 'لوحة التحكم المركزية', icon: LayoutDashboard },
    { to: '/vehicles', label: 'المخزون والسيارات', icon: Car },
    { to: '/sales', label: 'المبيعات والتسليم', icon: Receipt },
    { to: '/rentals', label: 'كراء وتأجير السيارات', icon: KeyRound },
    { to: '/trade-ins', label: 'تبادل السيارات (Échange)', icon: ArrowLeftRight },
    { to: '/installments', label: 'التقسيط والديون', icon: CreditCard },
    { to: '/expenses', label: 'مصاريف وصيانة المركبات', icon: Wrench },
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-72 bg-surface border-l border-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 no-print shadow-sm',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ترويسة الشريط الجانبي الفخمة الخاصة بمعرض حسونة */}
        <div className="p-4 border-b border-divider bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* شعار معرض حسونة الرسمي */}
              <div className="relative w-11 h-11 rounded-card bg-white flex items-center justify-center p-1 shadow-md border border-border shrink-0 overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="شعار معرض حسونة"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold text-navy tracking-tight truncate">
                    معرض حسونة أوتو
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary-soft text-primary">
                    AUTO
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-text-secondary truncate mt-0.5">
                  أميه ونسة – الوادي، طريق تقرت
                </p>
                <p className="text-[10px] text-primary font-bold truncate">بيع • شراء • كراء • تبادل</p>
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
        </div>

        {/* عناصر التنقل */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            القائمة الرئيسية
          </div>

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
                    'group flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-all select-none border',
                    isActive
                      ? 'bg-primary-soft text-primary font-bold border-blue-200 shadow-xs'
                      : 'text-text-secondary hover:bg-page hover:text-text-primary border-transparent'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>

        {/* تذييل الشريط الجانبي */}
        <div className="p-3.5 border-t border-divider bg-page/60">
          <div className="p-2.5 rounded-[8px] bg-white border border-border space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-status-available" />
                معرض حسونة للسيارات
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-status-available animate-pulse" title="النظام نشط" />
            </div>
            <div className="text-[10px] text-text-muted flex items-center justify-between font-latin">
              <span>العملة: د.ج (DZD)</span>
              <span>v2.0 • Pro</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
