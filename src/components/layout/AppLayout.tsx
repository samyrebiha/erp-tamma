import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../lib/api';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showroomName, setShowroomName] = useState('معرض حسونة لبيع وشراء السيارات');
  const location = useLocation();

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s?.name) setShowroomName(s.name);
    });
  }, []);

  // تحديد عنوان الصفحة بحسب المسار الحالي
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') {
      return {
        title: 'لوحة القيادة والمتابعة المركزية',
        subtitle: 'معرض حسونة لبيع وشراء السيارات — متابعة المخزون والعمليات اليومية',
      };
    }
    if (path.startsWith('/vehicles')) {
      return {
        title: 'المخزون وأسطول السيارات',
        subtitle: 'فحص وتتبع السيارات، أرقام الهيكل (VIN)، وتحديث بيانات المركبات',
      };
    }
    if (path.startsWith('/sales')) {
      return {
        title: 'المبيعات وعمليات الإخراج',
        subtitle: 'تسجيل عمليات البيع، ربط المشتري، وإصدار وثائق التسليم الرسمية A4',
      };
    }
    if (path.startsWith('/customers')) {
      return {
        title: 'سجل العملاء والمشترين',
        subtitle: 'بيانات التواصل، أرقام بطاقات التعريف، وسجل السيارات المشتراة',
      };
    }
    if (path.startsWith('/suppliers')) {
      return {
        title: 'سجل الموردين وشركات الاستيراد',
        subtitle: 'بيانات الموردين، السجلات التجارية، وسجل توريد المركبات',
      };
    }
    if (path.startsWith('/reports')) {
      return {
        title: 'التقارير وهوامش العمليات المالية',
        subtitle: 'تقييم المخزون وهوامش المبيعات بالدينار الجزائري (د.ج)',
      };
    }
    if (path.startsWith('/settings')) {
      return {
        title: 'إعدادات معرض حسونة للسيارات',
        subtitle: 'تخصيص بيانات المعرض، العناوين، أرقام الهواتف، وبنود وثيقة التسليم',
      };
    }
    return { title: 'معرض حسونة للسيارات', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {/* الشريط الجانبي */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showroomName={showroomName}
      />

      {/* المحتوى الرئيسي */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
