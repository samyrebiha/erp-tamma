import React, { useEffect, useState } from 'react';
import { Truck, Plus, Phone, Mail, Building, Copy, Check, Car } from 'lucide-react';
import { api } from '../../lib/api';
import { Supplier } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    business_registration_number: '',
    contact_person: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers();
      setSuppliers(data);
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

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('يرجى ملء اسم المورد ورقم الهاتف');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createSupplier({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        business_registration_number: formData.business_registration_number.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        notes: formData.notes.trim() || null,
      });

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        business_registration_number: '',
        contact_person: '',
        notes: '',
      });
      loadSuppliers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase()))
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
            placeholder="بحث باسم الشركة / المورد، المسؤول، أو الهاتف..."
            className="w-full rounded-[8px] border border-border bg-page px-3.5 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          إضافة مورد جديد
        </Button>
      </div>

      {/* جدول الموردين */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل قائمة الموردين...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لا يوجد موردون مسجلون</h4>
            <p className="text-xs text-text-muted mt-1">أضف شركات استيراد أو تجار سيارات لتسجيل المشتريات بدقة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">المورد / المؤسسة</th>
                  <th className="px-4 py-3">الشخص المسؤول</th>
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">العنوان / المقر</th>
                  <th className="px-4 py-3">السجل التجاري</th>
                  <th className="px-4 py-3">السيارات المشتراة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-page/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-text-primary text-sm">{s.name}</div>
                      {s.email && (
                        <div className="text-[11px] text-text-muted font-latin mt-0.5">{s.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.contact_person || '—'}
                    </td>
                    <td className="px-4 py-3 font-latin">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${s.phone}`} className="font-semibold text-primary hover:underline">
                          {s.phone}
                        </a>
                        <button
                          onClick={() => copyPhone(s.phone, s.id)}
                          className="text-text-muted hover:text-text-primary p-0.5"
                          title="نسخ رقم الهاتف"
                        >
                          {copiedPhone === s.id ? (
                            <Check className="w-3.5 h-3.5 text-status-available" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.address || '—'}
                    </td>
                    <td className="px-4 py-3 font-latin text-text-secondary">
                      {s.business_registration_number || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                        <Car className="w-3.5 h-3.5 text-primary" />
                        {s.vehicles_count || 0} سيارة
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة إضافة مورد جديد */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة مورد جديد"
        description="تسجيل شركة أو مؤسسة توريد واستيراد المركبات"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSupplier} className="space-y-3">
          <Input
            label="اسم المورد أو المؤسسة"
            isRequired
            placeholder="مثال: شركة النورس للاستيراد"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="رقم الهاتف"
              isRequired
              dir="ltr"
              placeholder="0560 12 34 56"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="البريد الإلكتروني (اختياري)"
              dir="ltr"
              type="email"
              placeholder="contact@company.dz"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="الشخص المسؤول (الممثل التجاري)"
              placeholder="مثال: كريم بن عيسى"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
            <Input
              label="رقم السجل التجاري (اختياري)"
              dir="ltr"
              placeholder="مثال: 16/00-1234567A20"
              value={formData.business_registration_number}
              onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
            />
          </div>
          <Input
            label="العنوان / المقر التجاري"
            placeholder="المنطقة الصناعية..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="طبيعة المركبات الموردة، شروط التوريد..."
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
              حفظ المورد
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

