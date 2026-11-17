import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Printer,
  Receipt,
  ArrowRight,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Fuel,
  Gauge,
  ShieldCheck,
  User,
  Truck,
  FileText,
  BookmarkCheck,
  Ban,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Vehicle, Customer, Supplier, IdentifierType } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  IDENTIFIER_TYPE_LABELS,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { VehicleStatusBadge } from '../../components/ui/Badge';
import { VehicleImageGallery } from '../../components/vehicles/VehicleImageGallery';

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // النوافذ المنبثقة
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // حالة نموذج الحجز
  const [reserveCustomerId, setReserveCustomerId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [reserveExpiresAt, setReserveExpiresAt] = useState('');
  const [reserveNotes, setReserveNotes] = useState('');

  // حالة نموذج التعديل
  const [editFormData, setEditFormData] = useState<any>({});
  const [editIdentifiers, setEditIdentifiers] = useState<
    { identifier_type: IdentifierType; custom_type_name: string; identifier_value: string }[]
  >([]);

  useEffect(() => {
    if (id) loadData(id);
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setIsEditModalOpen(true);
    }
  }, [id]);

  const loadData = async (vehicleId: string) => {
    try {
      setLoading(true);
      const [vData, cData, sData] = await Promise.all([
        api.getVehicleById(vehicleId),
        api.getCustomers(),
        api.getSuppliers(),
      ]);
      setVehicle(vData);
      setCustomers(cData);
      setSuppliers(sData);

      if (vData) {
        setEditFormData({
          brand: vData.brand,
          model: vData.model,
          trim: vData.trim || '',
          manufacture_year: vData.manufacture_year || '',
          color: vData.color || '',
          fuel_type: vData.fuel_type || 'petrol',
          transmission: vData.transmission || 'automatic',
          mileage: vData.mileage || '',
          supplier_id: vData.supplier_id || '',
          purchase_date: vData.purchase_date || '',
          purchase_price: vData.purchase_price || '',
          extra_costs: vData.extra_costs || 0,
          description: vData.description || '',
        });

        if (vData.identifiers && vData.identifiers.length > 0) {
          setEditIdentifiers(
            vData.identifiers.map((i) => ({
              identifier_type: i.identifier_type,
              custom_type_name: i.custom_type_name || '',
              identifier_value: i.identifier_value,
            }))
          );
        } else {
          setEditIdentifiers([
            { identifier_type: 'vin', custom_type_name: '', identifier_value: '' },
          ]);
        }
      }
    } catch (err) {
      console.error('Error loading vehicle details:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // معالجة حجز السيارة بالعربون
  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !reserveCustomerId || !depositAmount) {
      setModalError('يرجى اختيار العميل وتحديد قيمة العربون');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.reserveVehicle({
        vehicleId: vehicle.id,
        customerId: reserveCustomerId,
        depositAmount: Number(depositAmount),
        expiresAt: reserveExpiresAt || undefined,
        notes: reserveNotes || undefined,
      });

      setIsReserveModalOpen(false);
      setDepositAmount('');
      setReserveNotes('');
      await loadData(vehicle.id);
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء حجز السيارة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // إلغاء الحجز وإعادة السيارة للمخزون
  const handleCancelReservation = async () => {
    if (!vehicle) return;
    if (!confirm('هل أنت متأكد من إلغاء حجز السيارة وإعادتها متاحة في المخزون؟')) return;

    try {
      await api.cancelReservation(vehicle.id);
      await loadData(vehicle.id);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
    }
  };

  // حفظ التعديلات على السيارة
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    try {
      setIsSubmitting(true);
      const cleanIdentifiers = editIdentifiers
        .filter((i) => i.identifier_value.trim() !== '')
        .map((i) => ({
          identifier_type: i.identifier_type,
          custom_type_name: i.identifier_type === 'other' ? i.custom_type_name : null,
          identifier_value: i.identifier_value.trim().toUpperCase(),
        }));

      await api.updateVehicle(
        vehicle.id,
        {
          brand: editFormData.brand.trim(),
          model: editFormData.model.trim(),
          trim: editFormData.trim.trim() || null,
          manufacture_year: Number(editFormData.manufacture_year) || null,
          color: editFormData.color.trim() || null,
          fuel_type: editFormData.fuel_type || null,
          transmission: editFormData.transmission || null,
          mileage: editFormData.mileage ? Number(editFormData.mileage) : null,
          supplier_id: editFormData.supplier_id || null,
          purchase_date: editFormData.purchase_date || null,
          purchase_price: editFormData.purchase_price ? Number(editFormData.purchase_price) : null,
          extra_costs: Number(editFormData.extra_costs) || 0,
          description: editFormData.description.trim() || null,
        },
        cleanIdentifiers
      );

      setIsEditModalOpen(false);
      await loadData(vehicle.id);
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء تحديث بيانات السيارة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // حذف السيارة
  const handleDeleteVehicle = async () => {
    if (!vehicle) return;
    try {
      setIsSubmitting(true);
      await api.deleteVehicle(vehicle.id);
      navigate('/vehicles');
    } catch (err: any) {
      alert(err.message || 'تعذر حذف السيارة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // إدارة الصور
  const handleAddImage = async (dataUrl: string, isPrimary: boolean) => {
    if (!vehicle) return;
    await api.addVehicleImage(vehicle.id, dataUrl, isPrimary);
    await loadData(vehicle.id);
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!vehicle) return;
    await api.removeVehicleImage(vehicle.id, imageId);
    await loadData(vehicle.id);
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!vehicle) return;
    await api.setPrimaryImage(vehicle.id, imageId);
    await loadData(vehicle.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="text-xs text-text-muted">جاري تحميل بيانات السيارة...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-bold text-text-primary">السيارة غير موجودة</h3>
        <p className="text-xs text-text-muted mt-1">قد تكون حذفت أو أن الرابط غير صحيح.</p>
        <Link to="/vehicles" className="inline-block mt-4">
          <Button variant="secondary" size="sm">
            العودة للمخزون
          </Button>
        </Link>
      </div>
    );
  }

  const totalCost = (vehicle.purchase_price || 0) + (vehicle.extra_costs || 0);

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات والترويسة */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/vehicles"
            className="p-2 rounded-[8px] border border-border text-text-secondary hover:text-text-primary hover:bg-page transition-colors"
            title="العودة للمخزون"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-text-primary">
                {vehicle.brand} {vehicle.model}
              </h2>
              <VehicleStatusBadge status={vehicle.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {vehicle.trim || 'فئة قياسية'} • سنة الصنع: {vehicle.manufacture_year || '—'} • اللون: {vehicle.color || '—'}
            </p>
          </div>
        </div>

        {/* أزرار الإجراءات المتعددة */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/vehicles/${vehicle.id}/print`}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
            >
              طباعة بطاقة السيارة A4
            </Button>
          </Link>

          {/* زر التعديل */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setModalError(null);
              setIsEditModalOpen(true);
            }}
            icon={<Edit className="w-4 h-4" />}
          >
            تعديل البيانات
          </Button>

          {/* إذا كانت متاحة: خيار الحجز أو البيع */}
          {vehicle.status === 'available' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalError(null);
                  setIsReserveModalOpen(true);
                }}
                icon={<BookmarkCheck className="w-4 h-4" />}
              >
                حجز بالعربون
              </Button>
              <Link to={`/sales?vehicleId=${vehicle.id}`}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Receipt className="w-4 h-4" />}
                >
                  تسجيل بيع / إخراج
                </Button>
              </Link>
            </>
          )}

          {/* إذا كانت محجوزة: تحويل لبيع أو إلغاء الحجز */}
          {vehicle.status === 'reserved' && (
            <>
              <Link to={`/sales?vehicleId=${vehicle.id}`}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Receipt className="w-4 h-4" />}
                >
                  إتمام البيع النهائي
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelReservation}
                icon={<Ban className="w-4 h-4" />}
              >
                إلغاء الحجز
              </Button>
            </>
          )}

          {/* زر حذف السيارة إن لم تكن مباعة */}
          {vehicle.status !== 'sold' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-status-danger hover:bg-red-50 hover:text-red-700"
              icon={<Trash2 className="w-4 h-4" />}
            >
              حذف
            </Button>
          )}
        </div>
      </div>

      {/* لوحة تنبيه الحجز إن كانت السيارة محجوزة بالعربون */}
      {vehicle.status === 'reserved' && vehicle.reservation && (
        <div className="p-4 rounded-card bg-[#FFFBEB] border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-amber-700" />
              <h4 className="text-sm font-bold text-amber-900">
                السيارة محجوزة حالياً بعربون مالي
              </h4>
            </div>
            <p className="text-xs text-amber-800">
              المشتري الحاجز: <strong>{vehicle.reservation.customer?.full_name || 'عميل مسجل'}</strong> (هاتف: {vehicle.reservation.customer?.phone || '—'})
            </p>
            {vehicle.reservation.notes && (
              <p className="text-xs text-amber-700 italic">
                ملاحظات: {vehicle.reservation.notes}
              </p>
            )}
          </div>

          <div className="text-left bg-white p-3 rounded-lg border border-amber-200">
            <span className="text-[11px] text-text-muted block">قيمة العربون المدفوع:</span>
            <span className="text-base font-bold text-amber-700 font-latin">
              {formatCurrency(vehicle.reservation.deposit_amount)}
            </span>
          </div>
        </div>
      )}

      {/* معرض صور السيارة الفعلي */}
      <Card title="معرض صور وفحص السيارة" subtitle="صور السيارة المرفقة في سحابة Supabase Storage">
        <VehicleImageGallery
          vehicleId={vehicle.id}
          images={vehicle.images || []}
          onAddImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
          onSetPrimary={handleSetPrimaryImage}
          onImagesUpdated={async () => {
            await loadData(vehicle.id);
          }}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيمن: المواصفات والأرقام التعريفية */}
        <div className="lg:col-span-2 space-y-6">
          {/* الأرقام التعريفية */}
          <Card title="الأرقام التعريفية للسيارة" subtitle="أرقام الهيكل، المحرك، والترقيم المعتمدة">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicle.identifiers && vehicle.identifiers.length > 0 ? (
                vehicle.identifiers.map((ident) => {
                  const typeLabel =
                    ident.identifier_type === 'other'
                      ? ident.custom_type_name || 'رقم آخر'
                      : IDENTIFIER_TYPE_LABELS[ident.identifier_type];

                  return (
                    <div
                      key={ident.id}
                      className="p-3 rounded-[8px] bg-page border border-border flex items-center justify-between"
                    >
                      <div>
                        <span className="block text-[11px] font-semibold text-text-muted">
                          {typeLabel}
                        </span>
                        <span className="font-mono font-bold text-sm text-text-primary tracking-wide font-latin">
                          {ident.identifier_value}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(ident.identifier_value, ident.id)}
                        className="p-1.5 rounded-[6px] text-text-muted hover:text-primary hover:bg-white transition-colors"
                        title="نسخ الرقم"
                      >
                        {copiedId === ident.id ? (
                          <Check className="w-4 h-4 text-status-available" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-text-muted">لم يتم إدخال أرقام تعريفية لهذه السيارة</p>
              )}
            </div>
          </Card>

          {/* المواصفات الفنية والوصف */}
          <Card title="المواصفات الفنية" subtitle="تفاصيل المحرك، ناقل الحركة، والعداد">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-text-muted block">نوع الوقود</span>
                <span className="font-bold text-text-primary mt-0.5 block">
                  {vehicle.fuel_type ? FUEL_TYPE_LABELS[vehicle.fuel_type] : '—'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">ناقل الحركة</span>
                <span className="font-bold text-text-primary mt-0.5 block">
                  {vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : '—'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">المسافة المقطوعة</span>
                <span className="font-bold text-text-primary mt-0.5 block font-latin">
                  {formatNumber(vehicle.mileage, 'كم')}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">اللون الخارجي</span>
                <span className="font-bold text-text-primary mt-0.5 block">
                  {vehicle.color || '—'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">سنة الصنع</span>
                <span className="font-bold text-text-primary mt-0.5 block font-latin">
                  {vehicle.manufacture_year || '—'}
                </span>
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-4 pt-4 border-t border-divider">
                <span className="text-xs font-semibold text-text-secondary block mb-1">
                  ملاحظات الفحص والوصف الداخلي:
                </span>
                <p className="text-xs text-text-muted leading-relaxed bg-page p-3 rounded-[8px] border border-border">
                  {vehicle.description}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* العمود الأيسر: البيانات المالية وسجل الشراء/البيع */}
        <div className="space-y-6">
          {/* بيانات دخول المخزون والشراء */}
          <Card title="بيانات الشراء والتكلفة" subtitle="القيم المالية بالدينار الجزائري">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-divider">
                <span className="text-text-muted">تاريخ دخول المخزون:</span>
                <span className="font-semibold text-text-primary">
                  {formatDate(vehicle.purchase_date)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-divider">
                <span className="text-text-muted">المورد:</span>
                <span className="font-semibold text-text-primary">
                  {vehicle.supplier ? vehicle.supplier.name : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-divider">
                <span className="text-text-muted">سعر الشراء:</span>
                <span className="font-bold text-text-primary font-latin">
                  {formatCurrency(vehicle.purchase_price)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-divider">
                <span className="text-text-muted">المصاريف الإضافية:</span>
                <span className="font-semibold text-text-primary font-latin">
                  {formatCurrency(vehicle.extra_costs)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-text-primary">إجمالي التكلفة المسجلة:</span>
                <span className="font-bold text-primary text-sm font-latin">
                  {formatCurrency(totalCost)}
                </span>
              </div>

              <div className="pt-2">
                <Link
                  to="/expenses"
                  className="block text-center py-1.5 px-3 rounded-[6px] bg-slate-100 text-text-secondary hover:text-primary hover:bg-slate-200 text-[11px] font-semibold transition-colors border border-border"
                >
                  سجل مصاريف وتجهيز المركبة ⬅
                </Link>
              </div>
            </div>
          </Card>

          {/* معلومات البيع إن كانت السيارة مباعة */}
          {vehicle.sale && (
            <Card
              title="معلومات البيع والإخراج"
              subtitle="السيارة مخرجة ومسلمة للمشتري"
              className="border-green-200 bg-[#F0FDF4]/30"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-text-muted">رقم وثيقة التسليم:</span>
                  <span className="font-bold text-primary font-latin">
                    {vehicle.sale.reference_number}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-text-muted">تاريخ التسليم:</span>
                  <span className="font-semibold text-text-primary">
                    {formatDate(vehicle.sale.sale_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-text-muted">سعر البيع النهائي:</span>
                  <span className="font-bold text-[#15803D] font-latin">
                    {formatCurrency(vehicle.sale.sale_price - (vehicle.sale.discount || 0))}
                  </span>
                </div>
                <Link
                  to={`/sales/${vehicle.sale.id}/delivery-document`}
                  className="block mt-2"
                >
                  <Button variant="outline" size="sm" className="w-full" icon={<FileText className="w-4 h-4" />}>
                    عرض وثيقة التسليم الرسمية A4
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* نافذة حجز السيارة بالعربون */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title="حجز السيارة بالعربون"
        description="تسجيل حجز مؤقت للسيارة لزبون محدد مع توثيق مبلغ العربون بالدينار الجزائري"
        maxWidth="md"
      >
        <form onSubmit={handleReserveSubmit} className="space-y-3">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-status-danger text-xs rounded">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              العميل الحاجز <span className="text-status-danger">*</span>
            </label>
            <select
              value={reserveCustomerId}
              onChange={(e) => setReserveCustomerId(e.target.value)}
              className="w-full rounded-[8px] border border-border bg-white px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">— اختر العميل —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="مبلغ العربون المدفوع"
            isRequired
            type="number"
            dir="ltr"
            placeholder="مثال: 50000"
            suffixElement="د.ج"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />

          <Input
            label="تاريخ انتهاء صلاحية الحجز (اختياري)"
            type="date"
            value={reserveExpiresAt}
            onChange={(e) => setReserveExpiresAt(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات الحجز والاتفاق
            </label>
            <textarea
              rows={2}
              value={reserveNotes}
              onChange={(e) => setReserveNotes(e.target.value)}
              placeholder="مثال: تم دفع العربون نقداً والاتفاق على إتمام الباقي خلال 3 أيام..."
              className="w-full rounded-[8px] border border-border bg-white p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-divider">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsReserveModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              تأكيد حجز السيارة
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تعديل بيانات السيارة */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل بيانات السيارة في المخزون"
        description="تحديث المواصفات، العداد، التكاليف، والأرقام التعريفية"
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-status-danger text-xs rounded">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Input
              label="الماركة"
              isRequired
              value={editFormData.brand || ''}
              onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
            />
            <Input
              label="الطراز"
              isRequired
              value={editFormData.model || ''}
              onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
            />
            <Input
              label="الفئة"
              value={editFormData.trim || ''}
              onChange={(e) => setEditFormData({ ...editFormData, trim: e.target.value })}
            />
            <Input
              label="سنة الصنع"
              type="number"
              value={editFormData.manufacture_year || ''}
              onChange={(e) => setEditFormData({ ...editFormData, manufacture_year: e.target.value })}
            />
            <Input
              label="اللون"
              value={editFormData.color || ''}
              onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
            />
            <Input
              label="العداد (كم)"
              type="number"
              suffixElement="كم"
              value={editFormData.mileage || ''}
              onChange={(e) => setEditFormData({ ...editFormData, mileage: e.target.value })}
            />
            <Input
              label="سعر الشراء"
              type="number"
              suffixElement="د.ج"
              dir="ltr"
              value={editFormData.purchase_price || ''}
              onChange={(e) => setEditFormData({ ...editFormData, purchase_price: e.target.value })}
            />
            <Input
              label="مصاريف إضافية"
              type="number"
              suffixElement="د.ج"
              dir="ltr"
              value={editFormData.extra_costs || ''}
              onChange={(e) => setEditFormData({ ...editFormData, extra_costs: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              ملاحظات الفحص والوصف الداخلي
            </label>
            <textarea
              rows={2}
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full rounded-[8px] border border-border bg-white p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-divider">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد حذف السيارة */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف السيارة"
        description="إجراء إداري دائم لحذف سجل هذه السيارة من المخزون"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف السيارة <strong>{vehicle.brand} {vehicle.model}</strong>؟ لن تتمكن من استرجاع هذا السجل بعد حذفه.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-divider">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              تراجع
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteVehicle}
              isLoading={isSubmitting}
            >
              نعم، حذف نهائي
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
