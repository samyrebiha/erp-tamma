import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { PaymentRecord, ShowroomSettings } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { PAYMENT_METHOD_LABELS } from '../../lib/constants';

export const PaymentReceiptPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (paymentId: string) => {
    try {
      setLoading(true);
      const [paymentsList, sData] = await Promise.all([
        api.getPayments(),
        api.getShowroomSettings(),
      ]);
      const found = paymentsList.find((p: PaymentRecord) => p.id === paymentId) || null;
      setPayment(found);
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
        <div className="text-xs text-text-muted">جاري تجهيز سند القبض...</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-bold text-text-primary">السند غير موجود</h3>
        <Link to="/installments" className="text-primary text-xs mt-2 inline-block">
          العودة لإدارة الأقساط
        </Link>
      </div>
    );
  }

  const c = payment.customer;
  const s = payment.sale;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-right" dir="rtl">
      {/* شريط الإجراءات العلوي */}
      <div className="max-w-[190mm] mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          to="/installments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-white px-3 py-2 rounded-card border border-border shadow-2xs"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لإدارة الأقساط والديون
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          طباعة سند القبض / حفظ PDF
        </Button>
      </div>

      {/* ورقة سند القبض الرسمية */}
      <div className="max-w-[190mm] mx-auto bg-white p-8 rounded-card shadow-sm border border-border print:border-none print:shadow-none print:p-0 text-text-primary text-xs leading-normal">
        {/* الترويسة */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded border border-border bg-white flex items-center justify-center p-1 shrink-0">
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
              <h1 className="text-base font-extrabold text-navy">
                {settings?.name || 'معرض حسونة أوتو'}
              </h1>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {settings?.address || 'أميه ونسة – الوادي، طريق تقرت'} | هاتف: {settings?.phone || '0662309669'}
              </p>
            </div>
          </div>

          <div className="text-left font-latin">
            <div className="text-base font-extrabold text-primary">
              {payment.receipt_number}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              تاريخ السند: {formatDate(payment.payment_date)}
            </div>
          </div>
        </div>

        {/* عنوان الوثيقة */}
        <div className="text-center py-1.5 bg-slate-900 text-white rounded font-bold text-xs tracking-wider mb-5">
          سند قبض واستلام دفعة مالية (REÇU DE PAIEMENT)
        </div>

        {/* بيانات الدفعة والمستلم */}
        <div className="border border-border rounded p-4 mb-5 bg-page space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-text-muted">استلمنا من السيد(ة): </span>
              <strong className="text-sm font-bold text-navy">{c?.full_name || '—'}</strong>
            </div>
            <div>
              <span className="text-text-muted">رقم الهاتف: </span>
              <strong className="font-latin">{c?.phone || '—'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-divider">
            <div>
              <span className="text-text-muted">مبلغ وقدره: </span>
              <strong className="text-base font-extrabold text-emerald-700 font-latin">
                {formatCurrency(payment.amount)}
              </strong>
            </div>
            <div>
              <span className="text-text-muted">طريقة الدفع: </span>
              <strong>{PAYMENT_METHOD_LABELS[payment.payment_method]}</strong>
            </div>
          </div>

          {s && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-divider text-[11px]">
              <div>
                <span className="text-text-muted">مقابل العملية / الفاتورة: </span>
                <strong className="font-latin">{s.reference_number}</strong>
              </div>
              <div>
                <span className="text-text-muted">السيارة المعنية: </span>
                <strong>{s.vehicle?.brand} {s.vehicle?.model}</strong>
              </div>
            </div>
          )}

          {payment.notes && (
            <div className="pt-2 border-t border-divider text-[11px]">
              <span className="text-text-muted">ملاحظات: </span>
              <span>{payment.notes}</span>
            </div>
          )}
        </div>

        {/* التوقيعات والختم */}
        <div className="grid grid-cols-2 gap-8 pt-6 mt-8 border-t border-divider text-center">
          <div>
            <div className="font-bold text-navy mb-12">توقيع المستلم (أمين الصندوق / الإدارة)</div>
            <div className="text-[10px] text-text-muted">معرض حسونة أوتو</div>
          </div>

          <div>
            <div className="font-bold text-navy mb-12">توقيع الزبون المسدد</div>
            <div className="text-[10px] text-text-muted font-latin">{c?.full_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
