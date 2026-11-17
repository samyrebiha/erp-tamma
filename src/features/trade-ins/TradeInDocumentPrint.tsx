import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { TradeIn, ShowroomSettings } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export const TradeInDocumentPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tradeIn, setTradeIn] = useState<TradeIn | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (tradeId: string) => {
    try {
      setLoading(true);
      const [tData, sData] = await Promise.all([
        api.getTradeInById(tradeId),
        api.getShowroomSettings(),
      ]);
      setTradeIn(tData);
      setSettings(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xs text-text-muted">جاري تجهيز وثيقة التبادل للطباعة...</div>
      </div>
    );
  }

  if (!tradeIn) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-bold text-text-primary">العملية غير موجودة</h3>
        <Link to="/trade-ins" className="text-primary text-xs mt-2 inline-block">
          العودة لقائمة التبادل
        </Link>
      </div>
    );
  }

  const sv = tradeIn.showroom_vehicle;
  const c = tradeIn.customer;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-right" dir="rtl">
      {/* شريط الإجراءات العلوي */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          to="/trade-ins"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-white px-3 py-2 rounded-card border border-border shadow-2xs"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة التبادل
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          طباعة الوثيقة / حفظ PDF (A4)
        </Button>
      </div>

      {/* ورقة الوثيقة الرسمية */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 lg:p-10 rounded-card shadow-sm border border-border print:border-none print:shadow-none print:p-0 text-text-primary text-xs leading-normal">
        {/* الترويسة */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded border border-border bg-white flex items-center justify-center p-1.5 shrink-0">
              <img
                src={settings?.logo_url || '/logo.svg'}
                alt={settings?.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-navy">
                {settings?.name || 'معرض حسونة أوتو'}
              </h1>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {settings?.address || 'أميه ونسة – الوادي، طريق تقرت'} | هاتف: {settings?.phone || '0662309669'}
              </p>
              <p className="text-[10px] text-primary font-bold">
                بيع • شراء • كراء • تبادل السيارات السياحية والنفعية
              </p>
            </div>
          </div>

          <div className="text-left font-latin">
            <div className="text-base font-extrabold text-primary">
              {tradeIn.reference_number}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              تاريخ المبادلة: {formatDate(tradeIn.trade_date)}
            </div>
          </div>
        </div>

        {/* عنوان الوثيقة */}
        <div className="text-center py-2 bg-slate-900 text-white rounded font-bold text-sm tracking-wide mb-5">
          وثيقة عقد مبادلة مركبات (CONTRAT D'ÉCHANGE DE VÉHICULES)
        </div>

        {/* بيانات الطرفين */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="border border-border rounded p-3 bg-page">
            <h3 className="font-bold text-navy border-b border-divider pb-1 mb-2">
              الطرف الأول (المعرض)
            </h3>
            <div className="space-y-1 text-[11px]">
              <div><strong>المؤسسة:</strong> {settings?.name}</div>
              <div><strong>العنوان:</strong> {settings?.address}</div>
              <div><strong>الهاتف:</strong> {settings?.phone}</div>
            </div>
          </div>

          <div className="border border-border rounded p-3 bg-page">
            <h3 className="font-bold text-navy border-b border-divider pb-1 mb-2">
              الطرف الثاني (الزبون المستبدل)
            </h3>
            <div className="space-y-1 text-[11px]">
              <div><strong>الاسم الكامل:</strong> {c?.full_name || '—'}</div>
              <div><strong>رقم الهاتف:</strong> {c?.phone || '—'}</div>
              <div><strong>رقم بطاقة الهوية:</strong> {c?.identity_number || '—'}</div>
            </div>
          </div>
        </div>

        {/* مقارنة المركبتين المستبدلتين */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* سيارة المعرض المسلمة للزبون */}
          <div className="border border-blue-200 bg-blue-50/40 rounded p-3">
            <h3 className="font-bold text-navy border-b border-blue-200 pb-1 mb-2">
              1. المركبة المسلمة من المعرض إلى الزبون
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div><strong>الماركة والطراز:</strong> {sv?.brand} {sv?.model}</div>
              <div><strong>سنة الصنع:</strong> {sv?.manufacture_year || '—'}</div>
              <div><strong>اللون:</strong> {sv?.color || '—'}</div>
              <div><strong>العداد:</strong> {sv?.mileage ? `${sv.mileage} كم` : '—'}</div>
              <div className="pt-1 mt-1 border-t border-blue-200/60 font-bold text-navy">
                سعر التقييم المتفق عليه: {formatCurrency(tradeIn.showroom_vehicle_price)}
              </div>
            </div>
          </div>

          {/* سيارة الزبون المقبولة لدى المعرض */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded p-3">
            <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
              2. المركبة المقبولة من الزبون لدى المعرض
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div><strong>الماركة والطراز:</strong> {tradeIn.incoming_brand} {tradeIn.incoming_model}</div>
              <div><strong>سنة الصنع:</strong> {tradeIn.incoming_year || '—'}</div>
              <div><strong>رقم اللوحة:</strong> {tradeIn.incoming_registration_number || '—'}</div>
              <div><strong>العداد:</strong> {tradeIn.incoming_mileage ? `${tradeIn.incoming_mileage} كم` : '—'}</div>
              <div className="pt-1 mt-1 border-t border-emerald-200/60 font-bold text-emerald-900">
                قيمة التقييم المتفق عليها: {formatCurrency(tradeIn.incoming_estimated_value)}
              </div>
            </div>
          </div>
        </div>

        {/* التسوية المالية للفارق */}
        <div className="border border-slate-900 rounded p-3.5 mb-5 bg-slate-50">
          <h3 className="font-bold text-navy border-b border-border pb-1 mb-2">
            التسوية المالية والفارق (Soulte de l'échange)
          </h3>
          <div className="flex items-center justify-between text-xs">
            <div>
              قيمة الفارق المالي المحتسب:{' '}
              <strong className="text-base font-extrabold text-navy font-latin">
                {formatCurrency(tradeIn.difference_amount)}
              </strong>
            </div>

            <div>
              {tradeIn.payer === 'customer' && (
                <span className="font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded">
                  يلتزم الزبون بتسديد الفارق للمعرض (تم السداد بالكامل)
                </span>
              )}
              {tradeIn.payer === 'showroom' && (
                <span className="font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded">
                  يلتزم المعرض بتسديد الفارق للزبون (تم السداد بالكامل)
                </span>
              )}
              {tradeIn.payer === 'even' && (
                <span className="font-bold text-slate-800 bg-slate-200 px-3 py-1 rounded">
                  تبادل متكافئ القيمة بدون أي فارق مالي
                </span>
              )}
            </div>
          </div>
        </div>

        {/* شروط التبادل القانونية */}
        <div className="border border-border rounded p-3 mb-6 text-[10px] text-text-secondary space-y-1">
          <p>• يصرح الطرفان برضاهما التام عن عملية التبادل وقيم التقييم المحددة أعلاه بعد المعاينة والفحص الميداني الدقيق للمركبتين.</p>
          <p>• يتعهد كل طرف بنقل ملكية المركبة المسلمة وتسليم كافة الوثائق والبطاقات الرمادية والمفاتيح الأصلية في الآجال القانونية.</p>
          <p>• هذه الوثيقة تعتبر اتفاقية مبادلة نهائية وملزمة للطرفين بعد التوقيع.</p>
        </div>

        {/* التوقيعات */}
        <div className="grid grid-cols-2 gap-8 pt-4 mt-6 border-t border-divider text-center">
          <div>
            <div className="font-bold text-navy mb-12">توقيع وختم المعرض (الطرف الأول)</div>
            <div className="text-[10px] text-text-muted">حرر في {formatDate(tradeIn.created_at)}</div>
          </div>

          <div>
            <div className="font-bold text-navy mb-12">توقيع الزبون (الطرف الثاني)</div>
            <div className="text-[10px] text-text-muted font-latin">{c?.full_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
