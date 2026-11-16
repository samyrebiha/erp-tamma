import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // تحديد عنوان الصفحة بحسب المسار الحالي
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') {
      return { title: 'لوحة التحكم والمؤشرات', subtitle: 'نظرة عامة على حالة المخزون والمبيعات والنشاط الأخير' };
    }
    if (path.startsWith('/vehicles')) {
      return { title: 'إدارة المخزون والسيارات', subtitle: 'متابعة كافة السيارات، أرقامها التعريفية، وتحديث بياناتها' };
    }
    if (path.startsWith('/sales')) {
      return { title: 'المبيعات وعمليات الإخراج', subtitle: 'تسليم السيارات للمشترين وإصدار وثائق التسليم الرسمية' };
    }
    if (path.startsWith('/customers')) {
      return { title: 'إدارة العملاء', subtitle: 'سجل المشترين وبيانات التواصل والسيارات المقتناة' };
    }
    if (path.startsWith('/suppliers')) {
      return { title: 'إدارة الموردين', subtitle: 'سجل الموردين وبيانات الاتصال والسيارات المشتراة' };
    }
    if (path.startsWith('/reports')) {
      return { title: 'التقارير المالية والتشغيلية', subtitle: 'إحصائيات المبيعات، وهوامش الأسعار بالدينار الجزائري' };
    }
    if (path.startsWith('/settings')) {
      return { title: 'إعدادات المعرض', subtitle: 'تخصيص اسم المعرض، الشعار، أرقام الاتصال، وشروط التسليم' };
    }
    return { title: 'نظام إدارة المعرض', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {/* الشريط الجانبي */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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

