import { supabase, isSupabaseConfigured } from './supabase';
import {
  Vehicle,
  Customer,
  Supplier,
  Sale,
  ShowroomSettings,
  VehicleIdentifier,
  VehicleImage,
  VehicleReservation,
  DashboardStats,
  RentalContract,
  RentalStatus,
  TradeIn,
  PaymentRecord,
  VehicleExpense,
} from '../types';
import { generateReferenceNumber } from './utils';

// ====================================================================
// البيانات الأولية الافتراضية (Fallback & Seed)
// ====================================================================
const DEFAULT_SETTINGS: ShowroomSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'معرض حسونة أوتو',
  phone: '0662309669',
  email: 'contact@hassouna-auto.dz',
  address: 'أميه ونسة – الوادي، طريق تقرت',
  commercial_register: '39/00-9874561B21',
  tax_number: '002139098745612',
  logo_url: '/logo.svg',
  currency: 'د.ج',
  delivery_terms:
    'خدماتنا: بيع، شراء، كراء (تأجير)، وتبادل السيارات الجديدة والمستعملة. تم تسليم المركبة ومفاتيحها بعد المعاينة والفحص الفني وقبولها بحالتها الراهنة.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'شركة النورس لاستيراد المركبات',
    phone: '0560 98 76 54',
    email: 'nourass.auto@gmail.com',
    address: 'البليدة - المنطقة الصناعية بن بولعيد',
    business_registration_number: '09/00-7654321A19',
    contact_person: 'السيد كريم بن عيسى',
    notes: 'مورد رئيسي لسيارات تويوتا وهيونداي جديدة',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
    vehicles_count: 2,
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'مؤسسة الوفاق لتجارة السيارات',
    phone: '0661 23 45 67',
    email: 'contact@elouifak.dz',
    address: 'وهران - حي مرافال',
    business_registration_number: '31/00-9876543B20',
    contact_person: 'السيد طارق مزيان',
    notes: 'مورد سيارات مستعملة نظيفة بحالة ممتازة',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    vehicles_count: 1,
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    full_name: 'عبد الرحمن بن علي',
    phone: '0770 11 22 33',
    secondary_phone: '0555 44 33 22',
    address: 'الجزائر العاصمة - بئر خادم',
    identity_number: '109823471012345',
    notes: 'عميل دائم، مهتم بالسيارات العائلية SUV',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    purchases_count: 1,
    total_spent: 5850000,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    full_name: 'يوسف قاسم',
    phone: '0666 77 88 99',
    secondary_phone: null,
    address: 'بومرداس - وسط المدينة',
    identity_number: '118765432098765',
    notes: 'دفع نقدي فوري',
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2024-02-01T11:00:00Z',
    purchases_count: 0,
    total_spent: 0,
  },
];

const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    brand: 'Toyota',
    model: 'Hilux',
    trim: 'Adventure 4x4 Double Cabine',
    manufacture_year: 2023,
    color: 'رمادي معدني',
    fuel_type: 'diesel',
    transmission: 'automatic',
    mileage: 12500,
    condition_notes: 'حالة ممتازة كالجديدة، خالية من أي صدمات أو دهان',
    status: 'available',
    supplier_id: '11111111-1111-1111-1111-111111111101',
    purchase_date: '2024-01-15',
    purchase_price: 7800000,
    extra_costs: 150000,
    description: 'تويوتا هايلوكس دبل كابين فل كامل محرك 2.8 لتر ديزل',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    identifiers: [
      {
        id: 'id-1',
        vehicle_id: '33333333-3333-3333-3333-333333333301',
        identifier_type: 'vin',
        identifier_value: 'MROBA3CD400123456',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'id-2',
        vehicle_id: '33333333-3333-3333-3333-333333333301',
        identifier_type: 'engine_number',
        identifier_value: '1GD-FTV-894321',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'id-3',
        vehicle_id: '33333333-3333-3333-3333-333333333301',
        identifier_type: 'registration_number',
        identifier_value: '01234-123-16',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'id-4',
        vehicle_id: '33333333-3333-3333-3333-333333333301',
        identifier_type: 'customs_number',
        identifier_value: 'DZ-ALG-2023-9944',
        created_at: '2024-01-15T10:00:00Z',
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    brand: 'Hyundai',
    model: 'Tucson',
    trim: 'N-Line 1.6 T-GDI',
    manufacture_year: 2022,
    color: 'أبيض لؤلؤي',
    fuel_type: 'petrol',
    transmission: 'automatic',
    mileage: 34000,
    condition_notes: 'صيانة دورية منتظمة بالوكالة، طلاء أصلي بالكامل',
    status: 'available',
    supplier_id: '11111111-1111-1111-1111-111111111101',
    purchase_date: '2024-02-01',
    purchase_price: 5900000,
    extra_costs: 80000,
    description: 'هيونداي توسان فئة إن لاين سقف بانوراما دفع رباعي',
    created_at: '2024-02-01T12:00:00Z',
    updated_at: '2024-02-01T12:00:00Z',
    identifiers: [
      {
        id: 'id-5',
        vehicle_id: '33333333-3333-3333-3333-333333333302',
        identifier_type: 'vin',
        identifier_value: 'KMHD881CNEU654321',
        created_at: '2024-02-01T12:00:00Z',
      },
      {
        id: 'id-6',
        vehicle_id: '33333333-3333-3333-3333-333333333302',
        identifier_type: 'registration_number',
        identifier_value: '05678-122-16',
        created_at: '2024-02-01T12:00:00Z',
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    brand: 'Volkswagen',
    model: 'Golf 8',
    trim: 'R-Line 2.0 TDI',
    manufacture_year: 2021,
    color: 'أزرق غامق',
    fuel_type: 'diesel',
    transmission: 'automatic',
    mileage: 52000,
    condition_notes: 'حالة جيدة جداً، فحص شامل سليم',
    status: 'sold',
    supplier_id: '11111111-1111-1111-1111-111111111102',
    purchase_date: '2023-11-10',
    purchase_price: 5400000,
    extra_costs: 120000,
    description: 'فولكس واجن جولف 8 آر لاين محرك ديزل 150 حصان',
    created_at: '2023-11-10T09:00:00Z',
    updated_at: '2024-02-10T14:30:00Z',
    identifiers: [
      {
        id: 'id-7',
        vehicle_id: '33333333-3333-3333-3333-333333333303',
        identifier_type: 'vin',
        identifier_value: 'WVWZZZCDZMW789012',
        created_at: '2023-11-10T09:00:00Z',
      },
      {
        id: 'id-8',
        vehicle_id: '33333333-3333-3333-3333-333333333303',
        identifier_type: 'registration_number',
        identifier_value: '09812-121-09',
        created_at: '2023-11-10T09:00:00Z',
      },
    ],
  },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    reference_number: 'INV-2024-0001',
    vehicle_id: '33333333-3333-3333-3333-333333333303',
    customer_id: '22222222-2222-2222-2222-222222222201',
    sale_date: '2024-02-10',
    sale_price: 5850000,
    discount: 50000,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    notes: 'تم تسليم السيارة مع وثائق التحويل وكافة المفاتيح',
    created_at: '2024-02-10T14:30:00Z',
  },
];

// إدارة التخزين المحلي المحاكي (Local Storage Persistent Store)
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(`erp_tamma_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`erp_tamma_${key}`, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// تهيئة التخزين وتحديثه لاسم معرض حسونة أوتو
const savedSettings = getLocalItem<ShowroomSettings | null>('settings', null);
if (!savedSettings || savedSettings.name !== 'معرض حسونة أوتو' || savedSettings.phone !== '0662309669') {
  setLocalItem('settings', DEFAULT_SETTINGS);
  setLocalItem('suppliers', DEFAULT_SUPPLIERS);
  setLocalItem('customers', DEFAULT_CUSTOMERS);
  setLocalItem('vehicles', DEFAULT_VEHICLES);
  setLocalItem('sales', DEFAULT_SALES);
  localStorage.setItem('erp_tamma_initialized_v3', 'true');
}

// ====================================================================
// واجهات برمجة التطبيق (API Service)
// ====================================================================

export const api = {
  // --------------------------------------------------
  // 1. الإعدادات (Showroom Settings)
  // --------------------------------------------------
  async getSettings(): Promise<ShowroomSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('showroom_settings').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local storage for settings:', err);
      }
    }
    return getLocalItem('settings', DEFAULT_SETTINGS);
  },

  async getShowroomSettings(): Promise<ShowroomSettings> {
    return this.getSettings();
  },

  async updateSettings(settings: Partial<ShowroomSettings>): Promise<ShowroomSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('showroom_settings')
          .upsert(settings)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateSettings error:', err);
      }
    }
    const current = getLocalItem('settings', DEFAULT_SETTINGS);
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setLocalItem('settings', updated);
    return updated;
  },

  // --------------------------------------------------
  // 2. إدارة المخزون والسيارات (Vehicles)
  // --------------------------------------------------
  async getVehicles(searchQuery?: string, statusFilter?: string): Promise<Vehicle[]> {
    let vehicles: Vehicle[] | null = null;

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('vehicles')
          .select('*, supplier:suppliers(*), identifiers:vehicle_identifiers(*), vehicle_images:vehicle_images(*), reservations:vehicle_reservations(*, customer:customers(*)), sale:sales(*, customer:customers(*))')
          .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (!error && data) {
          vehicles = data.map((v: any) => {
            let combinedImages: VehicleImage[] = [];

            // 1. مصفوفة الروابط النصية text[] داخل عمود images
            if (Array.isArray(v.images) && v.images.length > 0 && typeof v.images[0] === 'string') {
              combinedImages = v.images.map((url: string, idx: number) => ({
                id: `img-${idx}-${v.id}`,
                vehicle_id: v.id,
                storage_path: url,
                is_primary: idx === 0,
                created_at: v.created_at,
              }));
            }
            // 2. سجلات جدول vehicle_images
            else if (Array.isArray(v.vehicle_images) && v.vehicle_images.length > 0) {
              combinedImages = v.vehicle_images;
            }
            // 3. كائنات صور موجودة مسبقاً
            else if (Array.isArray(v.images) && v.images.length > 0 && typeof v.images[0] === 'object') {
              combinedImages = v.images;
            }

            return {
              ...v,
              reservation: v.reservations?.find((r: any) => r.status === 'active') || null,
              sale: Array.isArray(v.sale) ? v.sale[0] || null : v.sale || null,
              images: combinedImages,
              identifiers: v.identifiers || [],
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getVehicles error, fallback to local:', err);
      }
    }

    if (vehicles === null) {
      vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
      const suppliers = getLocalItem<Supplier[]>('suppliers', DEFAULT_SUPPLIERS);
      const sales = getLocalItem<Sale[]>('sales', DEFAULT_SALES);
      const reservations = getLocalItem<VehicleReservation[]>('reservations', []);
      const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);

      // ربط العلاقات محلياً
      vehicles = vehicles.map((v) => {
        const activeRes = reservations.find((r) => r.vehicle_id === v.id && r.status === 'active') || null;
        if (activeRes) {
          activeRes.customer = customers.find((c) => c.id === activeRes.customer_id) || null;
        }

        return {
          ...v,
          supplier: suppliers.find((s) => s.id === v.supplier_id) || null,
          sale: sales.find((s) => s.vehicle_id === v.id) || null,
          reservation: activeRes,
          images: v.images || [],
        };
      });

      if (statusFilter && statusFilter !== 'all') {
        vehicles = vehicles.filter((v) => v.status === statusFilter);
      }
    }

    // تصفية البحث المتقدم (الماركة، الطراز، أو أي من الأرقام التعريفية مثل VIN، المحرك، واللوحة)
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      vehicles = vehicles.filter((v) => {
        const brandMatch = v.brand.toLowerCase().includes(q);
        const modelMatch = v.model.toLowerCase().includes(q);
        const supplierMatch = v.supplier?.name?.toLowerCase().includes(q);
        const identifierMatch = v.identifiers?.some((id) =>
          id.identifier_value.toLowerCase().includes(q)
        );
        return brandMatch || modelMatch || supplierMatch || identifierMatch;
      });
    }

    return vehicles;
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*, supplier:suppliers(*), identifiers:vehicle_identifiers(*), vehicle_images:vehicle_images(*), reservations:vehicle_reservations(*, customer:customers(*)), sale:sales(*, customer:customers(*))')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const v = data as any;
          let combinedImages: VehicleImage[] = [];

          // 1. مصفوفة الروابط النصية text[] داخل عمود images
          if (Array.isArray(v.images) && v.images.length > 0 && typeof v.images[0] === 'string') {
            combinedImages = v.images.map((url: string, idx: number) => ({
              id: `img-${idx}-${v.id}`,
              vehicle_id: v.id,
              storage_path: url,
              is_primary: idx === 0,
              created_at: v.created_at,
            }));
          }
          // 2. سجلات جدول vehicle_images
          else if (Array.isArray(v.vehicle_images) && v.vehicle_images.length > 0) {
            combinedImages = v.vehicle_images;
          }
          // 3. كائنات صور موجودة مسبقاً
          else if (Array.isArray(v.images) && v.images.length > 0 && typeof v.images[0] === 'object') {
            combinedImages = v.images;
          }

          return {
            ...v,
            reservation: v.reservations?.find((r: any) => r.status === 'active') || null,
            sale: Array.isArray(v.sale) ? v.sale[0] || null : v.sale || null,
            images: combinedImages,
            identifiers: v.identifiers || [],
          } as Vehicle;
        }
      } catch (err) {
        console.warn('Supabase getVehicleById error:', err);
      }
    }

    const list = await this.getVehicles();
    return list.find((v) => v.id === id) || null;
  },

  async checkIdentifierExists(
    identifierValue: string,
    identifierType: string,
    excludeVehicleId?: string
  ): Promise<boolean> {
    const trimmedVal = identifierValue.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from('vehicle_identifiers')
          .select('id, vehicle_id')
          .eq('identifier_type', identifierType)
          .ilike('identifier_value', trimmedVal);

        if (excludeVehicleId) {
          q = q.neq('vehicle_id', excludeVehicleId);
        }

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return true;
        }
      } catch (err) {
        console.warn('Supabase checkIdentifierExists error:', err);
      }
    }

    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    return vehicles.some((v) => {
      if (excludeVehicleId && v.id === excludeVehicleId) return false;
      return v.identifiers?.some(
        (id) =>
          id.identifier_type === identifierType &&
          id.identifier_value.trim().toUpperCase() === trimmedVal
      );
    });
  },

  async createVehicle(
    vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'identifiers'>,
    identifiers: Omit<VehicleIdentifier, 'id' | 'vehicle_id' | 'created_at'>[]
  ): Promise<Vehicle> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const formattedIdentifiers: VehicleIdentifier[] = identifiers.map((id) => ({
      ...id,
      id: crypto.randomUUID(),
      vehicle_id: newId,
      created_at: now,
    }));

    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      created_at: now,
      updated_at: now,
      identifiers: formattedIdentifiers,
    };

    if (isSupabaseConfigured) {
      try {
        const { error: vErr } = await supabase.from('vehicles').insert([
          {
            id: newId,
            brand: newVehicle.brand,
            model: newVehicle.model,
            trim: newVehicle.trim,
            manufacture_year: newVehicle.manufacture_year,
            color: newVehicle.color,
            fuel_type: newVehicle.fuel_type,
            transmission: newVehicle.transmission,
            mileage: newVehicle.mileage,
            condition_notes: newVehicle.condition_notes,
            status: newVehicle.status,
            supplier_id: newVehicle.supplier_id,
            purchase_date: newVehicle.purchase_date,
            purchase_price: newVehicle.purchase_price,
            extra_costs: newVehicle.extra_costs,
            description: newVehicle.description,
          },
        ]);

        if (!vErr && formattedIdentifiers.length > 0) {
          await supabase.from('vehicle_identifiers').insert(
            formattedIdentifiers.map((i) => ({
              id: i.id,
              vehicle_id: newId,
              identifier_type: i.identifier_type,
              custom_type_name: i.custom_type_name,
              identifier_value: i.identifier_value,
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase createVehicle fallback to local:', err);
      }
    }

    const currentVehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    setLocalItem('vehicles', [newVehicle, ...currentVehicles]);

    return newVehicle;
  },

  async updateVehicle(
    id: string,
    vehicleData: Partial<Vehicle>,
    identifiers?: Omit<VehicleIdentifier, 'id' | 'vehicle_id' | 'created_at'>[]
  ): Promise<Vehicle> {
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('السيارة غير موجودة');

    const now = new Date().toISOString();
    let updatedIdentifiers = vehicles[idx].identifiers || [];

    if (identifiers) {
      updatedIdentifiers = identifiers.map((i) => ({
        ...i,
        id: crypto.randomUUID(),
        vehicle_id: id,
        created_at: now,
      }));
    }

    const updatedVehicle: Vehicle = {
      ...vehicles[idx],
      ...vehicleData,
      identifiers: updatedIdentifiers,
      updated_at: now,
    };

    // مزامنة مباشرة مع قاعدة بيانات Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('vehicles')
          .update({
            brand: updatedVehicle.brand,
            model: updatedVehicle.model,
            trim: updatedVehicle.trim,
            manufacture_year: updatedVehicle.manufacture_year,
            color: updatedVehicle.color,
            fuel_type: updatedVehicle.fuel_type,
            transmission: updatedVehicle.transmission,
            mileage: updatedVehicle.mileage,
            condition_notes: updatedVehicle.condition_notes,
            status: updatedVehicle.status,
            supplier_id: updatedVehicle.supplier_id,
            purchase_date: updatedVehicle.purchase_date,
            purchase_price: updatedVehicle.purchase_price,
            extra_costs: updatedVehicle.extra_costs,
            description: updatedVehicle.description,
            updated_at: now,
          })
          .eq('id', id);

        if (identifiers) {
          // استبدال الأرقام التعريفية القديمة بالجديدة
          await supabase.from('vehicle_identifiers').delete().eq('vehicle_id', id);
          if (updatedIdentifiers.length > 0) {
            await supabase.from('vehicle_identifiers').insert(
              updatedIdentifiers.map((i) => ({
                id: i.id,
                vehicle_id: id,
                identifier_type: i.identifier_type,
                custom_type_name: i.custom_type_name,
                identifier_value: i.identifier_value,
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Supabase updateVehicle error:', err);
      }
    }

    vehicles[idx] = updatedVehicle;
    setLocalItem('vehicles', vehicles);

    return updatedVehicle;
  },

  async deleteVehicle(id: string): Promise<boolean> {
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const target = vehicles.find((v) => v.id === id);
    if (!target) throw new Error('السيارة غير موجودة في النظام');
    if (target.status === 'sold') {
      throw new Error('لا يمكن حذف سيارة تم بيعها وإخراجها للمشتري؛ السجل محمي قانونياً وتوثيقياً');
    }

    // حذف آمن من Supabase مع الجداول التابعة
    if (isSupabaseConfigured) {
      try {
        // التحقق من حالة السيارة في قاعدة البيانات
        const { data: vCheck } = await supabase.from('vehicles').select('status').eq('id', id).maybeSingle();
        if (vCheck && vCheck.status === 'sold') {
          throw new Error('لا يمكن حذف سيارة تم بيعها وإخراجها للمشتري؛ السجل محمي قانونياً');
        }

        await supabase.from('vehicle_identifiers').delete().eq('vehicle_id', id);
        await supabase.from('vehicle_images').delete().eq('vehicle_id', id);
        await supabase.from('vehicle_reservations').delete().eq('vehicle_id', id);
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) {
          console.error('Supabase deleteVehicle error:', error);
          throw new Error(error.message || 'تعذر حذف السيارة من قاعدة البيانات');
        }
      } catch (err: any) {
        console.warn('Supabase deleteVehicle catch:', err);
        if (err.message && err.message.includes('لا يمكن')) throw err;
      }
    }

    const filtered = vehicles.filter((v) => v.id !== id);
    setLocalItem('vehicles', filtered);
    return true;
  },

  async reserveVehicle(data: {
    vehicleId: string;
    customerId: string;
    depositAmount: number;
    expiresAt?: string;
    notes?: string;
  }): Promise<VehicleReservation> {
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIndex = vehicles.findIndex((v) => v.id === data.vehicleId);
    if (vIndex === -1) throw new Error('السيارة غير موجودة');
    if (vehicles[vIndex].status !== 'available') {
      throw new Error('لا يمكن حجز سيارة غير متاحة في المخزون');
    }

    const reservationId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newReservation: VehicleReservation = {
      id: reservationId,
      vehicle_id: data.vehicleId,
      customer_id: data.customerId,
      deposit_amount: data.depositAmount,
      reserved_at: now,
      expires_at: data.expiresAt || null,
      notes: data.notes || null,
      status: 'active',
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicle_reservations').insert([
          {
            id: reservationId,
            vehicle_id: data.vehicleId,
            customer_id: data.customerId,
            deposit_amount: data.depositAmount,
            reserved_at: now,
            expires_at: data.expiresAt || null,
            notes: data.notes || null,
            status: 'active',
          },
        ]);
        await supabase.from('vehicles').update({ status: 'reserved', updated_at: now }).eq('id', data.vehicleId);
      } catch (err) {
        console.warn('Supabase reserveVehicle error:', err);
      }
    }

    vehicles[vIndex].status = 'reserved';
    vehicles[vIndex].updated_at = now;
    setLocalItem('vehicles', vehicles);

    const reservations = getLocalItem<VehicleReservation[]>('reservations', []);
    setLocalItem('reservations', [newReservation, ...reservations]);

    return newReservation;
  },

  async cancelReservation(vehicleId: string): Promise<boolean> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('vehicle_reservations')
          .update({ status: 'cancelled' })
          .eq('vehicle_id', vehicleId)
          .eq('status', 'active');

        await supabase
          .from('vehicles')
          .update({ status: 'available', updated_at: now })
          .eq('id', vehicleId);
      } catch (err) {
        console.warn('Supabase cancelReservation error:', err);
      }
    }

    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIndex = vehicles.findIndex((v) => v.id === vehicleId);
    if (vIndex !== -1) {
      vehicles[vIndex].status = 'available';
      vehicles[vIndex].updated_at = now;
      setLocalItem('vehicles', vehicles);
    }

    const reservations = getLocalItem<VehicleReservation[]>('reservations', []);
    const updated = reservations.map((r) =>
      r.vehicle_id === vehicleId && r.status === 'active'
        ? { ...r, status: 'cancelled' as const }
        : r
    );
    setLocalItem('reservations', updated);
    return true;
  },

  async addVehicleImage(vehicleId: string, storagePath: string, isPrimary = false): Promise<VehicleImage> {
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIndex = vehicles.findIndex((v) => v.id === vehicleId);
    if (vIndex === -1) throw new Error('السيارة غير موجودة');

    const existingImages = vehicles[vIndex].images || [];
    const shouldBePrimary = isPrimary || existingImages.length === 0;
    const now = new Date().toISOString();

    const newImg: VehicleImage = {
      id: crypto.randomUUID(),
      vehicle_id: vehicleId,
      storage_path: storagePath,
      is_primary: shouldBePrimary,
      created_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        if (shouldBePrimary) {
          await supabase.from('vehicle_images').update({ is_primary: false }).eq('vehicle_id', vehicleId);
        }
        await supabase.from('vehicle_images').insert([
          {
            id: newImg.id,
            vehicle_id: vehicleId,
            storage_path: storagePath,
            is_primary: shouldBePrimary,
            created_at: now,
          },
        ]);
      } catch (err) {
        console.warn('Supabase addVehicleImage error:', err);
      }
    }

    if (shouldBePrimary) {
      existingImages.forEach((img) => (img.is_primary = false));
    }

    vehicles[vIndex].images = [...existingImages, newImg];
    vehicles[vIndex].updated_at = now;
    setLocalItem('vehicles', vehicles);

    return newImg;
  },

  async removeVehicleImage(vehicleId: string, imageId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicle_images').delete().eq('id', imageId);
      } catch (err) {
        console.warn('Supabase removeVehicleImage error:', err);
      }
    }

    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIndex = vehicles.findIndex((v) => v.id === vehicleId);
    if (vIndex === -1) return false;

    let images = (vehicles[vIndex].images || []).filter((img) => img.id !== imageId);
    if (images.length > 0 && !images.some((img) => img.is_primary)) {
      images[0].is_primary = true;
      if (isSupabaseConfigured) {
        try {
          await supabase.from('vehicle_images').update({ is_primary: true }).eq('id', images[0].id);
        } catch (e) {
          console.warn('Supabase update primary image error:', e);
        }
      }
    }
    vehicles[vIndex].images = images;
    vehicles[vIndex].updated_at = new Date().toISOString();
    setLocalItem('vehicles', vehicles);
    return true;
  },

  async setPrimaryImage(vehicleId: string, imageId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicle_images').update({ is_primary: false }).eq('vehicle_id', vehicleId);
        await supabase.from('vehicle_images').update({ is_primary: true }).eq('id', imageId);
      } catch (err) {
        console.warn('Supabase setPrimaryImage error:', err);
      }
    }

    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIndex = vehicles.findIndex((v) => v.id === vehicleId);
    if (vIndex === -1) return false;

    (vehicles[vIndex].images || []).forEach((img) => {
      img.is_primary = img.id === imageId;
    });
    vehicles[vIndex].updated_at = new Date().toISOString();
    setLocalItem('vehicles', vehicles);
    return true;
  },

  // --------------------------------------------------
  // 3. إدارة العملاء (Customers)
  // --------------------------------------------------
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*, sales(*)')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Customer[];
      } catch (err) {
        console.warn('Supabase getCustomers fallback to local:', err);
      }
    }
    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);
    const sales = getLocalItem<Sale[]>('sales', DEFAULT_SALES);

    return customers.map((c) => {
      const cSales = sales.filter((s) => s.customer_id === c.id);
      return {
        ...c,
        purchases_count: cSales.length,
        total_spent: cSales.reduce((acc, curr) => acc + (curr.sale_price - curr.discount), 0),
      };
    });
  },

  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const newCustomer: Customer = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      purchases_count: 0,
      total_spent: 0,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('customers').insert([
          {
            id: newCustomer.id,
            full_name: newCustomer.full_name,
            phone: newCustomer.phone,
            secondary_phone: newCustomer.secondary_phone,
            address: newCustomer.address,
            identity_number: newCustomer.identity_number,
            notes: newCustomer.notes,
          },
        ]);
      } catch (err) {
        console.warn('Supabase createCustomer fallback:', err);
      }
    }

    const current = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);
    setLocalItem('customers', [newCustomer, ...current]);
    return newCustomer;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase.from('customers').update({ ...data, updated_at: now }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateCustomer error:', err);
      }
    }

    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);
    const idx = customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...data, updated_at: now };
      setLocalItem('customers', customers);
      return customers[idx];
    }
    throw new Error('العميل غير موجود');
  },

  async deleteCustomer(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('customers').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCustomer error:', err);
      }
    }

    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);
    setLocalItem('customers', customers.filter((c) => c.id !== id));
    return true;
  },

  // --------------------------------------------------
  // 4. إدارة الموردين (Suppliers)
  // --------------------------------------------------
  async getSuppliers(): Promise<Supplier[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Supplier[];
      } catch (err) {
        console.warn('Supabase getSuppliers fallback:', err);
      }
    }
    const suppliers = getLocalItem<Supplier[]>('suppliers', DEFAULT_SUPPLIERS);
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);

    return suppliers.map((s) => ({
      ...s,
      vehicles_count: vehicles.filter((v) => v.supplier_id === s.id).length,
    }));
  },

  async createSupplier(data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const newSupplier: Supplier = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vehicles_count: 0,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('suppliers').insert([
          {
            id: newSupplier.id,
            name: newSupplier.name,
            phone: newSupplier.phone,
            email: newSupplier.email,
            address: newSupplier.address,
            business_registration_number: newSupplier.business_registration_number,
            contact_person: newSupplier.contact_person,
            notes: newSupplier.notes,
          },
        ]);
      } catch (err) {
        console.warn('Supabase createSupplier fallback:', err);
      }
    }

    const current = getLocalItem<Supplier[]>('suppliers', DEFAULT_SUPPLIERS);
    setLocalItem('suppliers', [newSupplier, ...current]);
    return newSupplier;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase.from('suppliers').update({ ...data, updated_at: now }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateSupplier error:', err);
      }
    }

    const suppliers = getLocalItem<Supplier[]>('suppliers', DEFAULT_SUPPLIERS);
    const idx = suppliers.findIndex((s) => s.id === id);
    if (idx !== -1) {
      suppliers[idx] = { ...suppliers[idx], ...data, updated_at: now };
      setLocalItem('suppliers', suppliers);
      return suppliers[idx];
    }
    throw new Error('المورد غير موجود');
  },

  async deleteSupplier(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('suppliers').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSupplier error:', err);
      }
    }

    const suppliers = getLocalItem<Supplier[]>('suppliers', DEFAULT_SUPPLIERS);
    setLocalItem('suppliers', suppliers.filter((s) => s.id !== id));
    return true;
  },

  // --------------------------------------------------
  // 5. المبيعات والتسليم (Sales & Delivery)
  // --------------------------------------------------
  async getSales(): Promise<Sale[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*, vehicle:vehicles(*), customer:customers(*)')
          .order('sale_date', { ascending: false });
        if (!error && data) return data as Sale[];
      } catch (err) {
        console.warn('Supabase getSales fallback:', err);
      }
    }

    const sales = getLocalItem<Sale[]>('sales', DEFAULT_SALES);
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);

    return sales.map((sale) => ({
      ...sale,
      vehicle: vehicles.find((v) => v.id === sale.vehicle_id) || null,
      customer: customers.find((c) => c.id === sale.customer_id) || null,
    }));
  },

  async processSale(saleData: {
    vehicleId: string;
    customerId: string;
    salePrice: number;
    discount: number;
    paymentMethod: any;
    paymentStatus: any;
    notes?: string;
  }): Promise<Sale> {
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIndex = vehicles.findIndex((v) => v.id === saleData.vehicleId);

    if (vIndex === -1) throw new Error('السيارة غير موجودة');
    if (vehicles[vIndex].status === 'sold') {
      throw new Error('السيارة مباعة مسبقاً ولا يمكن تسجيل بيع جديد لها');
    }

    const newSaleId = crypto.randomUUID();
    const referenceNumber = generateReferenceNumber('INV');
    const now = new Date().toISOString();

    const newSale: Sale = {
      id: newSaleId,
      reference_number: referenceNumber,
      vehicle_id: saleData.vehicleId,
      customer_id: saleData.customerId,
      sale_date: new Date().toISOString().split('T')[0],
      sale_price: saleData.salePrice,
      discount: saleData.discount,
      payment_method: saleData.paymentMethod,
      payment_status: saleData.paymentStatus,
      notes: saleData.notes,
      created_at: now,
    };

    // تحديث حالة السيارة إلى sold
    vehicles[vIndex] = {
      ...vehicles[vIndex],
      status: 'sold',
      updated_at: now,
    };

    setLocalItem('vehicles', vehicles);

    const sales = getLocalItem<Sale[]>('sales', DEFAULT_SALES);
    setLocalItem('sales', [newSale, ...sales]);

    // إذا كان Supabase متصلاً نستدعي الدالة الآمنة process_vehicle_sale
    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('process_vehicle_sale', {
          p_vehicle_id: saleData.vehicleId,
          p_customer_id: saleData.customerId,
          p_sale_price: saleData.salePrice,
          p_discount: saleData.discount,
          p_payment_method: saleData.paymentMethod,
          p_payment_status: saleData.paymentStatus,
          p_notes: saleData.notes,
          p_created_by: null,
          p_reference_number: referenceNumber,
        });
      } catch (err) {
        console.warn('Supabase process_vehicle_sale error:', err);
      }
    }

    return newSale;
  },

  async deleteSale(saleId: string): Promise<boolean> {
    const sales = getLocalItem<Sale[]>('sales', DEFAULT_SALES);
    const targetSale = sales.find((s) => s.id === saleId);
    let vehicleId = targetSale?.vehicle_id;

    if (isSupabaseConfigured) {
      try {
        if (!vehicleId) {
          const { data: sData } = await supabase.from('sales').select('vehicle_id').eq('id', saleId).maybeSingle();
          if (sData) vehicleId = sData.vehicle_id;
        }

        const { error: delErr } = await supabase.from('sales').delete().eq('id', saleId);
        if (delErr) {
          console.error('Supabase deleteSale error:', delErr);
          throw new Error(delErr.message || 'تعذر حذف عملية البيع من قاعدة البيانات');
        }

        if (vehicleId) {
          await supabase
            .from('vehicles')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('id', vehicleId);
        }
      } catch (err: any) {
        console.warn('Supabase deleteSale catch:', err);
        throw err;
      }
    }

    setLocalItem('sales', sales.filter((s) => s.id !== saleId));
    if (vehicleId) {
      const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
      const vIdx = vehicles.findIndex((v) => v.id === vehicleId);
      if (vIdx !== -1) {
        vehicles[vIdx].status = 'available';
        vehicles[vIdx].updated_at = new Date().toISOString();
        setLocalItem('vehicles', vehicles);
      }
    }

    return true;
  },

  // --------------------------------------------------
  // 6. لوحة التحكم والمؤشرات (Dashboard Stats)
  // --------------------------------------------------
  async getDashboardStats(): Promise<DashboardStats> {
    const vehicles = await this.getVehicles();
    const sales = await this.getSales();
    const customers = await this.getCustomers();
    const suppliers = await this.getSuppliers();

    const availableVehicles = vehicles.filter((v) => v.status === 'available');
    const reservedVehicles = vehicles.filter((v) => v.status === 'reserved');
    const soldVehicles = vehicles.filter((v) => v.status === 'sold');

    const totalInventoryPurchaseValue = availableVehicles.reduce(
      (sum, v) => sum + (v.purchase_price || 0) + (v.extra_costs || 0),
      0
    );

    return {
      availableVehiclesCount: availableVehicles.length,
      reservedVehiclesCount: reservedVehicles.length,
      soldVehiclesCount: soldVehicles.length,
      customersCount: customers.length,
      suppliersCount: suppliers.length,
      totalInventoryPurchaseValue,
      recentSales: sales.slice(0, 5),
      recentVehicles: vehicles.slice(0, 5),
    };
  },

  // --------------------------------------------------
  // 7. إدارة عقود كراء السيارات (Car Rentals)
  // --------------------------------------------------
  async getRentals(): Promise<RentalContract[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rental_contracts')
          .select('*, vehicle:vehicles(*), customer:customers(*)')
          .order('created_at', { ascending: false });
        if (!error && data) return data as RentalContract[];
      } catch (err) {
        console.warn('Supabase getRentals fallback:', err);
      }
    }
    const rentals = getLocalItem<RentalContract[]>('rental_contracts', []);
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);

    return rentals.map((r) => ({
      ...r,
      vehicle: vehicles.find((v) => v.id === r.vehicle_id) || null,
      customer: customers.find((c) => c.id === r.customer_id) || null,
    }));
  },

  async getRentalById(id: string): Promise<RentalContract | null> {
    const all = await this.getRentals();
    return all.find((r) => r.id === id) || null;
  },

  async createRental(data: Omit<RentalContract, 'id' | 'contract_number' | 'created_at' | 'updated_at'>): Promise<RentalContract> {
    const id = crypto.randomUUID();
    const contractNumber = generateReferenceNumber('LOC');
    const now = new Date().toISOString();

    const newContract: RentalContract = {
      ...data,
      id,
      contract_number: contractNumber,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('rental_contracts').insert([newContract]);
      } catch (err) {
        console.warn('Supabase createRental fallback:', err);
      }
    }

    const current = getLocalItem<RentalContract[]>('rental_contracts', []);
    setLocalItem('rental_contracts', [newContract, ...current]);
    return newContract;
  },

  async updateRentalStatus(id: string, status: RentalStatus, endMileage?: number): Promise<boolean> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const payload: any = { status, updated_at: now };
        if (endMileage !== undefined) payload.end_mileage = endMileage;
        await supabase.from('rental_contracts').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateRentalStatus error:', err);
      }
    }

    const current = getLocalItem<RentalContract[]>('rental_contracts', []);
    const idx = current.findIndex((r) => r.id === id);
    if (idx !== -1) {
      current[idx].status = status;
      if (endMileage !== undefined) current[idx].end_mileage = endMileage;
      current[idx].updated_at = now;
      setLocalItem('rental_contracts', current);
      return true;
    }
    return false;
  },

  async deleteRental(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('rental_contracts').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteRental error:', err);
      }
    }
    const current = getLocalItem<RentalContract[]>('rental_contracts', []);
    setLocalItem('rental_contracts', current.filter((r) => r.id !== id));
    return true;
  },

  // --------------------------------------------------
  // 8. إدارة تبادل السيارات (Car Trade-Ins / Échange)
  // --------------------------------------------------
  async getTradeIns(): Promise<TradeIn[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('trade_ins')
          .select('*, showroom_vehicle:vehicles(*), customer:customers(*)')
          .order('created_at', { ascending: false });
        if (!error && data) return data as TradeIn[];
      } catch (err) {
        console.warn('Supabase getTradeIns fallback:', err);
      }
    }
    const tradeIns = getLocalItem<TradeIn[]>('trade_ins', []);
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);

    return tradeIns.map((t) => ({
      ...t,
      showroom_vehicle: vehicles.find((v) => v.id === t.showroom_vehicle_id) || null,
      customer: customers.find((c) => c.id === t.customer_id) || null,
    }));
  },

  async getTradeInById(id: string): Promise<TradeIn | null> {
    const all = await this.getTradeIns();
    return all.find((t) => t.id === id) || null;
  },

  async createTradeIn(data: Omit<TradeIn, 'id' | 'reference_number' | 'created_at'>): Promise<TradeIn> {
    const id = crypto.randomUUID();
    const referenceNumber = generateReferenceNumber('ECH');
    const now = new Date().toISOString();

    const newTradeIn: TradeIn = {
      ...data,
      id,
      reference_number: referenceNumber,
      created_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('trade_ins').insert([newTradeIn]);
        await supabase.from('vehicles').update({ status: 'sold', updated_at: now }).eq('id', data.showroom_vehicle_id);
      } catch (err) {
        console.warn('Supabase createTradeIn fallback:', err);
      }
    }

    const current = getLocalItem<TradeIn[]>('trade_ins', []);
    setLocalItem('trade_ins', [newTradeIn, ...current]);

    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIdx = vehicles.findIndex((v) => v.id === data.showroom_vehicle_id);
    if (vIdx !== -1) {
      vehicles[vIdx].status = 'sold';
      vehicles[vIdx].updated_at = now;
      setLocalItem('vehicles', vehicles);
    }

    return newTradeIn;
  },

  async deleteTradeIn(id: string): Promise<boolean> {
    const tradeIns = getLocalItem<TradeIn[]>('trade_ins', []);
    const target = tradeIns.find((t) => t.id === id);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('trade_ins').delete().eq('id', id);
        if (target) {
          await supabase.from('vehicles').update({ status: 'available', updated_at: new Date().toISOString() }).eq('id', target.showroom_vehicle_id);
        }
      } catch (err) {
        console.warn('Supabase deleteTradeIn error:', err);
      }
    }

    setLocalItem('trade_ins', tradeIns.filter((t) => t.id !== id));
    if (target) {
      const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
      const vIdx = vehicles.findIndex((v) => v.id === target.showroom_vehicle_id);
      if (vIdx !== -1) {
        vehicles[vIdx].status = 'available';
        vehicles[vIdx].updated_at = new Date().toISOString();
        setLocalItem('vehicles', vehicles);
      }
    }
    return true;
  },

  // --------------------------------------------------
  // 9. إدارة دفعات التقسيط وسندات القبض (Payments & Installments)
  // --------------------------------------------------
  async getPayments(saleId?: string): Promise<PaymentRecord[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from('payment_records')
          .select('*, sale:sales(*), customer:customers(*)')
          .order('payment_date', { ascending: false });
        if (saleId) q = q.eq('sale_id', saleId);
        const { data, error } = await q;
        if (!error && data) return data as PaymentRecord[];
      } catch (err) {
        console.warn('Supabase getPayments fallback:', err);
      }
    }

    let payments = getLocalItem<PaymentRecord[]>('payment_records', []);
    if (saleId) payments = payments.filter((p) => p.sale_id === saleId);
    const sales = getLocalItem<Sale[]>('sales', DEFAULT_SALES);
    const customers = getLocalItem<Customer[]>('customers', DEFAULT_CUSTOMERS);

    return payments.map((p) => ({
      ...p,
      sale: sales.find((s) => s.id === p.sale_id) || null,
      customer: customers.find((c) => c.id === p.customer_id) || null,
    }));
  },

  async createPayment(data: Omit<PaymentRecord, 'id' | 'receipt_number' | 'created_at'>): Promise<PaymentRecord> {
    const id = crypto.randomUUID();
    const receiptNumber = generateReferenceNumber('REC');
    const now = new Date().toISOString();

    const newPayment: PaymentRecord = {
      ...data,
      id,
      receipt_number: receiptNumber,
      created_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('payment_records').insert([newPayment]);
      } catch (err) {
        console.warn('Supabase createPayment fallback:', err);
      }
    }

    const current = getLocalItem<PaymentRecord[]>('payment_records', []);
    setLocalItem('payment_records', [newPayment, ...current]);
    return newPayment;
  },

  async deletePayment(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('payment_records').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deletePayment error:', err);
      }
    }
    const current = getLocalItem<PaymentRecord[]>('payment_records', []);
    setLocalItem('payment_records', current.filter((p) => p.id !== id));
    return true;
  },

  // --------------------------------------------------
  // 10. سجل مصاريف تجهيز وصيانة السيارات (Vehicle Expenses)
  // --------------------------------------------------
  async getVehicleExpenses(vehicleId?: string): Promise<VehicleExpense[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from('vehicle_expenses')
          .select('*, vehicle:vehicles(*)')
          .order('expense_date', { ascending: false });
        if (vehicleId) q = q.eq('vehicle_id', vehicleId);
        const { data, error } = await q;
        if (!error && data) return data as VehicleExpense[];
      } catch (err) {
        console.warn('Supabase getVehicleExpenses fallback:', err);
      }
    }

    let expenses = getLocalItem<VehicleExpense[]>('vehicle_expenses', []);
    if (vehicleId) expenses = expenses.filter((e) => e.vehicle_id === vehicleId);
    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);

    return expenses.map((e) => ({
      ...e,
      vehicle: vehicles.find((v) => v.id === e.vehicle_id) || null,
    }));
  },

  async createVehicleExpense(data: Omit<VehicleExpense, 'id' | 'created_at'>): Promise<VehicleExpense> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newExpense: VehicleExpense = {
      ...data,
      id,
      created_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicle_expenses').insert([newExpense]);
      } catch (err) {
        console.warn('Supabase createVehicleExpense fallback:', err);
      }
    }

    const current = getLocalItem<VehicleExpense[]>('vehicle_expenses', []);
    setLocalItem('vehicle_expenses', [newExpense, ...current]);

    const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
    const vIdx = vehicles.findIndex((v) => v.id === data.vehicle_id);
    if (vIdx !== -1) {
      vehicles[vIdx].extra_costs = (vehicles[vIdx].extra_costs || 0) + Number(data.amount);
      vehicles[vIdx].updated_at = now;
      setLocalItem('vehicles', vehicles);
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('vehicles')
            .update({ extra_costs: vehicles[vIdx].extra_costs, updated_at: now })
            .eq('id', data.vehicle_id);
        } catch (e) {
          console.warn('Supabase update extra_costs error:', e);
        }
      }
    }

    return newExpense;
  },

  async deleteVehicleExpense(id: string): Promise<boolean> {
    const current = getLocalItem<VehicleExpense[]>('vehicle_expenses', []);
    const target = current.find((e) => e.id === id);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicle_expenses').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteVehicleExpense error:', err);
      }
    }

    setLocalItem('vehicle_expenses', current.filter((e) => e.id !== id));

    if (target) {
      const vehicles = getLocalItem<Vehicle[]>('vehicles', DEFAULT_VEHICLES);
      const vIdx = vehicles.findIndex((v) => v.id === target.vehicle_id);
      if (vIdx !== -1) {
        vehicles[vIdx].extra_costs = Math.max(0, (vehicles[vIdx].extra_costs || 0) - Number(target.amount));
        vehicles[vIdx].updated_at = new Date().toISOString();
        setLocalItem('vehicles', vehicles);
      }
    }
    return true;
  },
};

