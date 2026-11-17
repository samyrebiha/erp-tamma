import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  Car,
  Filter,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import { VehicleExpense, Vehicle, ExpenseCategory } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  mechanical: 'ميكانيك / صيانة محرك',
  body_paint: 'هيكل ودهان (Tôlerie & Peinture)',
  spare_parts: 'قطع غيار ولوازم',
  detailing: 'غسيل وتلميع (Lavage & Detailing)',
  inspection_fees: 'فحص تقني ورسوم إدارية',
  transport: 'نقل وشحن (Dépannage)',
  other: 'مصاريف أخرى',
};

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  // نافذة إضافة مصروف
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('mechanical');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [providerName, setProviderName] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // حذف مصروف
  const [expenseToDelete, setExpenseToDelete] = useState<VehicleExpense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eData, vData] = await Promise.all([
        api.getVehicleExpenses(),
        api.getVehicles(),
      ]);
      setExpenses(eData);
      setVehicles(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedVehicleId) {
      setModalError('يرجى تحديد السيارة المعنية بالمصروف');
      return;
    }
    if (!description.trim()) {
      setModalError('يرجى إدخال وصف المصروف أو الفاتورة');
      return;
    }
    const amtNum = Number(amount);
    if (!amtNum || amtNum <= 0) {
      setModalError('يرجى إدخال مبلغ صحيح بالدينار الجزائري');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createVehicleExpense({
        vehicle_id: selectedVehicleId,
        category,
        description: description.trim(),
        amount: amtNum,
        expense_date: expenseDate,
        provider_name: providerName.trim() || null,
        notes: notes.trim() || null,
      });

      setIsAddModalOpen(false);
      setSelectedVehicleId('');
      setDescription('');
      setAmount('');
      setProviderName('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء حفظ المصروف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      setIsSubmitting(true);
      await api.deleteVehicleExpense(expenseToDelete.id);
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesVeh = vehicleFilter === 'all' || e.vehicle_id === vehicleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      e.description.toLowerCase().includes(q) ||
      e.provider_name?.toLowerCase().includes(q) ||
      e.vehicle?.brand.toLowerCase().includes(q) ||
      e.vehicle?.model.toLowerCase().includes(q);

    return matchesCat && matchesVeh && matchesSearch;
  });

  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* مؤشرات المصاريف الإجمالية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Wrench className="w-4 h-4 text-primary" />
            <span>إجمالي مصاريف الصيانة والتجهيز</span>
          </div>
          <div className="text-xl font-extrabold text-navy font-latin mt-1">
            {formatCurrency(totalExpensesAmount)}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            تضاف تلقائياً لتكلفة السيارة الصافية
          </div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>عدد الفواتير والعمليات</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-latin mt-1">
            {filteredExpenses.length} <span className="text-xs font-normal text-text-muted">فاتورة مسجلة</span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-2xs">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Car className="w-4 h-4 text-amber-600" />
            <span>عدد السيارات المجهزة بالمصاريف</span>
          </div>
          <div className="text-xl font-extrabold text-amber-800 font-latin mt-1">
            {new Set(expenses.map((e) => e.vehicle_id)).size}{' '}
            <span className="text-xs font-normal text-text-muted">سيارة</span>
          </div>
        </div>
      </div>

      {/* شريط الإجراءات والبحث والفلاتر */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بوصف الفاتورة، الورشة، أو السيارة..."
              className="w-full rounded-[8px] border border-border bg-page pr-9 pl-3 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-[8px] border border-border bg-page px-3 py-2 text-xs text-text-primary focus:bg-white focus:outline-none"
          >
            <option value="all">كل التصنيفات</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="rounded-[8px] border border-border bg-page px-3 py-2 text-xs text-text-primary focus:bg-white focus:outline-none max-w-[150px] truncate"
          >
            <option value="all">كل السيارات</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          تسجيل مصروف جديد
        </Button>
      </div>

      {/* جدول المصاريف */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل سجل المصاريف...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لا توجد مصاريف مطابقة</h4>
            <p className="text-xs text-text-muted mt-1">
              سجل فواتير الميكانيك، الدهان، والغسيل لتتبع التكلفة الصافية وهامش الربح الحقيقي.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">السيارة المعنية</th>
                  <th className="px-4 py-3">التصنيف</th>
                  <th className="px-4 py-3">وصف العملية / الفاتورة</th>
                  <th className="px-4 py-3">المبلغ (د.ج)</th>
                  <th className="px-4 py-3">الورشة / الحرفي</th>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-page/50 transition-colors">
                    <td className="px-4 py-3">
                      {exp.vehicle ? (
                        <div>
                          <div className="font-bold text-text-primary">
                            {exp.vehicle.brand} {exp.vehicle.model}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            {exp.vehicle.manufacture_year || ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {CATEGORY_LABELS[exp.category]}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {exp.description}
                      {exp.notes && (
                        <div className="text-[11px] text-text-muted font-normal mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-latin font-extrabold text-sm text-navy">
                      {formatCurrency(exp.amount)}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {exp.provider_name || '—'}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {formatDate(exp.expense_date)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setExpenseToDelete(exp);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-[6px] border border-border text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف هذا المصروف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة تسجيل مصروف جديد */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تسجيل مصروف تجهيز أو صيانة سيارة"
        description="توثيق تكلفة صيانة أو دهان أو قطع غيار، وتحديث مصاريف السيارة تلقائياً"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="السيارة المعنية"
              isRequired
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              options={vehicles.map((v) => ({
                value: v.id,
                label: `${v.brand} ${v.model} (${v.manufacture_year || ''}) - ${v.color || ''}`,
              }))}
              placeholder="— اختر السيارة من المخزون —"
            />

            <Select
              label="تصنيف المصروف"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
          </div>

          <Input
            label="وصف المصروف / الخدمة المقدمة"
            isRequired
            placeholder="مثال: تغيير 4 عجلات جديدة + موازنة، دهان الصدام الأمامي..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="المبلغ المسدد (د.ج)"
              isRequired
              type="number"
              suffixElement="د.ج"
              dir="ltr"
              placeholder="مثال: 35000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="تاريخ العملية"
              type="date"
              isRequired
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
            <Input
              label="اسم الورشة أو الحرفي"
              placeholder="مثال: ورشة الإخوة..."
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات إضافية أو رقم الفاتورة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات حول الضمان على القطع أو رقم الفاتورة..."
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
              حفظ المصروف وتحديث التكلفة
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد حذف المصروف */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف المصروف"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذا المصروف بقيمة{' '}
            <strong className="font-latin text-primary">{formatCurrency(expenseToDelete?.amount || 0)}</strong>؟
            سيتم خصم هذا المبلغ تلقائياً من مصاريف السيارة الإضافية في المخزون.
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
