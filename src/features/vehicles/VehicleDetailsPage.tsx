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
} from 'lucide-react';
import { api } from '../../lib/api';
import { Vehicle } from '../../types';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  IDENTIFIER_TYPE_LABELS,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { VehicleStatusBadge } from '../../components/ui/Badge';

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadVehicle(id);
  }, [id]);

  const loadVehicle = async (vehicleId: string) => {
    try {
      setLoading(true);
      const data = await api.getVehicleById(vehicleId);
      setVehicle(data);
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
      {/* شريط الإجراءات والعودة */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-xs">
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
              {vehicle.trim || 'فئة قياسية'} • سنة الصنع: {vehicle.manufacture_year || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link to={`/vehicles/${vehicle.id}/print`} className="flex-1 sm:flex-none">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Printer className="w-4 h-4" />}
            >
              طباعة بطاقة السيارة A4
            </Button>
          </Link>

          {vehicle.status === 'available' && (
            <Link to={`/sales?vehicleId=${vehicle.id}`} className="flex-1 sm:flex-none">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                icon={<Receipt className="w-4 h-4" />}
              >
                تسجيل بيع / إخراج
              </Button>
            </Link>
          )}
        </div>
      </div>

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
    </div>
  );
};

