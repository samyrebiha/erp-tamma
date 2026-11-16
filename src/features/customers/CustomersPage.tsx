import React, { useEffect, useState } from 'react';
import { Users, Plus, Phone, MapPin, Copy, Check, Receipt } from 'lucide-react';
import { api } from '../../lib/api';
import { Customer } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    secondary_phone: '',
    address: '',
    identity_number: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      alert('يرجى ملء الاسم الكامل ورقم الهاتف');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createCustomer({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        secondary_phone: formData.secondary_phone.trim() || null,
        address: formData.address.trim() || null,
        identity_number: formData.identity_number.trim() || null,
        notes: formData.notes.trim() || null,
      });

      setIsAddModalOpen(false);
      setFormData({
        full_name: '',
        phone: '',
        secondary_phone: '',
        address: '',
        identity_number: '',
        notes: '',
      });
      loadCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.identity_number && c.identity_number.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات والبحث */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم الكامل، رقم الهاتف، أو رقم الهوية..."
            className="w-full rounded-[8px] border border-border bg-page px-3.5 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          إضافة عميل جديد
        </Button>
      </div>

      {/* جدول العملاء */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل قائمة العملاء...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لا يوجد عملاء مسجلون</h4>
            <p className="text-xs text-text-muted mt-1">أضف عملاء جدد لحفظ سجل تعاملاتهم ومشترياتهم.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">الاسم الكامل</th>
                  <th className="px-4 py-3">أرقام التواصل</th>
                  <th className="px-4 py-3">العنوان / الولاية</th>
                  <th className="px-4 py-3">رقم بطاقة التعريف</th>
                  <th className="px-4 py-3">العمليات والمشتريات</th>
                  <th className="px-4 py-3">إجمالي المدفوعات (د.ج)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-page/50 transition-colors">
                    {/* الاسم والملاحظات */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-text-primary text-sm">{c.full_name}</div>
                      {c.notes && (
                        <div className="text-[11px] text-text-muted mt-0.5 truncate max-w-[200px]" title={c.notes}>
                          {c.notes}
                        </div>
                      )}
                    </td>

                    {/* الهاتف مع إمكانية النسخ والاتصال */}
                    <td className="px-4 py-3 font-latin">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${c.phone}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {c.phone}
                        </a>
                        <button
                          onClick={() => copyPhone(c.phone, c.id)}
                          className="text-text-muted hover:text-text-primary p-0.5"
                          title="نسخ رقم الهاتف"
                        >
                          {copiedPhone === c.id ? (
                            <Check className="w-3.5 h-3.5 text-status-available" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {c.secondary_phone && (
                        <div className="text-[11px] text-text-muted mt-0.5">
                          هاتف بديل: {c.secondary_phone}
                        </div>
                      )}
                    </td>

                    {/* العنوان */}
                    <td className="px-4 py-3 text-text-secondary">
                      {c.address || '—'}
                    </td>

                    {/* رقم الهوية */}
                    <td className="px-4 py-3 font-latin text-text-secondary">
                      {c.identity_number || '—'}
                    </td>

                    {/* عدد العمليات */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                        <Receipt className="w-3.5 h-3.5 text-primary" />
                        {c.purchases_count || 0} سيارة
                      </span>
                    </td>

                    {/* إجمالي المشتريات بالدينار الجزائري */}
                    <td className="px-4 py-3 font-latin font-bold text-navy">
                      {formatCurrency(c.total_spent || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة إضافة عميل جديد */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة عميل جديد"
        description="تسجيل بيانات المشتري في قاعدة بيانات المعرض"
        maxWidth="lg"
      >
        <form onSubmit={handleAddCustomer} className="space-y-3">
          <Input
            label="الاسم الكامل"
            isRequired
            placeholder="مثال: عبد القادر مراد"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="رقم الهاتف الأساسي"
              isRequired
              dir="ltr"
              placeholder="0550 12 34 56"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="رقم هاتف إضافي (اختياري)"
              dir="ltr"
              placeholder="0661 98 76 54"
              value={formData.secondary_phone}
              onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
            />
          </div>
          <Input
            label="العنوان / البلدية / الولاية"
            placeholder="الجزائر العاصمة..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="رقم وثيقة التعريف الوطنية (اختياري)"
            dir="ltr"
            placeholder="رقم بطاقة الهوية..."
            value={formData.identity_number}
            onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات داخلية
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات حول تفضيلات العميل أو تعاملاته السابقة..."
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
              حفظ بيانات العميل
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

