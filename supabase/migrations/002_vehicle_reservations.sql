-- ====================================================================
-- الهجرة الثانية: جدول حجوزات السيارات بالعربون لنظام معرض حسونة
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.vehicle_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    deposit_amount NUMERIC(14,2) NOT NULL CHECK (deposit_amount > 0),
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id ON public.vehicle_reservations (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON public.vehicle_reservations (customer_id);

ALTER TABLE public.vehicle_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الوصول الكامل للحجوزات للمستخدمين المصادق عليهم"
ON public.vehicle_reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
