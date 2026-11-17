import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  Car,
  User,
  CheckCircle2,
  Clock,
  Wallet,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Sale, PaymentRecord, Customer, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { PAYMENT_METHOD_LABELS } from '../../lib/constants';

export const InstallmentsPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'debts' | 'history'>('debts');

  // نافذة تسجيل دفعة جديدة
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // حذف دفعة
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, paymentsData] = await Promise.all([
        api.getSales(),
        api.getPayments(),
      ]);
      setSales(salesData);
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // حساب المبالغ المدفوعة والمتبقية لكل عملية بيع
  const salesWithDebts = sales.map((sale) => {
    const salePayments = payments.filter((p) => p.sale_id === sale.id);
    const totalAdditionalPaid = salePayments.reduce((sum, p) => sum + p.amount, 0);

    const netPrice = sale.sale_price - (sale.discount || 0);

    // إذا كانت حالة الدفع paid في الأصل ولم تسجل دفعات منفصلة نعتبرها مدفوعة بالكامل
    let totalPaid = 0;
    if (sale.payment_status === 'paid' && totalAdditionalPaid === 0) {
      totalPaid = netPrice;
    } else {
      totalPaid = totalAdditionalPaid;
    }

    const remainingDebt = Math.max(0, netPrice - totalPaid);

    return {
      sale,
      netPrice,
      totalPaid,
      remainingDebt,
      isFullyPaid: remainingDebt === 0,
    };
  });

  // إحصائيات الديون والمستحقات
  const totalReceivables = salesWithDebts.reduce((sum, item) => sum + item.remainingDebt, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const debtorCount = salesWithDebts.filter((item) => item.remainingDebt > 0).length;

  const handleOpenPaymentModal = (item: (typeof salesWithDebts)[0]) => {
    setSelectedSale(item.sale);
    setPaymentAmount(item.remainingDebt > 0 ? item.remainingDebt.toString() : '');
    setErrorMsg(null);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;
    const amountNum = Number(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      setErrorMsg('يرجى كتابة مبلغ دفعة صحيح بالدينار الجزائري');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createPayment({
        sale_id: selectedSale.id,
        customer_id: selectedSale.customer_id,
        amount: amountNum,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      });

      setIsPaymentModalOpen(false);
      setSelectedSale(null);
      setPaymentAmount('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل الدفعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      setIsSubmitting(true);
      await api.deletePayment(paymentToDelete.id);
      setIsDeleteModalOpen(false);
      setPaymentToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSalesWithDebts = salesWithDebts.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.sale.reference_number.toLowerCase().includes(q) ||
      item.sale.customer?.full_name.toLowerCase().includes(q) ||
      item.sale.customer?.phone.includes(q) ||
      item.sale.vehicle?.brand.toLowerCase().includes(q) ||
      item.sale.vehicle?.model.toLowerCase().includes(q);

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* مؤشرات الديون والتحصيل */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>إجمالي الديون والمستحقات المتبقية</span>
          </div>
          <div className="text-xl font-extrabold text-amber-800 font-latin mt-1">
            {formatCurrency(totalReceivables)}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            عند <strong className="font-latin text-text-primary">{debtorCount}</strong> زبون غير مسدد بالكامل
          </div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>إجمالي الدفعات المسجلة بالمقبوضات</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-latin mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            مجموع سندات القبض المستلمة
          </div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>إجمالي عمليات البيع</span>
          </div>
          <div className="text-xl font-extrabold text-navy font-latin mt-1">
            {sales.length} <span className="text-xs font-normal text-text-muted">عملية مبيعات</span>
          </div>
        </div>
      </div>

      {/* تبويبات: جدول الديون مقابل سجل المقبوضات */}
      <div className="flex items-center gap-2 border-b border-divider pb-2">
        <button
          onClick={() => setActiveTab('debts')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-colors ${
            activeTab === 'debts'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-page'
          }`}
        >
          متابعة مستحقات وأقساط الزبائن ({debtorCount} مستحقات)
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-colors ${
            activeTab === 'history'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-page'
          }`}
        >
          سجل سندات القبض والدفعات ({payments.length} سند)
        </button>
      </div>

      {/* شريط البحث */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم الفاتورة، اسم الزبون، أو رقم الهاتف..."
          className="w-full max-w-md rounded-[8px] border border-border bg-page px-3.5 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
        />
      </div>

      {/* تبويب 1: جدول مستحقات وأقساط الزبائن */}
      {activeTab === 'debts' && (
        <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-text-muted">جاري تحميل سجل الأقساط...</div>
          ) : filteredSalesWithDebts.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-bold text-text-primary">لا توجد عمليات بيع مسجلة</h4>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                  <tr>
                    <th className="px-4 py-3">رقم العملية</th>
                    <th className="px-4 py-3">الزبون المدين</th>
                    <th className="px-4 py-3">السيارة المباعة</th>
                    <th className="px-4 py-3">السعر الصافي</th>
                    <th className="px-4 py-3">المبلغ المسدد</th>
                    <th className="px-4 py-3">المبلغ المتبقي (الدين)</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {filteredSalesWithDebts.map((item) => (
                    <tr key={item.sale.id} className="hover:bg-page/50 transition-colors">
                      <td className="px-4 py-3 font-latin font-bold text-primary">
                        {item.sale.reference_number}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">
                          {item.sale.customer?.full_name || '—'}
                        </div>
                        <div className="text-[11px] text-text-muted font-latin">
                          {item.sale.customer?.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {item.sale.vehicle ? (
                          <div className="font-bold text-text-primary">
                            {item.sale.vehicle.brand} {item.sale.vehicle.model}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="px-4 py-3 font-latin font-bold text-text-primary">
                        {formatCurrency(item.netPrice)}
                      </td>

                      <td className="px-4 py-3 font-latin font-bold text-emerald-700">
                        {formatCurrency(item.totalPaid)}
                      </td>

                      <td className="px-4 py-3 font-latin font-extrabold text-sm text-amber-800">
                        {formatCurrency(item.remainingDebt)}
                      </td>

                      <td className="px-4 py-3">
                        {item.isFullyPaid ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            مسدد بالكامل
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            متبقي أقساط
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 h-7"
                            icon={<Plus className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenPaymentModal(item)}
                          >
                            استلام دفعة
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* تبويب 2: سجل سندات القبض والدفعات السابقة */}
      {activeTab === 'history' && (
        <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-bold text-text-primary">لا توجد سندات قبض مسجلة</h4>
              <p className="text-xs text-text-muted mt-1">سجل أول دفعة نقدية أو بنكية من الزبائن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                  <tr>
                    <th className="px-4 py-3">رقم السند</th>
                    <th className="px-4 py-3">الزبون المسدد</th>
                    <th className="px-4 py-3">رقم الفاتورة المرتبطة</th>
                    <th className="px-4 py-3">تاريخ الدفعة</th>
                    <th className="px-4 py-3">المبلغ المقبوض</th>
                    <th className="px-4 py-3">طريقة الدفع</th>
                    <th className="px-4 py-3">ملاحظات</th>
                    <th className="px-4 py-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-page/50 transition-colors">
                      <td className="px-4 py-3 font-latin font-bold text-primary">
                        {p.receipt_number}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">
                          {p.customer?.full_name || '—'}
                        </div>
                        <div className="text-[11px] text-text-muted font-latin">
                          {p.customer?.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-latin font-bold text-text-secondary">
                        {p.sale?.reference_number || '—'}
                      </td>

                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(p.payment_date)}
                      </td>

                      <td className="px-4 py-3 font-latin font-extrabold text-sm text-emerald-700">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="px-4 py-3 text-text-secondary">
                        {PAYMENT_METHOD_LABELS[p.payment_method]}
                      </td>

                      <td className="px-4 py-3 text-text-muted text-[11px] truncate max-w-[150px]">
                        {p.notes || '—'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/installments/${p.id}/receipt`}>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs py-1 h-7"
                              icon={<Printer className="w-3.5 h-3.5" />}
                            >
                              وصل القبض A4
                            </Button>
                          </Link>

                          <button
                            onClick={() => {
                              setPaymentToDelete(p);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] border border-border text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="حذف هذا السند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* نافذة تسجيل دفعة جديدة */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="تسجيل دفعة / قسط مالي جديد"
        description="توثيق استلام مبلغ مالي من الزبون وإصدار وصل استلام رسمي"
        maxWidth="md"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {selectedSale && (
            <div className="p-3 bg-page rounded border border-border text-xs space-y-1">
              <div><strong>الزبون:</strong> {selectedSale.customer?.full_name} ({selectedSale.customer?.phone})</div>
              <div><strong>السيارة:</strong> {selectedSale.vehicle?.brand} {selectedSale.vehicle?.model}</div>
              <div><strong>رقم الفاتورة:</strong> <span className="font-latin font-bold">{selectedSale.reference_number}</span></div>
            </div>
          )}

          <Input
            label="مبلغ الدفعة المقبوضة (د.ج)"
            isRequired
            type="number"
            suffixElement="د.ج"
            dir="ltr"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="تاريخ الدفعة"
              type="date"
              isRequired
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <Select
              label="طريقة الدفع"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              options={[
                { value: 'cash', label: 'نقداً (Espèces)' },
                { value: 'bank_transfer', label: 'تحويل بنكي / CCP' },
                { value: 'cheque', label: 'صك بنكي (Chèque)' },
                { value: 'other', label: 'أخرى' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات أو رقم مرجع التحويل
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: دفعة ثانية، تحويل رقم 987456..."
              className="w-full rounded-[8px] border border-border bg-white p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-divider">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              تأكيد وإصدار السند
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد حذف السند */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف سند القبض"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف سند القبض رقم{' '}
            <strong className="text-primary font-latin">{paymentToDelete?.receipt_number}</strong> بمبلغ{' '}
            <strong className="font-latin">{formatCurrency(paymentToDelete?.amount || 0)}</strong>؟
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isSubmitting}
              onClick={handleConfirmDeletePayment}
            >
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

