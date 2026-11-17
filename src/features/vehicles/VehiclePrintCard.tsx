import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, Car, Shield } from 'lucide-react';
import { api } from '../../lib/api';
import { Vehicle, ShowroomSettings } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  IDENTIFIER_TYPE_LABELS,
  VEHICLE_STATUS_CONFIG,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { QRCodeView } from '../../components/ui/QRCodeView';

export const VehiclePrintCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([api.getVehicleById(id), api.getSettings()]).then(([v, s]) => {
        setVehicle(v);
        setSettings(s);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-text-muted">جاري تجهيز بطاقة السيارة...</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        لم يتم العثور على السيارة.
        <Link to="/vehicles" className="block text-primary mt-2">العودة للمخزون</Link>
      </div>
    );
  }

  const currentDateFormatted = new Intl.DateTimeFormat('ar-DZ', {
    dateStyle: 'full',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-page py-6 px-4">
      {/* شريط الإجراءات العلوي (يختفي تماماً عند الطباعة) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-surface p-4 rounded-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="p-2 rounded-[8px] border border-border text-text-secondary hover:text-text-primary hover:bg-page transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-text-primary">
              معاينة بطاقة معلومات السيارة قبل الطباعة
            </h2>
            <p className="text-xs text-text-muted">
              وثيقة قياسية A4 معدة للحفظ كملف PDF أو الطباعة الورقية
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

      {/* ورقة الوثيقة A4 الرسمية */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 border border-border shadow-sm print-container print:p-0 print:border-none print:shadow-none text-text-primary">
        {/* ترويسة المعرض الرسمية مع الشعار */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="شعار المعرض" className="w-16 h-16 object-contain shrink-0" />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy">
                {settings?.name || 'معرض حسونة لبيع وشراء السيارات'}
              </h1>
              <p className="text-xs text-text-secondary">
                {settings?.address || 'الجزائر العاصمة - الدار البيضاء، طريق المعارض رقم 44'}
              </p>
              <p className="text-xs text-text-secondary font-latin">
                هاتف: {settings?.phone || '0550 12 34 56 / 0661 78 90 12'}
              </p>
            </div>
          </div>

          <div className="text-left space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold tracking-wide">
              بطاقة معلومات سيارة معتمدة
            </div>
            <p className="text-[11px] text-text-muted mt-1 font-latin">تاريخ الإصدار: {currentDateFormatted}</p>
          </div>
        </div>

        {/* ملخص الماركة والحالة والصورة إن وجدت */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {vehicle.images && vehicle.images.length > 0 && (
              <img
                src={vehicle.images.find((img) => img.is_primary)?.storage_path || vehicle.images[0].storage_path}
                alt={vehicle.model}
                className="w-24 h-18 object-cover rounded border border-slate-300 shrink-0"
              />
            )}
            <div>
              <span className="text-xs text-text-muted block">السيارة والموديل:</span>
              <span className="text-xl font-bold text-navy">
                {vehicle.brand} {vehicle.model}
              </span>
              <span className="text-xs text-text-secondary mr-2">
                ({vehicle.trim || 'فئة قياسية'})
              </span>
            </div>
          </div>

          <div className="text-left shrink-0">
            <span className="text-xs text-text-muted block">حالة السيارة بالمخزون:</span>
            <span
              className="inline-block px-3 py-1 rounded text-xs font-bold border mt-0.5"
              style={{
                color: VEHICLE_STATUS_CONFIG[vehicle.status]?.textColor || '#000',
                backgroundColor: VEHICLE_STATUS_CONFIG[vehicle.status]?.bgColor || '#eee',
                borderColor: VEHICLE_STATUS_CONFIG[vehicle.status]?.borderColor || '#ccc',
              }}
            >
              {VEHICLE_STATUS_CONFIG[vehicle.status]?.label || vehicle.status}
            </span>
          </div>
        </div>

        {/* جدول المواصفات الفنية */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-200">
            أولاً: المواصفات الفنية للسيارة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-text-muted block text-[11px]">سنة الصنع:</span>
              <span className="font-bold text-slate-900 font-latin text-sm">
                {vehicle.manufacture_year || '—'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-text-muted block text-[11px]">اللون الخارجي:</span>
              <span className="font-bold text-slate-900 text-sm">{vehicle.color || '—'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-text-muted block text-[11px]">نوع الوقود:</span>
              <span className="font-bold text-slate-900 text-sm">
                {vehicle.fuel_type ? FUEL_TYPE_LABELS[vehicle.fuel_type] : '—'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-text-muted block text-[11px]">ناقل الحركة:</span>
              <span className="font-bold text-slate-900 text-sm">
                {vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : '—'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded col-span-2">
              <span className="text-text-muted block text-[11px]">المسافة المقطوعة (العداد):</span>
              <span className="font-bold text-slate-900 font-latin text-sm">
                {formatNumber(vehicle.mileage, 'كم')}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded col-span-2">
              <span className="text-text-muted block text-[11px]">تاريخ دخول المعرض:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatDate(vehicle.purchase_date)}
              </span>
            </div>
          </div>
        </div>

        {/* جدول الأرقام التعريفية الكامل */}
        <div className="mb-6 avoid-break">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-200">
            ثانياً: الأرقام التعريفية الرسمية للمركبة
          </h3>
          <table className="w-full text-right text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800">
              <tr>
                <th className="p-2.5 border-b border-slate-300 font-bold w-1/3">نوع الرقم التعريفي</th>
                <th className="p-2.5 border-b border-slate-300 font-bold">القيمة المسجلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vehicle.identifiers && vehicle.identifiers.length > 0 ? (
                vehicle.identifiers.map((ident) => (
                  <tr key={ident.id}>
                    <td className="p-2.5 font-semibold text-slate-700">
                      {ident.identifier_type === 'other'
                        ? ident.custom_type_name || 'رقم آخر'
                        : IDENTIFIER_TYPE_LABELS[ident.identifier_type]}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 font-latin tracking-wider text-sm">
                      {ident.identifier_value}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-text-muted">
                    لا توجد أرقام تعريفية مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ملاحظات الفحص والتقرير */}
        {vehicle.description && (
          <div className="mb-8 avoid-break">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 mb-2 border-b border-slate-200">
              ثالثاً: حالة الفحص والملاحظات
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed p-3 bg-slate-50 border border-slate-200 rounded">
              {vehicle.description}
            </p>
          </div>
        )}

        {/* تذييل الوثيقة الرسمي وختم المعرض ورمز التحقق QR Code */}
        <div className="mt-12 pt-6 border-t border-slate-300 flex items-end justify-between avoid-break">
          <div className="flex items-center gap-4">
            <QRCodeView
              value={`معرض حسونة لبيع وشراء السيارات\nبطاقة معلومات سيارة\nالسيارة: ${vehicle.brand} ${vehicle.model}\nVIN: ${vehicle.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value || '—'}\nالحالة: ${vehicle.status}\nرمز التحقق: CAR-${vehicle.id.slice(0, 8).toUpperCase()}`}
              size={80}
              label="رمز التحقق المعتمد"
            />
            <div className="text-xs text-text-muted space-y-1">
              <p className="font-semibold text-slate-800">معرض حسونة لبيع وشراء السيارات</p>
              <p>وثيقة إلكترونية موثقة ومطابقة لسجلات المخزون الداخلي للمؤسسة.</p>
              <p className="font-latin text-[11px]">تاريخ المعاينة والطباعة: {new Date().toLocaleString('ar-DZ')}</p>
            </div>
          </div>

          <div className="text-center w-52">
            <span className="block text-xs font-bold text-slate-800 mb-12">
              ختم وتوقيع إدارة معرض حسونة للسيارات
            </span>
            <div className="border-b border-slate-400 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

