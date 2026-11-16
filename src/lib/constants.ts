import { VehicleStatus, FuelType, TransmissionType, IdentifierType, PaymentMethod, PaymentStatus } from '../types';

export const APP_CURRENCY = 'د.ج';

export const VEHICLE_STATUS_CONFIG: Record<
  VehicleStatus,
  {
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  available: {
    label: 'متاحة في المخزون',
    textColor: '#15803D',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  reserved: {
    label: 'محجوزة',
    textColor: '#B45309',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  sold: {
    label: 'مباعة / مخرجة',
    textColor: '#475569',
    bgColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  under_process: {
    label: 'قيد الإجراء',
    textColor: '#1D4ED8',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  petrol: 'بنزين (Essence)',
  diesel: 'ديزل / مازوت (Diesel)',
  hybrid: 'هجين (Hybride)',
  electric: 'كهرباء (Électrique)',
  lpg: 'غاز مسال (GPL)',
  other: 'نوع آخر',
};

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  manual: 'يدوي (Manuel)',
  automatic: 'أوتوماتيك (Automatique)',
};

export const IDENTIFIER_TYPE_LABELS: Record<IdentifierType, string> = {
  vin: 'رقم الهيكل (VIN / Chassis)',
  engine_number: 'رقم المحرك (Moteur)',
  registration_number: 'رقم التسجيل / اللوحة (Matricule)',
  customs_number: 'الرقم الجمركي (Dédouanement)',
  other: 'رقم تعريفي آخر',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'نقداً (Espèces)',
  bank_transfer: 'تحويل بنكي (Virement)',
  cheque: 'شيك بنكي (Chèque)',
  other: 'طريقة أخرى',
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    textColor: string;
    bgColor: string;
  }
> = {
  paid: {
    label: 'مدفوع بالكامل',
    textColor: '#15803D',
    bgColor: '#F0FDF4',
  },
  partial: {
    label: 'مدفوع جزئياً',
    textColor: '#B45309',
    bgColor: '#FFFBEB',
  },
  unpaid: {
    label: 'غير مدفوع',
    textColor: '#B91C1C',
    bgColor: '#FEF2F2',
  },
};

