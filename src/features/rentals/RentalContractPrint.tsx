import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, KeyRound, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { RentalContract, ShowroomSettings } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export const RentalContractPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<RentalContract | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (contractId: string) => {
    try {
      setLoading(true);
      const [cData, sData] = await Promise.all([
        api.getRentalById(contractId),
        api.getShowroomSettings(),
      ]);
      setContract(cData);
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
        <div className="text-xs text-text-muted">جاري تجهيز عقد الكراء للطباعة...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-bold text-text-primary">العقد غير موجود</h3>
        <Link to="/rentals" className="text-primary text-xs mt-2 inline-block">
          العودة لقائمة عقود الكراء
        </Link>
      </div>
    );
  }

  const v = contract.vehicle;
  const c = contract.customer;
  const vin = v?.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value;
  const reg = v?.identifiers?.find((i) => i.identifier_type === 'registration_number')?.identifier_value;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-right" dir="rtl">
      {/* شريط الإجراءات العلوي - يختفي عند الطباعة */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          to="/rentals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-white px-3 py-2 rounded-card border border-border shadow-2xs"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لإدارة عقود الكراء
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          طباعة العقد / حفظ بصيغة PDF (A4)
        </Button>
      </div>

      {/* ورقة العقد الرسمية بحجم A4 */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 lg:p-10 rounded-card shadow-sm border border-border print:border-none print:shadow-none print:p-0 text-text-primary text-xs leading-normal">
        {/* ترويسة العقد الرسمية */}
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
                خدمات كراء، بيع، شراء، وتبادل السيارات السياحية والتجارية
              </p>
            </div>
          </div>

          <div className="text-left font-latin">
            <div className="text-base font-extrabold text-primary">
              {contract.contract_number}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              تاريخ التحرير: {formatDate(contract.created_at)}
            </div>
          </div>
        </div>

        {/* عنوان الوثيقة */}
        <div className="text-center py-2 bg-slate-900 text-white rounded font-bold text-sm tracking-wide mb-5">
          عقد كراء سيارة سياحية بدون سائق (CONTRAT DE LOCATION DE VÉHICULE)
        </div>

        {/* الطرفان المتعاقدان */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="border border-border rounded p-3 bg-page">
            <h3 className="font-bold text-navy border-b border-divider pb-1 mb-2">
              الطرف الأول: المؤجـر (المعرض)
            </h3>
            <div className="space-y-1 text-[11px]">
              <div><strong>المؤسسة:</strong> {settings?.name}</div>
              <div><strong>العنوان:</strong> {settings?.address}</div>
              <div><strong>الهاتف:</strong> {settings?.phone}</div>
              {settings?.commercial_register && (
                <div><strong>السجل التجاري:</strong> {settings.commercial_register}</div>
              )}
            </div>
          </div>

          <div className="border border-border rounded p-3 bg-page">
            <h3 className="font-bold text-navy border-b border-divider pb-1 mb-2">
              الطرف الثاني: المستأجـر (الزبون)
            </h3>
            <div className="space-y-1 text-[11px]">
              <div><strong>الاسم واللقب:</strong> {c?.full_name || '—'}</div>
              <div><strong>رقم الهاتف:</strong> {c?.phone || '—'}</div>
              <div><strong>رقم بطاقة الهوية:</strong> {c?.identity_number || '—'}</div>
              <div><strong>رقم رخصة السياقة:</strong> {contract.driver_license_number || '—'}</div>
              {contract.driver_license_issue_date && (
                <div><strong>تاريخ إصدار الرخصة:</strong> {formatDate(contract.driver_license_issue_date)}</div>
              )}
            </div>
          </div>
        </div>

        {/* مواصفات السيارة المؤجرة */}
        <div className="border border-border rounded p-3 mb-5">
          <h3 className="font-bold text-navy border-b border-divider pb-1 mb-2">
            مواصفات المركبة المؤجرة
          </h3>
          <div className="grid grid-cols-4 gap-2 text-[11px]">
            <div><strong>الماركة والطراز:</strong> {v?.brand} {v?.model}</div>
            <div><strong>سنة الصنع:</strong> {v?.manufacture_year || '—'}</div>
            <div><strong>اللون:</strong> {v?.color || '—'}</div>
            <div><strong>رقم اللوحة:</strong> <span className="font-latin font-bold">{reg || '—'}</span></div>
            <div><strong>رقم الهيكل (VIN):</strong> <span className="font-latin font-mono text-[10px]">{vin || '—'}</span></div>
            <div><strong>نوع الوقود:</strong> {v?.fuel_type || '—'}</div>
            <div><strong>العداد عند الخروج:</strong> {formatNumber(contract.start_mileage, 'كم')}</div>
            <div><strong>العداد عند الإرجاع:</strong> {contract.end_mileage ? formatNumber(contract.end_mileage, 'كم') : 'قيد الكراء'}</div>
          </div>
        </div>

        {/* الشروط المالية والزمنية */}
        <div className="border border-border rounded p-3 mb-5">
          <h3 className="font-bold text-navy border-b border-divider pb-1 mb-2">
            البيانات الزمنية والتسوية المالية
          </h3>
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div><strong>تاريخ الاستلام:</strong> {formatDate(contract.start_date)}</div>
            <div><strong>تاريخ الإرجاع المتفق عليه:</strong> {formatDate(contract.end_date)}</div>
            <div><strong>المدة الإجمالية:</strong> {contract.total_days} يوم</div>

            <div><strong>سعر اليوم الواحد:</strong> {formatCurrency(contract.daily_rate)}</div>
            <div><strong>المبلغ الإجمالي للكراء:</strong> <span className="font-bold text-primary">{formatCurrency(contract.total_amount)}</span></div>
            <div><strong>مبلغ الكفالة / الضمان (Caution):</strong> <span className="font-bold text-amber-700">{formatCurrency(contract.deposit_amount)}</span></div>
          </div>
        </div>

        {/* بنود وشروط العقد القانونية */}
        <div className="border border-border rounded p-3 mb-5 text-[10px] text-text-secondary space-y-1">
          <h3 className="font-bold text-navy text-[11px] mb-1">
            البنود والشروط العامة للاتفاقية:
          </h3>
          <p>1. يقر المستأجر باستلام المركبة في حالة ميكانيكية وهيكلية سليمة، ويتعهد بقيادتها بحذر واستعمالها داخل التراب الوطني فقط.</p>
          <p>2. يُمنع منعاً باتاً التنازل عن قيادة المركبة للغير أو استعمالها في نشاطات تخالف القوانين والتشريعات السارية في الجزائر.</p>
          <p>3. يتحمل المستأجر كامل المسؤولية المدنية والجزائية والمخالفات المرورية المسجلة على المركبة خلال مدة هذا العقد حتى إرجاعها رسمياً.</p>
          <p>4. يُسترجع مبلغ الكفالة / الضمان كاملاً للمستأجر بعد إرجاع المركبة ومعاينتها والتأكد من سلامتها وخلوها من الصدمات ومطابقة الوقود.</p>
        </div>

        {/* التوقيعات الرسمية */}
        <div className="grid grid-cols-2 gap-8 pt-4 mt-6 border-t border-divider text-center">
          <div>
            <div className="font-bold text-navy mb-12">توقيع وختم المؤجر (معرض حسونة أوتو)</div>
            <div className="text-[10px] text-text-muted">حرر في {formatDate(contract.created_at)}</div>
          </div>

          <div>
            <div className="font-bold text-navy mb-12">توقيع المستأجر مع كتابة «قرئ وصودق عليه»</div>
            <div className="text-[10px] text-text-muted font-latin">{c?.full_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
