import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  ShieldCheck,
  Sparkles,
  MapPin,
  FileCheck,
  TrendingUp,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardStats, Vehicle, Sale, ShowroomSettings } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { StatCard, Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VehicleStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [statsData, settingsData, vehiclesData] = await Promise.all([
        api.getDashboardStats(),
        api.getSettings(),
        api.getVehicles(),
      ]);
      setStats(statsData);
      setSettings(settingsData);
      setAllVehicles(vehiclesData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-text-muted">
            جاري تهيئة لوحة قيادة معرض حسونة للسيارات...
          </p>
        </div>
      </div>
    );
  }

  // نتائج البحث السريع الحية إذا كتب المستخدم شيئاً
  const quickSearchResults = quickSearch.trim()
    ? allVehicles
        .filter((v) => {
          const q = quickSearch.toLowerCase();
          const vin = v.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value.toLowerCase();
          const reg = v.identifiers?.find((i) => i.identifier_type === 'registration_number')?.identifier_value.toLowerCase();
          return (
            v.brand.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            (vin && vin.includes(q)) ||
            (reg && reg.includes(q))
          );
        })
        .slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      {/* ====================================================================
          لوحة واجهة المعرض الترحيبية الكبرى (Showroom Grand Billboard)
          ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-[#1e3a8a] to-[#172554] text-white p-6 sm:p-8 shadow-lg border border-slate-700/50">
        {/* لمسات خلفية جمالية هندسية */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          {/* الشريط العلوي للوحة المعرض */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Award className="w-3.5 h-3.5" />
                المؤسسة المعتمدة لبيع وشراء المركبات
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/10 text-slate-200 border border-white/10 font-latin">
                RC: {settings?.commercial_register || '16/00-9874561B21'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary-soft" />
                {settings?.address || 'الجزائر العاصمة - الدار البيضاء'}
              </span>
              <span className="text-white/30">•</span>
              <span className="font-bold text-amber-400">العملة: د.ج (DZD)</span>
            </div>
          </div>

          {/* العنوان الرئيسي للوحة */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center border border-white/20">
                  <img
                    src="/logo.svg"
                    alt="شعار معرض حسونة"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {settings?.name || 'معرض حسونة لبيع وشراء السيارات'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                لوحة القيادة والمتابعة المركزية للمخزون، فحص وتوثيق أرقام الهيكل (VIN)، تسجيل عمليات الشراء والبيع، وإصدار وثائق التسليم الرسمية A4 بالدينار الجزائري.
              </p>
            </div>

            {/* أزرار الإجراءات السريعة في اللوحة */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/vehicles">
                <Button
                  size="md"
                  className="bg-white text-navy hover:bg-slate-100 shadow-md font-bold text-xs"
                  icon={<Plus className="w-4 h-4 text-primary" />}
                >
                  إضافة سيارة للمخزون
                </Button>
              </Link>
              <Link to="/sales">
                <Button
                  size="md"
                  className="bg-primary hover:bg-primary-hover text-white shadow-md font-bold text-xs border border-white/20"
                  icon={<Receipt className="w-4 h-4" />}
                >
                  تسجيل بيع / إخراج
                </Button>
              </Link>
            </div>
          </div>

          {/* محرك البحث السريع باللوحة */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <form onSubmit={handleQuickSearchSubmit} className="relative max-w-2xl">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="البحث الفوري عن أي سيارة في المعرض برقم الهيكل (VIN)، اللوحة، الماركة، أو الموديل..."
                className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 pr-10 py-3 text-xs text-white placeholder:text-slate-300 focus:bg-white focus:text-text-primary focus:border-white focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all"
              />
              {quickSearch && (
                <button
                  type="button"
                  onClick={() => setQuickSearch('')}
                  className="absolute left-3 top-3 text-xs text-slate-300 hover:text-white"
                >
                  مسح
                </button>
              )}
            </form>

            {/* قائمة نتائج البحث السريع المباشرة */}
            {quickSearchResults.length > 0 && (
              <div className="absolute z-30 max-w-2xl w-full mt-2 rounded-xl bg-white text-text-primary shadow-2xl border border-border divide-y divide-divider overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-text-muted flex items-center justify-between">
                  <span>نتائج البحث الفوري في مخزون معرض حسونة:</span>
                  <Link
                    to={`/vehicles?search=${encodeURIComponent(quickSearch)}`}
                    className="text-primary hover:underline"
                  >
                    عرض كافة النتائج
                  </Link>
                </div>
                {quickSearchResults.map((v) => {
                  const vin = v.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value;
                  return (
                    <Link
                      key={v.id}
                      to={`/vehicles/${v.id}`}
                      className="flex items-center justify-between p-3 hover:bg-page transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-primary">
                          {v.brand} {v.model} ({v.manufacture_year || '—'})
                        </div>
                        <div className="text-[11px] text-text-muted font-latin">VIN: {vin || '—'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <VehicleStatusBadge status={v.status} />
                        <span className="text-xs font-bold text-navy font-latin">
                          {formatCurrency(v.purchase_price)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          شبكة المؤشرات والإحصائيات الرئيسية المحدثة
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="السيارات المتاحة بالمخزون"
          value={stats.availableVehiclesCount}
          subtitle={
            stats.reservedVehiclesCount > 0
              ? `يوجد ${stats.reservedVehiclesCount} سيارة محجوزة بالعربون`
              : 'جاهزة للبيع والتسليم المباشر'
          }
          icon={<Car className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="السيارات المباعة والمخرجة"
          value={stats.soldVehiclesCount}
          subtitle="عمليات بيع موثقة بوثيقة تسليم"
          icon={<Receipt className="w-5 h-5 text-status-available" />}
        />
        <StatCard
          title="قيمة المخزون الحالي الإجمالية"
          value={formatCurrency(stats.totalInventoryPurchaseValue)}
          subtitle="تكلفة الشراء والمصاريف المسجلة"
          icon={<DollarSign className="w-5 h-5 text-[#B45309]" />}
        />
        <StatCard
          title="شبكة المعرض المسجلة"
          value={`${stats.customersCount} عميل / ${stats.suppliersCount} مورد`}
          subtitle="قاعدة بيانات الاتصال والتعاملات"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* ====================================================================
          جداول أحدث السيارات والمبيعات
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أحدث السيارات في المخزون */}
        <Card
          title="أحدث السيارات في مخزون المعرض"
          subtitle="السيارات المسجلة حديثاً في النظام"
          action={
            <Link
              to="/vehicles"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              عرض كل المخزون
              <ChevronLeft className="w-3.5 h-3.5" />
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
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-page/60 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">
                          {vehicle.brand} {vehicle.model}
                        </span>
                        <span className="text-xs text-text-muted">
                          ({vehicle.manufacture_year || '—'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted font-latin">
                        <span>VIN: {vin || 'غير محدد'}</span>
                        <span>•</span>
                        <span>{formatDate(vehicle.purchase_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <VehicleStatusBadge status={vehicle.status} />
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="text-xs font-bold text-primary hover:underline"
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

        {/* آخر عمليات البيع والتسليم الموثقة */}
        <Card
          title="آخر عمليات البيع والتسليم الموثقة"
          subtitle="سجل عقود ووثائق التسليم الرسمية"
          action={
            <Link
              to="/sales"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              سجل المبيعات
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {stats.recentSales.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">لم يتم تسجيل أي عمليات بيع بعد</p>
          ) : (
            <div className="divide-y divide-divider -mx-5">
              {stats.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-page/60 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary font-latin">
                        {sale.reference_number}
                      </span>
                      <span className="text-xs text-text-muted">{formatDate(sale.sale_date)}</span>
                    </div>
                    <p className="text-xs font-bold text-text-primary mt-0.5 truncate">
                      المشتري: {sale.customer?.full_name || 'عميل مسجل'}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-sm font-bold text-navy font-latin">
                      {formatCurrency(sale.sale_price - (sale.discount || 0))}
                    </div>
                    <div className="mt-0.5 flex justify-end">
                      <PaymentStatusBadge status={sale.payment_status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* شريط الإقرار الإداري وأمان النظام */}
      <div className="rounded-card bg-surface border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <span>
            <strong>معرض حسونة لبيع وشراء السيارات:</strong> النظام يمنع تكرار رقم الهيكل (VIN)، ويمنع البيع المزدوج لنفس السيارة، ويُنتج وثائق تسليم مطابقة للمقاس A4 بالدينار الجزائري.
          </span>
        </div>
        <Link to="/reports" className="text-xs font-bold text-primary hover:underline shrink-0">
          الانتقال لتقارير الأرباح والمبيعات ←
        </Link>
      </div>
    </div>
  );
};
