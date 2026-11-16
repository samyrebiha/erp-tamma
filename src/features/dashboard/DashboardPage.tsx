import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Receipt,
  Users,
  Truck,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardStats, Vehicle, Sale } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { StatCard, Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VehicleStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted">جاري تحميل مؤشرات لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شبكة المؤشرات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="السيارات المتاحة بالمخزون"
          value={stats.availableVehiclesCount}
          subtitle="جاهزة للبيع والتسليم"
          icon={<Car className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="السيارات المباعة والمخرجة"
          value={stats.soldVehiclesCount}
          subtitle="إجمالي العمليات المكتملة"
          icon={<Receipt className="w-5 h-5 text-[#15803D]" />}
        />
        <StatCard
          title="إجمالي قيمة المخزون الحالي"
          value={formatCurrency(stats.totalInventoryPurchaseValue)}
          subtitle="سعر الشراء التقديري + المصاريف"
          icon={<DollarSign className="w-5 h-5 text-[#B45309]" />}
        />
        <StatCard
          title="شبكة التعاملات"
          value={`${stats.customersCount} عميل / ${stats.suppliersCount} مورد`}
          subtitle="قاعدة البيانات المسجلة"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* قسم الإجراءات السريعة */}
      <div className="bg-surface rounded-card border border-border p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-primary">إجراءات سريعة:</span>
          <span className="text-xs text-text-muted">اختصارات لأبرز المهام اليومية في المعرض</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/vehicles">
            <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
              إضافة سيارة جديدة
            </Button>
          </Link>
          <Link to="/sales">
            <Button size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />}>
              تسجيل عملية بيع / إخراج
            </Button>
          </Link>
          <Link to="/reports">
            <Button size="sm" variant="secondary" icon={<FileText className="w-4 h-4" />}>
              عرض تقرير الأرباح
            </Button>
          </Link>
        </div>
      </div>

      {/* جداول ملخص النشاط */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أحدث السيارات المضافة */}
        <Card
          title="أحدث السيارات في المخزون"
          subtitle="السيارات المسجلة مؤخراً"
          action={
            <Link
              to="/vehicles"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              عرض الكل
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          }
        >
          {stats.recentVehicles.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">لا توجد سيارات مسجلة حالياً</p>
          ) : (
            <div className="divide-y divide-divider -mx-5">
              {stats.recentVehicles.map((vehicle) => {
                const vin = vehicle.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value;
                return (
                  <div key={vehicle.id} className="flex items-center justify-between px-5 py-3 hover:bg-page/60 transition-colors">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">
                          {vehicle.brand} {vehicle.model}
                        </span>
                        <span className="text-xs text-text-muted">({vehicle.manufacture_year || '—'})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted font-latin">
                        <span>VIN: {vin || 'غير محدد'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <VehicleStatusBadge status={vehicle.status} />
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        تفاصيل
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* آخر عمليات البيع والتسليم */}
        <Card
          title="آخر عمليات البيع والإخراج"
          subtitle="السيارات المسلمة والموثقة"
          action={
            <Link
              to="/sales"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              عرض سجل المبيعات
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          }
        >
          {stats.recentSales.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">لم يتم تسجيل أي عمليات بيع بعد</p>
          ) : (
            <div className="divide-y divide-divider -mx-5">
              {stats.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between px-5 py-3 hover:bg-page/60 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary font-latin">
                        {sale.reference_number}
                      </span>
                      <span className="text-xs text-text-muted">{formatDate(sale.sale_date)}</span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary mt-0.5 truncate">
                      {sale.customer?.full_name || 'عميل مسجل'}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-sm font-bold text-text-primary font-latin">
                      {formatCurrency(sale.sale_price - (sale.discount || 0))}
                    </div>
                    <div className="mt-0.5">
                      <PaymentStatusBadge status={sale.payment_status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

