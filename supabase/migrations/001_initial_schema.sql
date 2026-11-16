-- ====================================================================
-- الهجرة الأولى: المخطط الأساسي لنظام إدارة معرض السيارات (ERP Tamma)
-- العملة الافتراضية: د.ج (دينار جزائري)
-- ====================================================================

-- تفعيل ملحق التشفير وتوليد UUID إذا لم يكن مفعلاً
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. جدول الحسابات الشخصية والصلاحيات (profiles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 2. جدول العملاء (customers)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    secondary_phone TEXT,
    address TEXT,
    identity_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. جدول الموردين (suppliers)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    business_registration_number TEXT,
    contact_person TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 4. جدول السيارات (vehicles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    trim TEXT,
    manufacture_year INTEGER CHECK (manufacture_year >= 1900 AND manufacture_year <= 2100),
    color TEXT,
    fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric', 'lpg', 'other') OR fuel_type IS NULL),
    transmission TEXT CHECK (transmission IN ('manual', 'automatic') OR transmission IS NULL),
    mileage INTEGER CHECK (mileage >= 0),
    condition_notes TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'under_process')),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    purchase_date DATE,
    purchase_price NUMERIC(14,2) CHECK (purchase_price >= 0),
    extra_costs NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (extra_costs >= 0),
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 5. جدول الأرقام التعريفية للسيارات (vehicle_identifiers)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('vin', 'engine_number', 'registration_number', 'customs_number', 'other')),
    custom_type_name TEXT,
    identifier_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_custom_type_name CHECK (
        identifier_type <> 'other' OR (identifier_type = 'other' AND custom_type_name IS NOT NULL AND TRIM(custom_type_name) <> '')
    )
);

-- قيد لمنع تكرار رقم الهيكل (VIN) على أكثر من سيارة
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vin ON public.vehicle_identifiers (identifier_value) 
WHERE identifier_type = 'vin';

-- فهرس لتسريع البحث عن أي رقم تعريفي
CREATE INDEX IF NOT EXISTS idx_vehicle_identifiers_value ON public.vehicle_identifiers (identifier_value);
CREATE INDEX IF NOT EXISTS idx_vehicle_identifiers_vehicle_id ON public.vehicle_identifiers (vehicle_id);

-- ====================================================================
-- 6. جدول صور السيارات (vehicle_images)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images (vehicle_id);

-- ====================================================================
-- 7. جدول المبيعات وإخراج السيارات (sales)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number TEXT NOT NULL UNIQUE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sale_price NUMERIC(14,2) NOT NULL CHECK (sale_price >= 0),
    discount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'other') OR payment_method IS NULL),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sales_vehicle_id UNIQUE (vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales (customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales (sale_date);

-- ====================================================================
-- 8. جدول سجل النشاط والتدقيق (activity_logs)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- ====================================================================
-- 9. جدول إعدادات المعرض (showroom_settings)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.showroom_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'معرض السيارات',
    phone TEXT,
    email TEXT,
    address TEXT,
    commercial_register TEXT,
    tax_number TEXT,
    logo_url TEXT,
    currency TEXT NOT NULL DEFAULT 'د.ج',
    delivery_terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 10. إعداد الدوال والمشغلات التلقائية (Triggers)
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER trg_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_showroom_settings_updated_at ON public.showroom_settings;
CREATE TRIGGER trg_showroom_settings_updated_at
BEFORE UPDATE ON public.showroom_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 11. دالة تسجيل البيع الآمنة (process_vehicle_sale) لمنع التضارب والبيع المزدوج
-- ====================================================================
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
RETURNS UUID AS $$
DECLARE
    v_vehicle_status TEXT;
    v_sale_id UUID;
BEGIN
    -- قفل سجل السيارة للتحقق من حالتها ومنع أي عملية متزامنة
    SELECT status INTO v_vehicle_status
    FROM public.vehicles
    WHERE id = p_vehicle_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'السيارة غير موجودة في النظام';
    END IF;

    IF v_vehicle_status = 'sold' THEN
        RAISE EXCEPTION 'لا يمكن بيع السيارة لأنها مباعة ومخرجة مسبقاً';
    END IF;

    -- إدراج عملية البيع
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

    -- تحديث حالة السيارة إلى "مباعة/مخرجة"
    UPDATE public.vehicles
    SET status = 'sold',
        updated_at = NOW()
    WHERE id = p_vehicle_id;

    -- تسجيل النشاط
    INSERT INTO public.activity_logs (
        actor_id,
        entity_type,
        entity_id,
        action,
        summary,
        metadata
    ) VALUES (
        p_created_by,
        'vehicle',
        p_vehicle_id,
        'sale',
        'تم تسجيل بيع السيارة برقم مرجعي: ' || p_reference_number,
        jsonb_build_object(
            'sale_id', v_sale_id,
            'sale_price', p_sale_price,
            'customer_id', p_customer_id
        )
    );

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 12. تفعيل Row Level Security (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_settings ENABLE ROW LEVEL SECURITY;

-- سياسات عامة للمستخدمين المسجلين (المصادق عليهم)
CREATE POLICY "المستخدمون المصادق عليهم يمكنهم عرض الملفات الشخصية"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "المستخدمون يمكنهم تحديث ملفهم الشخصي"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- سياسات الجداول التشغيلية (العملاء والموردين والسيارات والمبيعات)
CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم للعملاء"
ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم للموردين"
ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم للسيارات"
ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم للمعرفات"
ON public.vehicle_identifiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم للصور"
ON public.vehicle_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم للمبيعات"
ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم لسجل النشاط"
ON public.activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "الوصول الكامل للمستخدمين المصادق عليهم لإعدادات المعرض"
ON public.showroom_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

