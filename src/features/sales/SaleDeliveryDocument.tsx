import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Sale, ShowroomSettings } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  IDENTIFIER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CONFIG,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';

export const SaleDeliveryDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([api.getSales(), api.getSettings()]).then(([salesList, s]) => {
        const found = salesList.find((item) => item.id === id);
        setSale(found || null);
        setSettings(s);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        جاري تجهيز وثيقة التسليم والإخراج...
      </div>
    );
  }

  if (!sale || !sale.vehicle) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        لم يتم العثور على وثيقة البيع المحددة.
        <Link to="/sales" className="block text-primary mt-2">
          العودة لسجل المبيعات
        </Link>
      </div>
    );
  }

  const { vehicle, customer } = sale;
  const netPrice = sale.sale_price - (sale.discount || 0);

  return (
    <div className="min-h-screen bg-page py-6 px-4">
      {/* شريط الإجراءات العلوي (يختفي في الطباعة no-print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-surface p-4 rounded-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/sales"
            className="p-2 rounded-[8px] border border-border text-text-secondary hover:text-text-primary hover:bg-page transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-text-primary">
              معاينة وثيقة إخراج وتسليم السيارة
            </h2>
            <p className="text-xs text-text-muted">
              رقم الوثيقة: <span className="font-latin font-bold">{sale.reference_number}</span>
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          طباعة / حفظ PDF
        </Button>
      </div>

      {/* ورقة الوثيقة الرسمية بحجم A4 */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 border border-border shadow-sm print-container print:p-0 print:border-none print:shadow-none text-text-primary">
        {/* ترويسة المعرض الرسمية */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              {settings?.name || 'معرض السيارات'}
            </h1>
            <p className="text-xs text-text-secondary">
              {settings?.address || 'الجزائر'}
            </p>
            <div className="flex items-center gap-4 text-xs text-text-secondary font-latin pt-0.5">
              <span>هاتف: {settings?.phone || '—'}</span>
              <span>س.ت: {settings?.commercial_register || '—'}</span>
              <span>ر.ج: {settings?.tax_number || '—'}</span>
            </div>
          </div>

          <div className="text-left space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold tracking-wide">
              وثيقة إخراج وتسليم سيارة
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 font-latin pt-1">
              المرجع: {sale.reference_number}
            </div>
            <div className="text-[11px] text-text-muted">
              تاريخ التسليم: {formatDate(sale.sale_date)}
            </div>
          </div>
        </div>

        {/* تنويه قانوني وتسليم */}
        <div className="my-5 p-3 bg-slate-50 border border-slate-200 rounded text-xs leading-relaxed text-slate-800">
          تثبت هذه الوثيقة الرسمية إخراج المركبة المبيّنة تفاصيلها أدناه من مخزون المعرض وتسليمها رسمياً للمشتري، بعد إتمام الإجراءات والاتفاق المالي.
        </div>

        {/* قسم 1: بيانات المشتري */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 mb-2 border-b border-slate-200">
            أولاً: بيانات المشتري (المستلم)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 border border-slate-200 rounded">
            <div>
              <span className="text-text-muted block text-[11px]">الاسم واللقب الكامل:</span>
              <span className="font-bold text-slate-900 text-sm">{customer?.full_name || '—'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">رقم الهاتف:</span>
              <span className="font-bold text-slate-900 font-latin text-sm">{customer?.phone || '—'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">رقم بطاقة الهوية / التعريف:</span>
              <span className="font-bold text-slate-900 font-latin text-sm">{customer?.identity_number || '—'}</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-text-muted block text-[11px]">العنوان السكني:</span>
              <span className="font-semibold text-slate-800">{customer?.address || '—'}</span>
            </div>
          </div>
        </div>

        {/* قسم 2: بيانات ومواصفات السيارة */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 mb-2 border-b border-slate-200">
            ثانياً: بيانات ومواصفات المركبة المسلمة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 border border-slate-200 rounded">
            <div>
              <span className="text-text-muted block text-[11px]">الماركة والطراز:</span>
              <span className="font-bold text-slate-900 text-sm">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">الفئة:</span>
              <span className="font-semibold text-slate-900">{vehicle.trim || 'قياسية'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">سنة الصنع:</span>
              <span className="font-bold text-slate-900 font-latin">{vehicle.manufacture_year || '—'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">اللون الخارجي:</span>
              <span className="font-semibold text-slate-900">{vehicle.color || '—'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">نوع الوقود:</span>
              <span className="font-semibold text-slate-900">
                {vehicle.fuel_type ? FUEL_TYPE_LABELS[vehicle.fuel_type] : '—'}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">ناقل الحركة:</span>
              <span className="font-semibold text-slate-900">
                {vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : '—'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-text-muted block text-[11px]">العداد عند التسليم:</span>
              <span className="font-bold text-slate-900 font-latin">
                {formatNumber(vehicle.mileage, 'كم')}
              </span>
            </div>
          </div>
        </div>

        {/* قسم 3: الأرقام التعريفية الكاملة للسيارة */}
        <div className="mb-6 avoid-break">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 mb-2 border-b border-slate-200">
            ثالثاً: الأرقام التعريفية الثابتة للمركبة
          </h3>
          <table className="w-full text-right text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800">
              <tr>
                <th className="p-2 border-b border-slate-300 font-bold w-1/3">نوع المعرّف</th>
                <th className="p-2 border-b border-slate-300 font-bold">القيمة الموثقة في وثائق السيارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vehicle.identifiers && vehicle.identifiers.length > 0 ? (
                vehicle.identifiers.map((ident) => (
                  <tr key={ident.id}>
                    <td className="p-2 font-semibold text-slate-700">
                      {ident.identifier_type === 'other'
                        ? ident.custom_type_name || 'رقم آخر'
                        : IDENTIFIER_TYPE_LABELS[ident.identifier_type]}
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-900 font-latin tracking-wide text-xs">
                      {ident.identifier_value}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-text-muted">
                    لا توجد أرقام تعريفية إضافية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* قسم 4: البيانات المالية بالدينار الجزائري (د.ج) */}
        <div className="mb-6 avoid-break">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 mb-2 border-b border-slate-200">
            رابعاً: البيانات المالية بالدينار الجزائري (د.ج)
          </h3>
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-right text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 bg-slate-50 text-slate-700 font-semibold w-1/3">سعر البيع الإجمالي:</td>
                  <td className="p-2.5 font-bold font-latin text-slate-900">
                    {formatCurrency(sale.sale_price)}
                  </td>
                </tr>
                {sale.discount > 0 && (
                  <tr>
                    <td className="p-2.5 bg-slate-50 text-slate-700 font-semibold">قيمة الخصم المتفق عليه:</td>
                    <td className="p-2.5 font-bold font-latin text-slate-700">
                      - {formatCurrency(sale.discount)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100">
                  <td className="p-2.5 text-slate-900 font-bold">المبلغ الصافي المستحق:</td>
                  <td className="p-2.5 font-bold font-latin text-base text-navy">
                    {formatCurrency(netPrice)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 text-slate-700 font-semibold">طريقة وحالة السداد:</td>
                  <td className="p-2.5 text-slate-800">
                    <span className="font-semibold">
                      {sale.payment_method ? PAYMENT_METHOD_LABELS[sale.payment_method] : 'نقداً'}
                    </span>
                    <span className="mx-2 text-slate-400">|</span>
                    <span className="font-bold text-slate-900">
                      {PAYMENT_STATUS_CONFIG[sale.payment_status]?.label || sale.payment_status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* شروط وملاحظات التسليم */}
        <div className="mb-8 avoid-break text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 mb-2 border-b border-slate-200">
            خامساً: شروط وإقرار التسليم
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed space-y-1.5">
            <p>
              {settings?.delivery_terms ||
                'تسلم المشتري المركبة المذكورة أعلاه بعد معاينتها وفحصها فنياً وقبولها بحالتها الراهنة، واستلم كافة وثائقها ومفاتيحها.'}
            </p>
            {sale.notes && (
              <p className="font-semibold text-slate-900 pt-1 border-t border-slate-200">
                ملاحظات خاصة: {sale.notes}
              </p>
            )}
          </div>
        </div>

        {/* خانات التوقيع الرسمية */}
        <div className="mt-12 pt-4 border-t-2 border-slate-800 grid grid-cols-2 gap-12 avoid-break">
          <div className="text-center">
            <span className="block text-xs font-bold text-slate-900 mb-1">
              توقيع وإقرار المشتري (المستلم)
            </span>
            <span className="block text-[11px] text-text-muted mb-14">
              «أقر باستلام السيارة المذكورة ووثائقها بحالة مرضية»
            </span>
            <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto" />
          </div>

          <div className="text-center">
            <span className="block text-xs font-bold text-slate-900 mb-1">
              ختم وتوقيع إدارة المعرض
            </span>
            <span className="block text-[11px] text-text-muted mb-14">
              المسؤول المعتمد لتسليم المركبات
            </span>
            <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

