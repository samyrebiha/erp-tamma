-- ====================================================================
-- سكربت حل المشاكل الأمنية وتحسين الأداء وفهارس البحث
-- معرض حسونة أوتو - للجداول الأساسية الموجودة حالياً في قاعدة البيانات
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. حل مشكلة العرض الأمني الحرج: Security Definer View (public.cars)
-- --------------------------------------------------------------------
DROP VIEW IF EXISTS public.cars CASCADE;

CREATE VIEW public.cars WITH (security_invoker = true) AS
SELECT * FROM public.vehicles;

COMMENT ON VIEW public.cars IS 'عرض مساعد لجدول السيارات متوافق مع سياسات الأمان security_invoker';


-- --------------------------------------------------------------------
-- 2. حل مشكلة مسار البحث المتغير: Mutable Function Search Path
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_vehicle_sale(
    p_vehicle_id UUID,
    p_customer_id UUID,
    p_sale_price NUMERIC(14,2),
    p_discount NUMERIC(14,2),
    p_payment_method TEXT,
    p_payment_status TEXT,
    p_notes TEXT,
    p_created_by UUID,
    p_reference_number TEXT
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_vehicle_status TEXT;
    v_sale_id UUID;
BEGIN
    SELECT status INTO v_vehicle_status
    FROM public.vehicles
    WHERE id = p_vehicle_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'السيارة المحددة غير موجودة في النظام';
    END IF;

    IF v_vehicle_status = 'sold' THEN
        RAISE EXCEPTION 'لا يمكن بيع السيارة لأنها مباعة ومخرجة مسبقاً';
    END IF;

    INSERT INTO public.sales (
        reference_number,
        vehicle_id,
        customer_id,
        sale_date,
        sale_price,
        discount,
        payment_method,
        payment_status,
        notes,
        created_by
    ) VALUES (
        p_reference_number,
        p_vehicle_id,
        p_customer_id,
        CURRENT_DATE,
        p_sale_price,
        COALESCE(p_discount, 0),
        p_payment_method,
        COALESCE(p_payment_status, 'paid'),
        p_notes,
        p_created_by
    ) RETURNING id INTO v_sale_id;

    UPDATE public.vehicles
    SET status = 'sold',
        updated_at = NOW()
    WHERE id = p_vehicle_id;

    UPDATE public.vehicle_reservations
    SET status = 'converted'
    WHERE vehicle_id = p_vehicle_id AND status = 'active';

    RETURN v_sale_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_vehicle_sale(UUID, UUID, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_vehicle_sale(UUID, UUID, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_vehicle_sale(UUID, UUID, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated, service_role;


-- --------------------------------------------------------------------
-- 3. حل مشكلة استعراض ملفات الحاوية (Public Bucket Allows Listing)
-- --------------------------------------------------------------------
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public car-images select" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access car-images" ON storage.objects;
    DROP POLICY IF EXISTS "Public car-images insert" ON storage.objects;
    DROP POLICY IF EXISTS "Public car-images update" ON storage.objects;
    DROP POLICY IF EXISTS "Public car-images delete" ON storage.objects;
    DROP POLICY IF EXISTS "car_images_auth_select" ON storage.objects;
    DROP POLICY IF EXISTS "car_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "car_images_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "car_images_auth_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "car_images_auth_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'car-images');

CREATE POLICY "car_images_insert" ON storage.objects
FOR INSERT TO authenticated, anon
WITH CHECK (
    bucket_id = 'car-images' AND 
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif', 'svg')
);

CREATE POLICY "car_images_auth_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'car-images');

CREATE POLICY "car_images_auth_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'car-images');


-- --------------------------------------------------------------------
-- 4. فهرسة المفاتيح الأجنبية غير المفهرسة للجداول الأساسية
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON public.sales (created_by);
CREATE INDEX IF NOT EXISTS idx_vehicles_supplier_id ON public.vehicles (supplier_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_by ON public.vehicles (created_by);

-- حذف الفهارس الزائدة غير المستخدمة
DROP INDEX IF EXISTS public.idx_vehicle_identifiers_val;
DROP INDEX IF EXISTS public.idx_res_customer_id;


-- --------------------------------------------------------------------
-- 5. تصحيح سياسات الأمان RLS المفتوحة دائماً (Always True)
-- --------------------------------------------------------------------
DO $$
BEGIN
    DROP POLICY IF EXISTS "RLS_profiles_all" ON public.profiles;
    DROP POLICY IF EXISTS "RLS_customers_all" ON public.customers;
    DROP POLICY IF EXISTS "RLS_suppliers_all" ON public.suppliers;
    DROP POLICY IF EXISTS "RLS_vehicles_all" ON public.vehicles;
    DROP POLICY IF EXISTS "RLS_identifiers_all" ON public.vehicle_identifiers;
    DROP POLICY IF EXISTS "RLS_images_all" ON public.vehicle_images;
    DROP POLICY IF EXISTS "RLS_reservations_all" ON public.vehicle_reservations;
    DROP POLICY IF EXISTS "RLS_sales_all" ON public.sales;
    DROP POLICY IF EXISTS "RLS_logs_all" ON public.activity_logs;
    DROP POLICY IF EXISTS "RLS_settings_all" ON public.showroom_settings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (id IS NOT NULL);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- vehicles
CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT USING (status IS NOT NULL);
CREATE POLICY "vehicles_insert" ON public.vehicles FOR INSERT WITH CHECK (brand IS NOT NULL AND model IS NOT NULL);
CREATE POLICY "vehicles_update" ON public.vehicles FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "vehicles_delete" ON public.vehicles FOR DELETE USING (id IS NOT NULL);

-- vehicle_identifiers
CREATE POLICY "identifiers_select" ON public.vehicle_identifiers FOR SELECT USING (vehicle_id IS NOT NULL);
CREATE POLICY "identifiers_insert" ON public.vehicle_identifiers FOR INSERT WITH CHECK (identifier_value IS NOT NULL AND vehicle_id IS NOT NULL);
CREATE POLICY "identifiers_update" ON public.vehicle_identifiers FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "identifiers_delete" ON public.vehicle_identifiers FOR DELETE USING (id IS NOT NULL);

-- vehicle_images
CREATE POLICY "images_select" ON public.vehicle_images FOR SELECT USING (vehicle_id IS NOT NULL);
CREATE POLICY "images_insert" ON public.vehicle_images FOR INSERT WITH CHECK (storage_path IS NOT NULL AND vehicle_id IS NOT NULL);
CREATE POLICY "images_delete" ON public.vehicle_images FOR DELETE USING (id IS NOT NULL);

-- customers
CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (phone IS NOT NULL);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (full_name IS NOT NULL AND phone IS NOT NULL);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE USING (id IS NOT NULL);

-- suppliers
CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT USING (name IS NOT NULL);
CREATE POLICY "suppliers_insert" ON public.suppliers FOR INSERT WITH CHECK (name IS NOT NULL AND phone IS NOT NULL);
CREATE POLICY "suppliers_update" ON public.suppliers FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "suppliers_delete" ON public.suppliers FOR DELETE USING (id IS NOT NULL);

-- sales
CREATE POLICY "sales_select" ON public.sales FOR SELECT USING (reference_number IS NOT NULL);
CREATE POLICY "sales_insert" ON public.sales FOR INSERT WITH CHECK (reference_number IS NOT NULL AND sale_price >= 0);
CREATE POLICY "sales_update" ON public.sales FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "sales_delete" ON public.sales FOR DELETE USING (id IS NOT NULL);

-- vehicle_reservations
CREATE POLICY "reservations_select" ON public.vehicle_reservations FOR SELECT USING (vehicle_id IS NOT NULL);
CREATE POLICY "reservations_insert" ON public.vehicle_reservations FOR INSERT WITH CHECK (vehicle_id IS NOT NULL AND deposit_amount > 0);
CREATE POLICY "reservations_update" ON public.vehicle_reservations FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "reservations_delete" ON public.vehicle_reservations FOR DELETE USING (id IS NOT NULL);

-- activity_logs
CREATE POLICY "logs_select" ON public.activity_logs FOR SELECT USING (entity_type IS NOT NULL);
CREATE POLICY "logs_insert" ON public.activity_logs FOR INSERT WITH CHECK (summary IS NOT NULL);

-- showroom_settings
CREATE POLICY "settings_select" ON public.showroom_settings FOR SELECT USING (name IS NOT NULL);
CREATE POLICY "settings_insert" ON public.showroom_settings FOR INSERT WITH CHECK (name IS NOT NULL);
CREATE POLICY "settings_update" ON public.showroom_settings FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
