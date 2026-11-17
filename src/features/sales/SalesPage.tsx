import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,
  FileText,
  Printer,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Car,
  User,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Sale, Vehicle, Customer, PaymentMethod, PaymentStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CONFIG,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { PaymentStatusBadge } from '../../components/ui/Badge';

export const SalesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');

  const [sales, setSales] = useState<Sale[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // نافذة البيع
  const [isModalOpen, setIsModalOpen] = useState(Boolean(preselectedVehicleId));
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // نموذج البيع
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // نموذج عميل سريع
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerIdNumber, setNewCustomerIdNumber] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (preselectedVehicleId) {
      setSelectedVehicleId(preselectedVehicleId);
      setIsModalOpen(true);
    }
  }, [preselectedVehicleId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [salesData, vehiclesData, customersData] = await Promise.all([
        api.getSales(),
        api.getVehicles(),
        api.getCustomers(),
      ]);
      setSales(salesData);
      setVehicles(vehiclesData);
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomerInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      alert('يرجى إدخال اسم العميل ورقم الهاتف');
      return;
    }
    try {
      const created = await api.createCustomer({
        full_name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        address: newCustomerAddress.trim() || null,
        identity_number: newCustomerIdNumber.trim() || null,
      });
      setCustomers([created, ...customers]);
      setSelectedCustomerId(created.id);
      setIsNewCustomerModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerAddress('');
      setNewCustomerIdNumber('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedVehicleId) {
      setErrorMsg('يرجى اختيار السيارة المراد بيعها وإخراجها');
      return;
    }
    if (!selectedCustomerId) {
      setErrorMsg('يرجى اختيار العميل المشتري');
      return;
    }
    const priceNum = Number(salePrice);
    if (!priceNum || priceNum <= 0) {
      setErrorMsg('يرجى إدخال سعر بيع صحيح بالدينار الجزائري (د.ج)');
      return;
    }

    try {
      setIsSubmitting(true);
      const newSale = await api.processSale({
        vehicleId: selectedVehicleId,
        customerId: selectedCustomerId,
        salePrice: priceNum,
        discount: Number(discount) || 0,
        paymentMethod,
        paymentStatus,
        notes: notes.trim() || undefined,
      });

      setIsModalOpen(false);
      // تنظيف النموذج
      setSelectedVehicleId('');
      setSelectedCustomerId('');
      setSalePrice('');
      setDiscount('0');
      setNotes('');
      await loadAll();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إتمام عملية البيع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableVehicles = vehicles.filter(
    (v) => v.status === 'available' || v.status === 'reserved' || v.id === selectedVehicleId
  );

  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const target = vehicles.find((v) => v.id === vehicleId);
    if (target?.reservation) {
      setSelectedCustomerId(target.reservation.customer_id);
      setDiscount(target.reservation.deposit_amount.toString());
      setNotes(
        `تم خصم مبلغ العربون المدفوع مسبقاً بقيمة ${target.reservation.deposit_amount} د.ج من إجمالي السعر المتفق عليه.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات والترويسة */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">سجل عمليات البيع والتسليم</h3>
          <p className="text-xs text-text-muted mt-0.5">
            توثيق تسليم السيارات للمشترين وإصدار وثائق التسليم الرسمية A4
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
        >
          تسجيل عملية بيع / إخراج
        </Button>
      </div>

      {/* جدول المبيعات */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل سجل المبيعات...</div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لم يتم تسجيل أي عمليات بيع بعد</h4>
            <p className="text-xs text-text-muted mt-1">
              قم باختيار سيارة من المخزون وتسجيل عملية بيع وتوليد وثيقة تسليم رسمية.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">رقم الوثيقة المرجعي</th>
                  <th className="px-4 py-3">السيارة المباعة</th>
                  <th className="px-4 py-3">العميل / المشتري</th>
                  <th className="px-4 py-3">تاريخ البيع</th>
                  <th className="px-4 py-3">سعر البيع الصافي (د.ج)</th>
                  <th className="px-4 py-3">طريقة وحالة الدفع</th>
                  <th className="px-4 py-3 text-center">وثيقة التسليم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {sales.map((sale) => {
                  const netPrice = sale.sale_price - (sale.discount || 0);
                  const vin = sale.vehicle?.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value;

                  return (
                    <tr key={sale.id} className="hover:bg-page/50 transition-colors">
                      {/* رقم الوثيقة */}
                      <td className="px-4 py-3 font-latin font-bold text-primary text-xs">
                        {sale.reference_number}
                      </td>

                      {/* السيارة المباعة */}
                      <td className="px-4 py-3">
                        {sale.vehicle ? (
                          <div>
                            <div className="font-bold text-text-primary text-xs">
                              {sale.vehicle.brand} {sale.vehicle.model}
                            </div>
                            <div className="text-[11px] text-text-muted font-latin mt-0.5">
                              VIN: {vin || '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      {/* المشتري */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">
                          {sale.customer ? sale.customer.full_name : 'عميل غير محدد'}
                        </div>
                        {sale.customer && (
                          <div className="text-[11px] text-text-muted font-latin mt-0.5">
                            {sale.customer.phone}
                          </div>
                        )}
                      </td>

                      {/* تاريخ البيع */}
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(sale.sale_date)}
                      </td>

                      {/* السعر الصافي بالدينار الجزائري */}
                      <td className="px-4 py-3 font-latin font-bold text-text-primary">
                        {formatCurrency(netPrice)}
                        {sale.discount > 0 && (
                          <div className="text-[10px] text-text-muted">
                            (تخفيض: {formatCurrency(sale.discount)})
                          </div>
                        )}
                      </td>

                      {/* الدفع */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <PaymentStatusBadge status={sale.payment_status} />
                          {sale.payment_method && (
                            <div className="text-[10px] text-text-muted">
                              {PAYMENT_METHOD_LABELS[sale.payment_method]}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* رابط طباعة وثيقة الإخراج والتسليم A4 */}
                      <td className="px-4 py-3 text-center">
                        <Link to={`/sales/${sale.id}/delivery-document`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs py-1 h-7"
                            icon={<Printer className="w-3.5 h-3.5" />}
                          >
                            وثيقة التسليم PDF
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة تسجيل عملية بيع وإخراج سيارة */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل عملية بيع وإخراج سيارة من المخزون"
        description="ربط السيارة المتاحة بالمشتري، وتوثيق السعر بالدينار الجزائري، وإصدار وثيقة التسليم الرسمية"
        maxWidth="2xl"
      >
        <form onSubmit={handleProcessSale} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-status-dangerBg border border-red-200 text-status-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* اختيار السيارة */}
          <div>
            <Select
              label="السيارة المراد بيعها (من المخزون المتاح أو المحجوز)"
              isRequired
              value={selectedVehicleId}
              onChange={(e) => handleSelectVehicle(e.target.value)}
              options={availableVehicles.map((v) => {
                const vin = v.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value;
                const reservedTag = v.status === 'reserved' ? ' [محجوزة بعربون]' : '';
                return {
                  value: v.id,
                  label: `${v.brand} ${v.model} (${v.manufacture_year || '—'}) - ${v.color || ''}${reservedTag} [VIN: ${vin || '—'}]`,
                };
              })}
              placeholder="— حدد السيارة من القائمة —"
            />

            {selectedVehicleObj?.status === 'reserved' && selectedVehicleObj.reservation && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
                <span>
                  هذه السيارة محجوزة مسبقاً بعربون قدره:{' '}
                  <strong className="font-latin">
                    {formatCurrency(selectedVehicleObj.reservation.deposit_amount)}
                  </strong>
                </span>
                <span className="text-[11px] text-amber-700">تم احتساب العربون كخصم تلقائياً</span>
              </div>
            )}
          </div>

          {/* اختيار المشتري مع زر إضافة عميل جديد */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">
                العميل المشتري <span className="text-status-danger">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة عميل جديد
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              aria-label="العميل المشتري"
              className="w-full rounded-[8px] border border-border bg-white px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">— اختر العميل المشتري —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* السعر والتخفيض بالدينار الجزائري */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="سعر البيع المتفق عليه"
              isRequired
              type="number"
              dir="ltr"
              placeholder="مثال: 6200000"
              suffixElement="د.ج"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
            <Input
              label="قيمة التخفيض إن وجد"
              type="number"
              dir="ltr"
              placeholder="0"
              suffixElement="د.ج"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          {/* طريقة وحالة الدفع */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="طريقة الدفع"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              options={[
                { value: 'cash', label: 'نقداً (Espèces)' },
                { value: 'bank_transfer', label: 'تحويل بنكي (Virement)' },
                { value: 'cheque', label: 'شيك بنكي (Chèque)' },
                { value: 'other', label: 'طريقة أخرى' },
              ]}
            />
            <Select
              label="حالة استلام المبلغ"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              options={[
                { value: 'paid', label: 'مدفوع بالكامل' },
                { value: 'partial', label: 'مدفوع جزئياً' },
                { value: 'unpaid', label: 'غير مدفوع (مؤجل)' },
              ]}
            />
          </div>

          {/* ملاحظات التسليم */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              شروط وملاحظات التسليم
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات حول وثائق السيارة، عدد المفاتيح المسلمة..."
              className="w-full rounded-[8px] border border-border bg-white p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* تنبيه أمان المعاملة */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-[8px] text-[11px] text-blue-800">
            <strong>تنبيه:</strong> عند تأكيد عملية البيع، سيتم تلقائياً تحديث حالة السيارة في المخزون إلى
            <strong> «مباعة / مخرجة» </strong> لمنع بيعها مرة أخرى، وسيتم توليد رقم مرجعي فريد لوثيقة التسليم.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              تأكيد البيع وتوليد وثيقة التسليم
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة إنشاء عميل جديد من داخل نافذة البيع */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="إضافة عميل جديد سريع"
        description="تسجيل بيانات المشتري الأساسية لإتمام عملية البيع"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomerInline} className="space-y-3">
          <Input
            label="اسم العميل الكامل"
            isRequired
            placeholder="مثال: يونس بلقاسم"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
          <Input
            label="رقم الهاتف الأساسي"
            isRequired
            dir="ltr"
            placeholder="مثال: 0550123456"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
          />
          <Input
            label="العنوان / البلدية / الولاية"
            placeholder="الجزائر العاصمة..."
            value={newCustomerAddress}
            onChange={(e) => setNewCustomerAddress(e.target.value)}
          />
          <Input
            label="رقم بطاقة التعريف الوطنية (اختياري)"
            dir="ltr"
            placeholder="رقم الهوية الوطنية..."
            value={newCustomerIdNumber}
            onChange={(e) => setNewCustomerIdNumber(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewCustomerModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="sm">
              إضافة العميل
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

