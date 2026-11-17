import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
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
} from 'lucide-react';
import { api } from '../../lib/api';
import { TradeIn, Vehicle, Customer, TradeInPayer } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';

export const TradeInsPage: React.FC = () => {
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // نوافذ منبثقة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TradeIn | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // نموذج عملية التبادل
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedShowroomVehicleId, setSelectedShowroomVehicleId] = useState('');
  const [showroomVehiclePrice, setShowroomVehiclePrice] = useState('');

  // سيارة الزبون الداخلة
  const [incomingBrand, setIncomingBrand] = useState('');
  const [incomingModel, setIncomingModel] = useState('');
  const [incomingYear, setIncomingYear] = useState(new Date().getFullYear().toString());
  const [incomingVin, setIncomingVin] = useState('');
  const [incomingReg, setIncomingReg] = useState('');
  const [incomingMileage, setIncomingMileage] = useState('');
  const [incomingEstimatedValue, setIncomingEstimatedValue] = useState('');

  // من يدفع الفارق
  const [notes, setNotes] = useState('');

  // نموذج عميل سريع
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, vData, cData] = await Promise.all([
        api.getTradeIns(),
        api.getVehicles(),
        api.getCustomers(),
      ]);
      setTradeIns(tData);
      setVehicles(vData);
      setCustomers(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShowroomVehicle = (vId: string) => {
    setSelectedShowroomVehicleId(vId);
    const v = vehicles.find((item) => item.id === vId);
    if (v && v.purchase_price) {
      // اقتراح سعر تقديري للبيع
      setShowroomVehiclePrice((v.purchase_price * 1.1).toFixed(0));
    }
  };

  // حساب الفارق المالي ومن يدفعه
  const showroomPriceNum = Number(showroomVehiclePrice) || 0;
  const incomingValueNum = Number(incomingEstimatedValue) || 0;
  const differenceAmount = Math.abs(showroomPriceNum - incomingValueNum);

  let calculatedPayer: TradeInPayer = 'even';
  if (showroomPriceNum > incomingValueNum) {
    calculatedPayer = 'customer'; // الزبون يدفع الفارق للمعرض
  } else if (incomingValueNum > showroomPriceNum) {
    calculatedPayer = 'showroom'; // المعرض يدفع الفارق للزبون
  }

  const handleCreateCustomerInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      alert('يرجى كتابة اسم ورقم هاتف الزبون');
      return;
    }
    try {
      const created = await api.createCustomer({
        full_name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
      });
      setCustomers([created, ...customers]);
      setSelectedCustomerId(created.id);
      setIsNewCustomerModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTradeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedCustomerId) {
      setModalError('يرجى اختيار العميل');
      return;
    }
    if (!selectedShowroomVehicleId) {
      setModalError('يرجى اختيار سيارة المعرض المخرجة');
      return;
    }
    if (!incomingBrand.trim() || !incomingModel.trim()) {
      setModalError('يرجى إدخال ماركة وطراز سيارة الزبون المقترحة للمبادلة');
      return;
    }
    if (!incomingValueNum || !showroomPriceNum) {
      setModalError('يرجى إدخال أسعار تقييم صحيحة للسيارتين');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createTradeIn({
        customer_id: selectedCustomerId,
        showroom_vehicle_id: selectedShowroomVehicleId,
        incoming_brand: incomingBrand.trim(),
        incoming_model: incomingModel.trim(),
        incoming_year: Number(incomingYear) || null,
        incoming_vin: incomingVin.trim() || null,
        incoming_registration_number: incomingReg.trim() || null,
        incoming_mileage: incomingMileage ? Number(incomingMileage) : null,
        incoming_estimated_value: incomingValueNum,
        showroom_vehicle_price: showroomPriceNum,
        difference_amount: differenceAmount,
        payer: calculatedPayer,
        payment_status: 'paid',
        notes: notes.trim() || null,
        trade_date: new Date().toISOString().split('T')[0],
      });

      setIsAddModalOpen(false);
      // تصفير
      setSelectedCustomerId('');
      setSelectedShowroomVehicleId('');
      setIncomingBrand('');
      setIncomingModel('');
      setIncomingEstimatedValue('');
      setShowroomVehiclePrice('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء حفظ عملية التبادل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      await api.deleteTradeIn(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTradeIns = tradeIns.filter((t) => {
    const q = search.toLowerCase();
    return (
      !search ||
      t.reference_number.toLowerCase().includes(q) ||
      t.customer?.full_name.toLowerCase().includes(q) ||
      t.showroom_vehicle?.brand.toLowerCase().includes(q) ||
      t.showroom_vehicle?.model.toLowerCase().includes(q) ||
      t.incoming_brand.toLowerCase().includes(q) ||
      t.incoming_model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات والبحث */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم العملية، الزبون، أو سيارة المعرض..."
            className="w-full rounded-[8px] border border-border bg-page px-3.5 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          تسجيل عملية تبادل (Échange)
        </Button>
      </div>

      {/* جدول عمليات التبادل */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل عمليات التبادل...</div>
        ) : filteredTradeIns.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowLeftRight className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لا توجد عمليات تبادل مسجلة</h4>
            <p className="text-xs text-text-muted mt-1">
              سجل صفقات استبدال سيارة زبون بسيارة من المعرض مع احتساب الفارق المالي وتوثيق العقد.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">رقم العملية</th>
                  <th className="px-4 py-3">الزبون المستبدل</th>
                  <th className="px-4 py-3">سيارة المعرض المخرجة</th>
                  <th className="px-4 py-3">سيارة الزبون المقبولة</th>
                  <th className="px-4 py-3">الفارق المالي (Soulte)</th>
                  <th className="px-4 py-3">الطرف الدافع</th>
                  <th className="px-4 py-3">تاريخ العملية</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredTradeIns.map((t) => (
                  <tr key={t.id} className="hover:bg-page/50 transition-colors">
                    <td className="px-4 py-3 font-latin font-bold text-primary">
                      {t.reference_number}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-primary">
                        {t.customer?.full_name || '—'}
                      </div>
                      <div className="text-[11px] text-text-muted font-latin">
                        {t.customer?.phone}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {t.showroom_vehicle ? (
                        <div>
                          <div className="font-bold text-navy">
                            {t.showroom_vehicle.brand} {t.showroom_vehicle.model}
                          </div>
                          <div className="text-[11px] text-text-muted font-latin">
                            تقييم: {formatCurrency(t.showroom_vehicle_price)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <div className="font-bold text-emerald-800">
                          {t.incoming_brand} {t.incoming_model} ({t.incoming_year || '—'})
                        </div>
                        <div className="text-[11px] text-text-muted font-latin">
                          تقييم: {formatCurrency(t.incoming_estimated_value)}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-latin font-extrabold text-sm text-text-primary">
                      {formatCurrency(t.difference_amount)}
                    </td>

                    <td className="px-4 py-3">
                      {t.payer === 'customer' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          الزبون يدفع للمعرض
                        </span>
                      )}
                      {t.payer === 'showroom' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          المعرض يدفع للزبون
                        </span>
                      )}
                      {t.payer === 'even' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          تبادل مباشر (رأس برأس)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {formatDate(t.trade_date)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link to={`/trade-ins/${t.id}/document`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs py-1 h-7"
                            icon={<Printer className="w-3.5 h-3.5" />}
                          >
                            وثيقة التبادل PDF
                          </Button>
                        </Link>

                        <button
                          onClick={() => {
                            setItemToDelete(t);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-[6px] border border-border text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف عملية التبادل (وإعادة سيارة المعرض للمخزون)"
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

      {/* نافذة تسجيل عملية تبادل جديدة */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تسجيل عملية تبادل سيارات (Échange)"
        description="استبدال سيارة زبون بسيارة من المعرض واحتساب الفارق المالي وتوثيق الشروط"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitTradeIn} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* 1. الزبون */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">الزبون الطرف الثاني *</label>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                + زبون جديد
              </button>
            </div>
            <Select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.full_name} (${c.phone})`,
              }))}
              placeholder="— حدد الزبون من القائمة —"
            />
          </div>

          {/* 2. سيارة المعرض المخرجة */}
          <div className="p-3 bg-page rounded-[8px] border border-border space-y-2.5">
            <h4 className="text-xs font-bold text-navy">أ. سيارة المعرض (التي يستلمها الزبون)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="السيارة من المخزون"
                isRequired
                value={selectedShowroomVehicleId}
                onChange={(e) => handleSelectShowroomVehicle(e.target.value)}
                options={vehicles
                  .filter((v) => v.status === 'available')
                  .map((v) => ({
                    value: v.id,
                    label: `${v.brand} ${v.model} (${v.manufacture_year || ''})`,
                  }))}
                placeholder="— اختر سيارة متاحة —"
              />
              <Input
                label="سعر تقييم سيارة المعرض (د.ج)"
                type="number"
                isRequired
                suffixElement="د.ج"
                dir="ltr"
                value={showroomVehiclePrice}
                onChange={(e) => setShowroomVehiclePrice(e.target.value)}
              />
            </div>
          </div>

          {/* 3. سيارة الزبون المقبولة */}
          <div className="p-3 bg-page rounded-[8px] border border-border space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-800">ب. سيارة الزبون الداخلة للمعرض</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="ماركة السيارة"
                isRequired
                placeholder="مثال: Peugeot, Renault..."
                value={incomingBrand}
                onChange={(e) => setIncomingBrand(e.target.value)}
              />
              <Input
                label="طراز السيارة"
                isRequired
                placeholder="مثال: 208, Clio 4..."
                value={incomingModel}
                onChange={(e) => setIncomingModel(e.target.value)}
              />
              <Input
                label="سنة الصنع"
                type="number"
                value={incomingYear}
                onChange={(e) => setIncomingYear(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="القيمة التقديرية للسيارة (د.ج)"
                type="number"
                isRequired
                suffixElement="د.ج"
                dir="ltr"
                value={incomingEstimatedValue}
                onChange={(e) => setIncomingEstimatedValue(e.target.value)}
              />
              <Input
                label="رقم اللوحة / الترقيم"
                dir="ltr"
                placeholder="01234-120-39"
                value={incomingReg}
                onChange={(e) => setIncomingReg(e.target.value)}
              />
              <Input
                label="العداد (كم)"
                type="number"
                suffixElement="كم"
                dir="ltr"
                value={incomingMileage}
                onChange={(e) => setIncomingMileage(e.target.value)}
              />
            </div>
          </div>

          {/* 4. ملخص الفارق المالي (Soulte) */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-[8px] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-900">
            <div>
              الفارق المالي المحتسب (Soulte):{' '}
              <strong className="text-base font-extrabold text-navy font-latin">
                {formatCurrency(differenceAmount)}
              </strong>
            </div>

            <div>
              {calculatedPayer === 'customer' && (
                <span className="font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                  الزبون يسدد للمعرض: {formatCurrency(differenceAmount)}
                </span>
              )}
              {calculatedPayer === 'showroom' && (
                <span className="font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                  المعرض يسدد للزبون: {formatCurrency(differenceAmount)}
                </span>
              )}
              {calculatedPayer === 'even' && (
                <span className="font-bold text-slate-800 bg-slate-200 px-3 py-1 rounded-full">
                  تبادل متكافئ (بدون فارق مالي)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات أو شروط خاصة بالاتفاقية
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تسجيل أي تفاصيل حول تسليم الوثائق أو طريقة دفع الفارق..."
              className="w-full rounded-[8px] border border-border bg-white p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-divider">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              إتمام وتوثيق عملية التبادل
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة زبون سريع */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="إضافة زبون سريع"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCustomerInline} className="space-y-3">
          <Input
            label="اسم الزبون الكامل"
            isRequired
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
          <Input
            label="رقم الهاتف"
            isRequired
            dir="ltr"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewCustomerModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="sm">
              إضافة
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد حذف عملية التبادل */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف عملية التبادل"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف عملية التبادل رقم{' '}
            <strong className="text-primary font-latin">{itemToDelete?.reference_number}</strong>؟
            سيتم تلقائياً إعادة سيارة المعرض إلى حالة [متاحة في المخزون].
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
              onClick={handleConfirmDelete}
            >
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

