import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Plus,
  Search,
  Calendar,
  Printer,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Car,
  User,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api';
import { RentalContract, Vehicle, Customer, RentalStatus } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';

export const RentalsPage: React.FC = () => {
  const [rentals, setRentals] = useState<RentalContract[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RentalStatus>('all');

  // نوافذ منبثقة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<RentalContract | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // نموذج عقد الكراء الجديد
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [dailyRate, setDailyRate] = useState('7000');
  const [depositAmount, setDepositAmount] = useState('50000');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverLicenseIssueDate, setDriverLicenseIssueDate] = useState('');
  const [startMileage, setStartMileage] = useState('');
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
      const [rData, vData, cData] = await Promise.all([
        api.getRentals(),
        api.getVehicles(),
        api.getCustomers(),
      ]);
      setRentals(rData);
      setVehicles(vData);
      setCustomers(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // حساب عدد الأيام الإجمالي
  const calculateDays = () => {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 1;
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const totalDays = calculateDays();
  const estimatedTotal = totalDays * (Number(dailyRate) || 0);

  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find((item) => item.id === vId);
    if (v && v.mileage) {
      setStartMileage(v.mileage.toString());
    }
  };

  const handleCreateCustomerInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف للزبون');
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

  const handleSubmitRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedVehicleId) {
      setModalError('يرجى اختيار السيارة المراد تأجيرها');
      return;
    }
    if (!selectedCustomerId) {
      setModalError('يرجى اختيار العميل المستأجر');
      return;
    }
    if (!startDate || !endDate) {
      setModalError('يرجى تحديد فترة الكراء (تاريخ الاستلام وتاريخ الإرجاع)');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createRental({
        vehicle_id: selectedVehicleId,
        customer_id: selectedCustomerId,
        start_date: startDate,
        end_date: endDate,
        daily_rate: Number(dailyRate) || 0,
        total_days: totalDays,
        total_amount: estimatedTotal,
        deposit_amount: Number(depositAmount) || 0,
        driver_license_number: driverLicense.trim() || null,
        driver_license_issue_date: driverLicenseIssueDate || null,
        start_mileage: startMileage ? Number(startMileage) : null,
        end_mileage: null,
        status: 'active',
        notes: notes.trim() || null,
      });

      setIsAddModalOpen(false);
      // تصفير
      setSelectedVehicleId('');
      setSelectedCustomerId('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء حفظ عقد الكراء');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRental = async (contract: RentalContract) => {
    const endMileageInput = prompt(
      `تسجيل إرجاع السيارة: أدخل قراءة العداد عند الاستلام (العداد عند الخروج كان: ${contract.start_mileage || '—'} كم):`,
      (contract.start_mileage ? contract.start_mileage + 350 : 25000).toString()
    );
    if (endMileageInput === null) return;

    try {
      await api.updateRentalStatus(
        contract.id,
        'completed',
        Number(endMileageInput) || undefined
      );
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;
    try {
      setIsSubmitting(true);
      await api.deleteRental(contractToDelete.id);
      setIsDeleteModalOpen(false);
      setContractToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRentals = rentals.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.contract_number.toLowerCase().includes(q) ||
      r.vehicle?.brand.toLowerCase().includes(q) ||
      r.vehicle?.model.toLowerCase().includes(q) ||
      r.customer?.full_name.toLowerCase().includes(q) ||
      r.customer?.phone.includes(q);
    return matchesStatus && matchesSearch;
  });

  const activeRentalsCount = rentals.filter((r) => r.status === 'active').length;
  const totalCautionHeld = rentals
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + (r.deposit_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة لوحدة الكراء */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <KeyRound className="w-4 h-4 text-primary" />
            <span>عقود الكراء النشطة حالياً</span>
          </div>
          <div className="text-xl font-extrabold text-navy font-latin mt-1">
            {activeRentalsCount} <span className="text-xs font-normal text-text-muted">سيارة مؤجرة</span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>مبالغ الضمان (الكفالة المحتجزة)</span>
          </div>
          <div className="text-xl font-extrabold text-amber-700 font-latin mt-1">
            {formatCurrency(totalCautionHeld)}
          </div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>إجمالي العقود المسجلة</span>
          </div>
          <div className="text-xl font-extrabold text-text-primary font-latin mt-1">
            {rentals.length} <span className="text-xs font-normal text-text-muted">عقد</span>
          </div>
        </div>
      </div>

      {/* شريط الإجراءات والبحث */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث برقم العقد، السيارة، اسم المستأجر، أو الهاتف..."
              className="w-full rounded-[8px] border border-border bg-page pr-9 pl-3 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-[8px] border border-border bg-page px-3 py-2 text-xs text-text-primary focus:bg-white focus:outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="active">عقود سارية (نشطة)</option>
            <option value="completed">مكتملة (تم الإرجاع)</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          تسجيل عقد كراء جديد
        </Button>
      </div>

      {/* جدول عقود الكراء */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل عقود الكراء...</div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center">
            <KeyRound className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لا توجد عقود كراء مطابقة</h4>
            <p className="text-xs text-text-muted mt-1">
              سجل عقود تأجير السيارات الجديدة مع تحديد الكفالة وسعر اليوم وطباعة العقد القانوني.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">رقم العقد</th>
                  <th className="px-4 py-3">السيارة المؤجرة</th>
                  <th className="px-4 py-3">المستأجر</th>
                  <th className="px-4 py-3">فترة الكراء</th>
                  <th className="px-4 py-3">السعر اليومي</th>
                  <th className="px-4 py-3">الإجمالي (د.ج)</th>
                  <th className="px-4 py-3">الضمان (الكفالة)</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-page/50 transition-colors">
                    <td className="px-4 py-3 font-latin font-bold text-primary">
                      {r.contract_number}
                    </td>

                    <td className="px-4 py-3">
                      {r.vehicle ? (
                        <div>
                          <div className="font-bold text-text-primary">
                            {r.vehicle.brand} {r.vehicle.model}
                          </div>
                          <div className="text-[11px] text-text-muted font-latin">
                            {r.vehicle.manufacture_year || ''} • {r.vehicle.color || ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {r.customer ? (
                        <div>
                          <div className="font-semibold text-text-primary">{r.customer.full_name}</div>
                          <div className="text-[11px] text-text-muted font-latin">{r.customer.phone}</div>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-text-secondary">
                        {formatDate(r.start_date)} ⬅ {formatDate(r.end_date)}
                      </div>
                      <div className="text-[11px] text-text-muted font-bold">
                        ({r.total_days} أيام)
                      </div>
                    </td>

                    <td className="px-4 py-3 font-latin font-bold text-text-primary">
                      {formatCurrency(r.daily_rate)}/يوم
                    </td>

                    <td className="px-4 py-3 font-latin font-extrabold text-navy">
                      {formatCurrency(r.total_amount)}
                    </td>

                    <td className="px-4 py-3 font-latin font-bold text-amber-700">
                      {formatCurrency(r.deposit_amount)}
                    </td>

                    <td className="px-4 py-3">
                      {r.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ساري (نشط)
                        </span>
                      )}
                      {r.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          تم الإرجاع
                        </span>
                      )}
                      {r.status === 'cancelled' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          ملغى
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link to={`/rentals/${r.id}/contract`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs py-1 h-7"
                            icon={<Printer className="w-3.5 h-3.5" />}
                          >
                            العقد A4
                          </Button>
                        </Link>

                        {r.status === 'active' && (
                          <button
                            onClick={() => handleCompleteRental(r)}
                            className="p-1.5 rounded-[6px] border border-border text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="تسجيل إرجاع السيارة وإنهاء الكراء"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setContractToDelete(r);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-[6px] border border-border text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف هذا العقد"
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

      {/* نافذة تسجيل عقد كراء جديد */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تسجيل عقد كراء سيارة جديد"
        description="توثيق شروط الكراء وتحديد فترة التأجير ومبلغ الكفالة المستلم من الزبون"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitRental} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="السيارة المراد كراؤها"
              isRequired
              value={selectedVehicleId}
              onChange={(e) => handleSelectVehicle(e.target.value)}
              options={vehicles
                .filter((v) => v.status !== 'sold')
                .map((v) => ({
                  value: v.id,
                  label: `${v.brand} ${v.model} (${v.manufacture_year || ''}) - ${v.color || ''}`,
                }))}
              placeholder="— اختر السيارة —"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-text-secondary">الزبون المستأجر *</label>
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
                placeholder="— اختر الزبون —"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="تاريخ ووقت الاستلام"
              type="date"
              isRequired
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="تاريخ ووقت الإرجاع"
              type="date"
              isRequired
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              label="السعر اليومي (د.ج/اليوم)"
              type="number"
              isRequired
              suffixElement="د.ج"
              dir="ltr"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="مبلغ الضمان / الكفالة (Caution)"
              type="number"
              isRequired
              suffixElement="د.ج"
              dir="ltr"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Input
              label="رقم رخصة السياقة"
              dir="ltr"
              placeholder="رقم رخصة القيادة..."
              value={driverLicense}
              onChange={(e) => setDriverLicense(e.target.value)}
            />
            <Input
              label="قراءة العداد عند الخروج (كم)"
              type="number"
              suffixElement="كم"
              dir="ltr"
              value={startMileage}
              onChange={(e) => setStartMileage(e.target.value)}
            />
          </div>

          {/* ملخص الاحتساب المالي التلقائي */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-[8px] flex items-center justify-between text-xs text-blue-900">
            <div>
              المدة المقدرة: <strong className="font-latin">{totalDays}</strong> يوم | السعر اليومي:{' '}
              <strong className="font-latin">{formatCurrency(Number(dailyRate) || 0)}</strong>
            </div>
            <div>
              الإجمالي الصافي: <strong className="font-latin text-sm font-extrabold text-navy">{formatCurrency(estimatedTotal)}</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات أو شروط خاصة بالعقد
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: الوقود عند التسليم نصف الخزان، وجهة الاستعمال داخل الولاية فقط..."
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
              إصدار وحفظ عقد الكراء
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

      {/* نافذة تأكيد حذف العقد */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف عقد الكراء"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف العقد رقم{' '}
            <strong className="text-primary font-latin">{contractToDelete?.contract_number}</strong>؟
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
