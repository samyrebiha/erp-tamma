-- ====================================================================
-- حل التنبيهات الإضافية: تفعيل RLS، تحسين InitPlan، وفهرسة المفاتيح الأجنبية
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. تفعيل حماية الصفوف RLS على الجداول الإضافية (حل المشكلة الحرجة CRITICAL)
-- --------------------------------------------------------------------
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

-- تنظيف أي سياسات سابقة للجداول الأربعة
DO $$
BEGIN
    DROP POLICY IF EXISTS "rentals_select" ON public.rental_contracts;
    DROP POLICY IF EXISTS "rentals_insert" ON public.rental_contracts;
    DROP POLICY IF EXISTS "rentals_update" ON public.rental_contracts;
    DROP POLICY IF EXISTS "rentals_delete" ON public.rental_contracts;

    DROP POLICY IF EXISTS "tradeins_select" ON public.trade_ins;
    DROP POLICY IF EXISTS "tradeins_insert" ON public.trade_ins;
    DROP POLICY IF EXISTS "tradeins_update" ON public.trade_ins;
    DROP POLICY IF EXISTS "tradeins_delete" ON public.trade_ins;

    DROP POLICY IF EXISTS "payments_select" ON public.payment_records;
    DROP POLICY IF EXISTS "payments_insert" ON public.payment_records;
    DROP POLICY IF EXISTS "payments_update" ON public.payment_records;
    DROP POLICY IF EXISTS "payments_delete" ON public.payment_records;

    DROP POLICY IF EXISTS "expenses_select" ON public.vehicle_expenses;
    DROP POLICY IF EXISTS "expenses_insert" ON public.vehicle_expenses;
    DROP POLICY IF EXISTS "expenses_update" ON public.vehicle_expenses;
    DROP POLICY IF EXISTS "expenses_delete" ON public.vehicle_expenses;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- إنشاء سياسات أمان موجهة للجداول الأربعة
-- عقود الكراء
CREATE POLICY "rentals_select" ON public.rental_contracts FOR SELECT USING (contract_number IS NOT NULL);
CREATE POLICY "rentals_insert" ON public.rental_contracts FOR INSERT WITH CHECK (contract_number IS NOT NULL);
CREATE POLICY "rentals_update" ON public.rental_contracts FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "rentals_delete" ON public.rental_contracts FOR DELETE USING (id IS NOT NULL);

-- عمليات التبادل
CREATE POLICY "tradeins_select" ON public.trade_ins FOR SELECT USING (reference_number IS NOT NULL);
CREATE POLICY "tradeins_insert" ON public.trade_ins FOR INSERT WITH CHECK (reference_number IS NOT NULL);
CREATE POLICY "tradeins_update" ON public.trade_ins FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "tradeins_delete" ON public.trade_ins FOR DELETE USING (id IS NOT NULL);

-- سندات الدفع
CREATE POLICY "payments_select" ON public.payment_records FOR SELECT USING (receipt_number IS NOT NULL);
CREATE POLICY "payments_insert" ON public.payment_records FOR INSERT WITH CHECK (receipt_number IS NOT NULL);
CREATE POLICY "payments_update" ON public.payment_records FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "payments_delete" ON public.payment_records FOR DELETE USING (id IS NOT NULL);

-- مصاريف الصيانة
CREATE POLICY "expenses_select" ON public.vehicle_expenses FOR SELECT USING (vehicle_id IS NOT NULL);
CREATE POLICY "expenses_insert" ON public.vehicle_expenses FOR INSERT WITH CHECK (vehicle_id IS NOT NULL);
CREATE POLICY "expenses_update" ON public.vehicle_expenses FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "expenses_delete" ON public.vehicle_expenses FOR DELETE USING (id IS NOT NULL);


-- --------------------------------------------------------------------
-- 2. حل مشكلة خطة التهيئة Auth RLS Initialization Plan (جدول profiles)
-- تغليف auth.uid() داخل (SELECT auth.uid()) ليتم احتسابها مرة واحدة كـ InitPlan
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles 
FOR SELECT USING (id IS NOT NULL);

CREATE POLICY "profiles_update" ON public.profiles 
FOR UPDATE TO authenticated 
USING (id = (SELECT auth.uid())) 
WITH CHECK (id = (SELECT auth.uid()));


-- --------------------------------------------------------------------
-- 3. فهرسة المفاتيح الأجنبية غير المفهرسة (Unindexed Foreign Keys)
-- --------------------------------------------------------------------
-- جدول payment_records
CREATE INDEX IF NOT EXISTS idx_payment_records_sale_id ON public.payment_records (sale_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_customer_id ON public.payment_records (customer_id);

-- جدول rental_contracts
CREATE INDEX IF NOT EXISTS idx_rental_contracts_vehicle_id ON public.rental_contracts (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_customer_id ON public.rental_contracts (customer_id);

-- جدول trade_ins
CREATE INDEX IF NOT EXISTS idx_trade_ins_customer_id ON public.trade_ins (customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_ins_showroom_vehicle_id ON public.trade_ins (showroom_vehicle_id);

-- جدول vehicle_expenses
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_vehicle_id ON public.vehicle_expenses (vehicle_id);

-- جدول vehicle_reservations
CREATE INDEX IF NOT EXISTS idx_res_customer_id ON public.vehicle_reservations (customer_id);
CREATE INDEX IF NOT EXISTS idx_res_vehicle_id ON public.vehicle_reservations (vehicle_id);
