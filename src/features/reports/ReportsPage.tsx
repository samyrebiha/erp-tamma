import React, { useEffect, useState } from 'react';
import { BarChart3, Download, DollarSign, Car, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Vehicle, Sale } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';

export const ReportsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [v, s] = await Promise.all([api.getVehicles(), api.getSales()]);
      setVehicles(v);
      setSales(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // إحصائيات مالية
  const soldVehicles = vehicles.filter((v) => v.status === 'sold');
  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  // حساب الهامش الأولي للسيارات المباعة التي تتوفر لها كافة القيم
  const salesWithMargin = sales.map((sale) => {
    const v = vehicles.find((item) => item.id === sale.vehicle_id);
    const netSale = sale.sale_price - (sale.discount || 0);
    const purchaseCost = (v?.purchase_price || 0) + (v?.extra_costs || 0);
    const initialMargin = v?.purchase_price ? netSale - purchaseCost : null;

    return {
      sale,
      vehicle: v,
      netSale,
      purchasePrice: v?.purchase_price || null,
      extraCosts: v?.extra_costs || 0,
      totalCost: purchaseCost,
      initialMargin,
    };
  });

  const totalSalesRevenue = sales.reduce(
    (sum, s) => sum + (s.sale_price - (s.discount || 0)),
    0
  );

  const totalInitialMargin = salesWithMargin.reduce((sum, item) => {
    return sum + (item.initialMargin || 0);
  }, 0);

  const totalCurrentStockValue = availableVehicles.reduce(
    (sum, v) => sum + (v.purchase_price || 0) + (v.extra_costs || 0),
    0
  );

  // تصدير جدول المبيعات والهامش إلى CSV باللغة العربية مع BOM لدعم Excel
  const exportToCSV = () => {
    const headers = [
      'رقم الوثيقة',
      'تاريخ البيع',
      'السيارة',
      'المشتري',
      'سعر البيع (د.ج)',
      'سعر الشراء (د.ج)',
      'المصاريف (د.ج)',
      'الهامش الأولي (د.ج)',
    ];

    const rows = salesWithMargin.map((item) => [
      item.sale.reference_number,
      item.sale.sale_date,
      item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : '—',
      item.sale.customer ? item.sale.customer.full_name : '—',
      item.netSale,
      item.purchasePrice || 0,
      item.extraCosts,
      item.initialMargin !== null ? item.initialMargin : 'غير مكتمل',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `erp_tamma_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-text-muted">جاري تحميل التقارير...</div>;
  }

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات وتصدير CSV */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">التقارير وهوامش العمليات المالية</h3>
          <p className="text-xs text-text-muted mt-0.5">
            حسابات الهامش الأولي بالدينار الجزائري (د.ج) = سعر البيع - سعر الشراء - المصاريف المدخلة
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<Download className="w-4 h-4" />}
          onClick={exportToCSV}
        >
          تصدير التقرير إلى CSV (Excel)
        </Button>
      </div>

      {/* المؤشرات المالية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي مداخيل المبيعات"
          value={formatCurrency(totalSalesRevenue)}
          subtitle={`لإجمالي ${sales.length} عملية بيع موثقة`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="إجمالي الهامش الأولي التقديري"
          value={formatCurrency(totalInitialMargin)}
          subtitle="قبل خصم المصاريف التشغيلية الثابتة والضرائب"
          icon={<TrendingUp className="w-5 h-5 text-status-available" />}
        />
        <StatCard
          title="قيمة المخزون الحالي غير المباع"
          value={formatCurrency(totalCurrentStockValue)}
          subtitle={`${availableVehicles.length} سيارة متاحة في المعرض`}
          icon={<Car className="w-5 h-5 text-[#B45309]" />}
        />
      </div>

      {/* تنويه الهامش الأولي */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-[8px] flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>ملاحظة محاسبية:</strong> يُقصد بـ «الهامش الأولي» الفرق المباشر بين سعر بيع السيارة وتكلفة شرائها مع مصاريف تجهيزها المباشرة المسجلة. لا يمثل هذا الرقم الربح الصافي النهائي للمعرض، حيث لم تُحسم منه تكاليف الإيجار، الرواتب، الفواتير أو الالتزامات الجبائية.
        </p>
      </div>

      {/* جدول تفاصيل الهوامش لكل سيارة مباعة */}
      <Card title="سجل هوامش السيارات المباعة" subtitle="تفصيل كل عملية بيع وتكلفتها المقابلة">
        {salesWithMargin.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">لا توجد عمليات بيع مسجلة لاحتساب الهوامش</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">رقم الوثيقة</th>
                  <th className="px-4 py-3">السيارة المباعة</th>
                  <th className="px-4 py-3">المشتري</th>
                  <th className="px-4 py-3">سعر البيع الصافي (د.ج)</th>
                  <th className="px-4 py-3">سعر الشراء (د.ج)</th>
                  <th className="px-4 py-3">المصاريف (د.ج)</th>
                  <th className="px-4 py-3">الهامش الأولي (د.ج)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {salesWithMargin.map((item) => (
                  <tr key={item.sale.id} className="hover:bg-page/50 transition-colors">
                    <td className="px-4 py-3 font-latin font-bold text-primary">
                      {item.sale.reference_number}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.sale.customer ? item.sale.customer.full_name : '—'}
                    </td>
                    <td className="px-4 py-3 font-latin font-bold text-slate-900">
                      {formatCurrency(item.netSale)}
                    </td>
                    <td className="px-4 py-3 font-latin text-text-secondary">
                      {formatCurrency(item.purchasePrice)}
                    </td>
                    <td className="px-4 py-3 font-latin text-text-secondary">
                      {formatCurrency(item.extraCosts)}
                    </td>
                    <td className="px-4 py-3 font-latin font-bold">
                      {item.initialMargin !== null ? (
                        <span
                          className={
                            item.initialMargin >= 0
                              ? 'text-status-available'
                              : 'text-status-danger'
                          }
                        >
                          {formatCurrency(item.initialMargin)}
                        </span>
                      ) : (
                        <span className="text-text-muted">بيانات ناقصة</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

