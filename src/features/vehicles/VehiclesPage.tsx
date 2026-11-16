import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Search,
  Filter,
  Plus,
  Printer,
  Receipt,
  Eye,
  Trash2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Vehicle, VehicleStatus, IdentifierType, Supplier } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  IDENTIFIER_TYPE_LABELS,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { VehicleStatusBadge } from '../../components/ui/Badge';

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // نافذة إضافة سيارة جديدة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // حالة نموذج الإضافة
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    trim: '',
    manufacture_year: new Date().getFullYear(),
    color: '',
    fuel_type: 'petrol' as any,
    transmission: 'automatic' as any,
    mileage: '',
    condition_notes: '',
    status: 'available' as VehicleStatus,
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    extra_costs: '0',
    description: '',
  });

  // قائمة المعرفات التفاعلية (VIN، المحرك، الترقيم...)
  const [identifiers, setIdentifiers] = useState<
    { identifier_type: IdentifierType; custom_type_name: string; identifier_value: string }[]
  >([
    { identifier_type: 'vin', custom_type_name: '', identifier_value: '' },
    { identifier_type: 'registration_number', custom_type_name: '', identifier_value: '' },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vData, sData] = await Promise.all([
        api.getVehicles(searchQuery, statusFilter),
        api.getSuppliers(),
      ]);
      setVehicles(vData);
      setSuppliers(sData);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddIdentifierRow = () => {
    setIdentifiers([
      ...identifiers,
      { identifier_type: 'engine_number', custom_type_name: '', identifier_value: '' },
    ]);
  };

  const handleRemoveIdentifierRow = (index: number) => {
    setIdentifiers(identifiers.filter((_, i) => i !== index));
  };

  const handleIdentifierChange = (index: number, field: string, value: string) => {
    const updated = [...identifiers];
    updated[index] = { ...updated[index], [field]: value };
    setIdentifiers(updated);
  };

  const handleSubmitNewVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.brand.trim() || !formData.model.trim()) {
      setFormError('يرجى إدخال الماركة والطراز للسيارة');
      return;
    }

    // التحقق من رقم الهيكل VIN ومنع التكرار
    const vinIdentifier = identifiers.find((i) => i.identifier_type === 'vin');
    if (vinIdentifier && vinIdentifier.identifier_value.trim()) {
      const exists = await api.checkIdentifierExists(vinIdentifier.identifier_value, 'vin');
      if (exists) {
        setFormError('رقم الهيكل (VIN) هذا مسجل مسبقاً في النظام لسيارة أخرى!');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const cleanIdentifiers = identifiers
        .filter((i) => i.identifier_value.trim() !== '')
        .map((i) => ({
          identifier_type: i.identifier_type,
          custom_type_name: i.identifier_type === 'other' ? i.custom_type_name : null,
          identifier_value: i.identifier_value.trim().toUpperCase(),
        }));

      await api.createVehicle(
        {
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          trim: formData.trim.trim() || null,
          manufacture_year: Number(formData.manufacture_year) || null,
          color: formData.color.trim() || null,
          fuel_type: formData.fuel_type || null,
          transmission: formData.transmission || null,
          mileage: formData.mileage ? Number(formData.mileage) : null,
          condition_notes: formData.condition_notes.trim() || null,
          status: formData.status,
          supplier_id: formData.supplier_id || null,
          purchase_date: formData.purchase_date || null,
          purchase_price: formData.purchase_price ? Number(formData.purchase_price) : null,
          extra_costs: Number(formData.extra_costs) || 0,
          description: formData.description.trim() || null,
        },
        cleanIdentifiers
      );

      setIsAddModalOpen(false);
      // إعادة تعيين النموذج
      setFormData({
        brand: '',
        model: '',
        trim: '',
        manufacture_year: new Date().getFullYear(),
        color: '',
        fuel_type: 'petrol',
        transmission: 'automatic',
        mileage: '',
        condition_notes: '',
        status: 'available',
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: '',
        extra_costs: '0',
        description: '',
      });
      setIdentifiers([
        { identifier_type: 'vin', custom_type_name: '', identifier_value: '' },
        { identifier_type: 'registration_number', custom_type_name: '', identifier_value: '' },
      ]);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ السيارة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات والتصفية */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* حقل البحث الشامل */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالماركة، الطراز، VIN، رقم المحرك، اللوحة..."
              className="w-full rounded-[8px] border border-border bg-page px-3.5 pr-10 py-2 text-xs text-text-primary placeholder:text-text-muted focus:bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* فلتر الحالة */}
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="تصفية حسب حالة السيارة"
              className="w-full rounded-[8px] border border-border bg-page px-3 py-2 text-xs text-text-primary focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="all">كافة الحالات</option>
              <option value="available">متاحة في المخزون</option>
              <option value="reserved">محجوزة</option>
              <option value="sold">مباعة / مخرجة</option>
              <option value="under_process">قيد الإجراء</option>
            </select>
          </div>
        </div>

        {/* زر إضافة سيارة */}
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          إضافة سيارة جديدة
        </Button>
      </div>

      {/* جدول المخزون */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">جاري تحميل السيارات...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-text-primary">لا توجد سيارات مطابقة</h4>
            <p className="text-xs text-text-muted mt-1">
              جرب تغيير كلمات البحث أو أضف سيارة جديدة إلى المخزون.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-page border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3">السيارة / الطراز</th>
                  <th className="px-4 py-3">أبرز الأرقام التعريفية</th>
                  <th className="px-4 py-3">المواصفات</th>
                  <th className="px-4 py-3">تاريخ الدخول</th>
                  <th className="px-4 py-3">سعر الشراء (د.ج)</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {vehicles.map((v) => {
                  const vin = v.identifiers?.find((i) => i.identifier_type === 'vin')?.identifier_value;
                  const reg = v.identifiers?.find((i) => i.identifier_type === 'registration_number')?.identifier_value;

                  return (
                    <tr key={v.id} className="hover:bg-page/50 transition-colors">
                      {/* السيارة والطراز */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-text-primary text-sm">
                          {v.brand} {v.model}
                        </div>
                        <div className="text-text-muted text-[11px]">
                          {v.trim || 'فئة قياسية'} • {v.manufacture_year || '—'} • {v.color || '—'}
                        </div>
                      </td>

                      {/* الأرقام التعريفية */}
                      <td className="px-4 py-3">
                        {vin && (
                          <div className="flex items-center gap-1.5 font-latin text-[11px] text-text-primary">
                            <span className="text-text-muted">VIN:</span>
                            <span className="font-mono font-semibold">{vin}</span>
                            <button
                              onClick={() => copyToClipboard(vin, `vin-${v.id}`)}
                              className="text-text-muted hover:text-primary transition-colors p-0.5"
                              title="نسخ رقم الهيكل"
                            >
                              {copiedId === `vin-${v.id}` ? (
                                <Check className="w-3 h-3 text-status-available" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                        {reg && (
                          <div className="font-latin text-[11px] text-text-muted mt-0.5">
                            اللوحة: <span className="font-mono">{reg}</span>
                          </div>
                        )}
                        {!vin && !reg && <span className="text-text-muted">—</span>}
                      </td>

                      {/* المواصفات */}
                      <td className="px-4 py-3">
                        <div className="text-text-secondary">
                          {v.fuel_type ? FUEL_TYPE_LABELS[v.fuel_type] : '—'}
                        </div>
                        <div className="text-text-muted text-[11px]">
                          {formatNumber(v.mileage, 'كم')}
                        </div>
                      </td>

                      {/* تاريخ الدخول */}
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(v.purchase_date)}
                        {v.supplier && (
                          <div className="text-[11px] text-text-muted truncate max-w-[120px]" title={v.supplier.name}>
                            {v.supplier.name}
                          </div>
                        )}
                      </td>

                      {/* سعر الشراء بالدينار الجزائري */}
                      <td className="px-4 py-3 font-latin font-bold text-text-primary">
                        {formatCurrency(v.purchase_price)}
                        {v.extra_costs > 0 && (
                          <div className="text-[10px] text-text-muted">
                            + {formatCurrency(v.extra_costs)} مصاريف
                          </div>
                        )}
                      </td>

                      {/* الحالة */}
                      <td className="px-4 py-3">
                        <VehicleStatusBadge status={v.status} />
                      </td>

                      {/* الإجراءات */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/vehicles/${v.id}`}>
                            <button
                              className="p-1.5 rounded-[6px] border border-border text-text-secondary hover:text-primary hover:bg-white hover:border-primary transition-colors"
                              title="عرض التفاصيل الكاملة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          <Link to={`/vehicles/${v.id}/print`}>
                            <button
                              className="p-1.5 rounded-[6px] border border-border text-text-secondary hover:text-text-primary hover:bg-white transition-colors"
                              title="طباعة بطاقة معلومات السيارة A4"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </Link>

                          {v.status === 'available' && (
                            <Link to={`/sales?vehicleId=${v.id}`}>
                              <button
                                className="p-1.5 rounded-[6px] bg-primary-soft text-primary hover:bg-primary hover:text-white transition-colors"
                                title="تسجيل بيع وإخراج هذه السيارة"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة إضافة سيارة جديدة */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة سيارة جديدة إلى المخزون"
        description="تسجيل كافة تفاصيل السيارة والأرقام التعريفية المرتبطة بها بالدينار الجزائري (د.ج)"
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmitNewVehicle} className="space-y-6">
          {formError && (
            <div className="p-3 rounded-[8px] bg-status-dangerBg border border-red-200 text-status-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* القسم 1: المعلومات الأساسية */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3 pb-1 border-b border-divider">
              1. المعلومات الأساسية والمواصفات
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Input
                label="الماركة (العلامة التجارية)"
                isRequired
                placeholder="مثال: Toyota, Hyundai, Volkswagen"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
              <Input
                label="الطراز"
                isRequired
                placeholder="مثال: Hilux, Tucson, Golf"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
              <Input
                label="الفئة / المواصفة (Trim)"
                placeholder="مثال: Adventure 4x4, R-Line"
                value={formData.trim}
                onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
              />
              <Input
                label="سنة الصنع"
                type="number"
                placeholder="2024"
                value={formData.manufacture_year}
                onChange={(e) => setFormData({ ...formData, manufacture_year: Number(e.target.value) })}
              />
              <Input
                label="اللون الخارجي"
                placeholder="مثال: أبيض لؤلؤي، رمادي، أسود"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <Select
                label="نوع الوقود"
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as any })}
                options={[
                  { value: 'petrol', label: 'بنزين (Essence)' },
                  { value: 'diesel', label: 'ديزل / مازوت (Diesel)' },
                  { value: 'hybrid', label: 'هجين (Hybride)' },
                  { value: 'electric', label: 'كهرباء (Électrique)' },
                  { value: 'lpg', label: 'غاز مسال (GPL)' },
                  { value: 'other', label: 'نوع آخر' },
                ]}
              />
              <Select
                label="ناقل الحركة"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                options={[
                  { value: 'automatic', label: 'أوتوماتيك (Automatique)' },
                  { value: 'manual', label: 'يدوي (Manuel)' },
                ]}
              />
              <Input
                label="العداد (الكيلومترات)"
                type="number"
                placeholder="مثال: 25000"
                suffixElement="كم"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
              <Select
                label="حالة السيارة في المخزون"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'available', label: 'متاحة في المخزون' },
                  { value: 'reserved', label: 'محجوزة' },
                  { value: 'under_process', label: 'قيد الإجراء والتجهيز' },
                ]}
              />
            </div>
          </div>

          {/* القسم 2: الأرقام التعريفية المتعددة */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-divider">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                2. الأرقام التعريفية (رقم الهيكل، المحرك، اللوحة، الجمارك...)
              </h4>
              <button
                type="button"
                onClick={handleAddIdentifierRow}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة رقم تعريفي آخر
              </button>
            </div>

            <div className="space-y-2.5">
              {identifiers.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-page p-2.5 rounded-[8px] border border-border">
                  <div className="w-48">
                    <select
                      value={item.identifier_type}
                      onChange={(e) => handleIdentifierChange(index, 'identifier_type', e.target.value)}
                      aria-label="نوع الرقم التعريفي"
                      className="w-full rounded-[6px] border border-border bg-white px-2 py-1.5 text-xs text-text-primary"
                    >
                      <option value="vin">رقم الهيكل (VIN)</option>
                      <option value="registration_number">رقم اللوحة / التسجيل</option>
                      <option value="engine_number">رقم المحرك</option>
                      <option value="customs_number">الرقم الجمركي</option>
                      <option value="other">رقم آخر (مخصص)</option>
                    </select>
                  </div>

                  {item.identifier_type === 'other' && (
                    <div className="w-36">
                      <input
                        type="text"
                        placeholder="اسم الرقم"
                        value={item.custom_type_name}
                        onChange={(e) => handleIdentifierChange(index, 'custom_type_name', e.target.value)}
                        className="w-full rounded-[6px] border border-border bg-white px-2 py-1.5 text-xs"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="أدخل قيمة الرقم هنا..."
                      value={item.identifier_value}
                      onChange={(e) => handleIdentifierChange(index, 'identifier_value', e.target.value)}
                      className="w-full rounded-[6px] border border-border bg-white px-3 py-1.5 text-xs font-latin font-semibold tracking-wide uppercase"
                    />
                  </div>

                  {identifiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIdentifierRow(index)}
                      className="p-1 text-text-muted hover:text-status-danger transition-colors"
                      title="حذف هذا الرقم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* القسم 3: الشراء والمورد والبيانات المالية */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3 pb-1 border-b border-divider">
              3. بيانات دخول المخزون والتكلفة بالدينار الجزائري (د.ج)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                label="المورد"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                placeholder="— بدون مورد / شراء فردي —"
              />
              <Input
                label="تاريخ الدخول / الشراء"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
              <Input
                label="سعر الشراء"
                type="number"
                placeholder="مثال: 5500000"
                suffixElement="د.ج"
                dir="ltr"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              />
              <Input
                label="مصاريف إضافية (صيانة، رسوم، نقل)"
                type="number"
                placeholder="0"
                suffixElement="د.ج"
                dir="ltr"
                value={formData.extra_costs}
                onChange={(e) => setFormData({ ...formData, extra_costs: e.target.value })}
              />
            </div>
          </div>

          {/* القسم 4: الملاحظات والفحص */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات الفحص والوصف الداخلي
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="سجل أي ملاحظات خاصة بالسيارة، حالة الهيكل، الفحص التقني..."
              className="w-full rounded-[8px] border border-border bg-white p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              حفظ السيارة في المخزون
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

