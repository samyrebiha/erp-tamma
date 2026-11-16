// ====================================================================
// أنواع البيانات لنظام إدارة معرض السيارات (ERP Tamma)
// ====================================================================

export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'under_process';

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg' | 'other';

export type TransmissionType = 'manual' | 'automatic';

export type IdentifierType = 'vin' | 'engine_number' | 'registration_number' | 'customs_number' | 'other';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'other';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type UserRole = 'admin' | 'staff';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  secondary_phone?: string | null;
  address?: string | null;
  identity_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Computed / Relations
  purchases_count?: number;
  total_spent?: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  business_registration_number?: string | null;
  contact_person?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Computed / Relations
  vehicles_count?: number;
}

export interface VehicleIdentifier {
  id: string;
  vehicle_id: string;
  identifier_type: IdentifierType;
  custom_type_name?: string | null;
  identifier_value: string;
  created_at: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  is_primary: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  trim?: string | null;
  manufacture_year?: number | null;
  color?: string | null;
  fuel_type?: FuelType | null;
  transmission?: TransmissionType | null;
  mileage?: number | null;
  condition_notes?: string | null;
  status: VehicleStatus;
  supplier_id?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  extra_costs: number;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;

  // Joined Relations
  supplier?: Supplier | null;
  identifiers?: VehicleIdentifier[];
  images?: VehicleImage[];
  sale?: Sale | null;
}

export interface Sale {
  id: string;
  reference_number: string;
  vehicle_id: string;
  customer_id: string;
  sale_date: string;
  sale_price: number;
  discount: number;
  payment_method?: PaymentMethod | null;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;

  // Joined Relations
  vehicle?: Vehicle | null;
  customer?: Customer | null;
  creator?: Profile | null;
}

export interface ActivityLog {
  id: string;
  actor_id?: string | null;
  entity_type: string;
  entity_id?: string | null;
  action: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile | null;
}

export interface ShowroomSettings {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  commercial_register?: string | null;
  tax_number?: string | null;
  logo_url?: string | null;
  currency: string;
  delivery_terms?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  availableVehiclesCount: number;
  soldVehiclesCount: number;
  customersCount: number;
  suppliersCount: number;
  totalInventoryPurchaseValue: number;
  recentSales: Sale[];
  recentVehicles: Vehicle[];
}
