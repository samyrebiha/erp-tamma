-- ====================================================================
-- الإعداد الكامل لقاعدة بيانات Supabase (SQL Editor All-in-One)
-- النظام: نظام إدارة معرض حسونة أوتو (ERP Tamma)
-- المقر: أميه ونسة – الوادي، طريق تقرت | الهاتف: 0662309669
-- الخدمات: بيع، شراء، كراء (تأجير)، وتبادل السيارات الجديدة والمستعملة
-- العملة الرسمية: د.ج (دينار جزائري - DZD)
-- ====================================================================

-- 1. تفعيل الملحقات الضرورية
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. جدول الحسابات الشخصية والملفات (profiles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. جدول العملاء والزبائن (customers)
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
-- 4. جدول الموردين وشركات الاستيراد (suppliers)
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
-- 5. جدول أسطول ومخزون السيارات (vehicles)
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
-- 6. جدول الأرقام التعريفية للسيارات (vehicle_identifiers)
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

-- قيد فريد لمنع تكرار رقم الهيكل (VIN) نهائياً على سيارتين مختلفتين
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vin ON public.vehicle_identifiers (identifier_value) 
WHERE identifier_type = 'vin';

CREATE INDEX IF NOT EXISTS idx_vehicle_identifiers_val ON public.vehicle_identifiers (identifier_value);
CREATE INDEX IF NOT EXISTS idx_vehicle_identifiers_vid ON public.vehicle_identifiers (vehicle_id);

-- ====================================================================
-- 7. جدول صور السيارات ومرفقات الفحص (vehicle_images)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vid ON public.vehicle_images (vehicle_id);

-- ====================================================================
-- 8. جدول حجوزات السيارات بالعربون (vehicle_reservations)
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

CREATE INDEX IF NOT EXISTS idx_res_vehicle_id ON public.vehicle_reservations (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_res_customer_id ON public.vehicle_reservations (customer_id);

-- ====================================================================
-- 9. جدول المبيعات وإخراج السيارات (sales)
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
-- 10. جدول سجل النشاط والتدقيق (activity_logs)
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

-- ====================================================================
-- 11. جدول إعدادات المعرض وبيانات الوثائق (showroom_settings)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.showroom_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'معرض حسونة أوتو',
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
-- 12. الدوال التلقائية لتحديث updated_at
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
-- 13. دالة البيع الآمنة لمنع التضارب والبيع المكرر للسيارة
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
    -- قفل السجل لمنع أي عملية متزامنة
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

    -- تحديث حالة السيارة إلى "مباعة"
    UPDATE public.vehicles
    SET status = 'sold',
        updated_at = NOW()
    WHERE id = p_vehicle_id;

    -- تحديث حالة أي حجز نشط سابق إلى مكتمل (converted)
    UPDATE public.vehicle_reservations
    SET status = 'converted'
    WHERE vehicle_id = p_vehicle_id AND status = 'active';

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 14. تفعيل سياسات الحماية Row Level Security (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_settings ENABLE ROW LEVEL SECURITY;

-- السماح بالوصول الكامل للمستخدمين المصادق عليهم وعبر المفتاح العام (anon)
CREATE POLICY "RLS_profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_customers_all" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_suppliers_all" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_vehicles_all" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_identifiers_all" ON public.vehicle_identifiers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_images_all" ON public.vehicle_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_reservations_all" ON public.vehicle_reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_sales_all" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_logs_all" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS_settings_all" ON public.showroom_settings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 15. البيانات الأولية لمعرض حسونة أوتو (Seed Data)
-- ====================================================================

-- إعدادات المعرض الرسمية
INSERT INTO public.showroom_settings (
    id,
    name,
    phone,
    email,
    address,
    commercial_register,
    tax_number,
    currency,
    delivery_terms
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'معرض حسونة أوتو',
    '0662309669',
    'contact@hassouna-auto.dz',
    'أميه ونسة – الوادي، طريق تقرت',
    '39/00-9874561B21',
    '002139098745612',
    'د.ج',
    'خدماتنا: بيع، شراء، كراء (تأجير)، وتبادل السيارات الجديدة والمستعملة. تسلم المركبة ومفاتيحها بعد المعاينة والفحص الفني وقبولها بحالتها الراهنة.'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    delivery_terms = EXCLUDED.delivery_terms;

-- موردون تجريبيون
INSERT INTO public.suppliers (id, name, phone, email, address, business_registration_number, contact_person, notes)
VALUES
('11111111-1111-1111-1111-111111111101', 'مؤسسة النورس لاستيراد المركبات', '0560987654', 'nourass.auto@gmail.com', 'البليدة - المنطقة الصناعية بن بولعيد', '09/00-7654321A19', 'السيد كريم بن عيسى', 'مورد رئيسي لسيارات تويوتا وهيونداي جديدة'),
('11111111-1111-1111-1111-111111111102', 'مؤسسة الوفاق لتجارة وتوريد السيارات', '0661234567', 'contact@elouifak.dz', 'وهران - حي مرافال', '31/00-9876543B20', 'السيد طارق مزيان', 'مورد سيارات مستعملة نظيفة بحالة ممتازة')
ON CONFLICT (id) DO NOTHING;

-- عملاء وزبائن أوليون
INSERT INTO public.customers (id, full_name, phone, secondary_phone, address, identity_number, notes)
VALUES
('22222222-2222-2222-2222-222222222201', 'عبد الرحمن بن علي', '0770112233', '0555443322', 'الوادي - حي 19 مارس', '109823471012345', 'مهتم بسيارات تويوتا دفع رباعي 4x4'),
('22222222-2222-2222-2222-222222222202', 'يوسف قاسم', '0666778899', NULL, 'أميه ونسة - وسط المدينة', '118765432098765', 'دفع نقدي فوري')
ON CONFLICT (id) DO NOTHING;

-- سيارات أولية في المخزون
INSERT INTO public.vehicles (
    id, brand, model, trim, manufacture_year, color, fuel_type, transmission, 
    mileage, condition_notes, status, supplier_id, purchase_date, purchase_price, extra_costs, description
) VALUES
(
    '33333333-3333-3333-3333-333333333301',
    'Toyota',
    'Hilux',
    'Adventure 4x4 Double Cabine',
    2023,
    'رمادي معدني',
    'diesel',
    'automatic',
    12500,
    'حالة ممتازة كالجديدة، خالية من أي صدمات أو دهان',
    'available',
    '11111111-1111-1111-1111-111111111101',
    '2024-01-15',
    7800000.00,
    150000.00,
    'تويوتا هايلوكس دبل كابين فل كامل محرك 2.8 لتر ديزل - فحص سليم 100%'
),
(
    '33333333-3333-3333-3333-333333333302',
    'Hyundai',
    'Tucson',
    'N-Line 1.6 T-GDI',
    2022,
    'أبيض لؤلؤي',
    'petrol',
    'automatic',
    34000,
    'صيانة دورية منتظمة بالوكالة، طلاء أصلي بالكامل',
    'available',
    '11111111-1111-1111-1111-111111111101',
    '2024-02-01',
    5900000.00,
    80000.00,
    'هيونداي توسان فئة إن لاين سقف بانوراما دفع رباعي'
),
(
    '33333333-3333-3333-3333-333333333303',
    'Volkswagen',
    'Golf 8',
    'R-Line 2.0 TDI',
    2021,
    'أزرق غامق',
    'diesel',
    'automatic',
    52000,
    'حالة جيدة جداً، فحص شامل سليم',
    'sold',
    '11111111-1111-1111-1111-111111111102',
    '2023-11-10',
    5400000.00,
    120000.00,
    'فولكس واجن جولف 8 آر لاين محرك ديزل 150 حصان'
)
ON CONFLICT (id) DO NOTHING;

-- الأرقام التعريفية للسيارات
INSERT INTO public.vehicle_identifiers (vehicle_id, identifier_type, custom_type_name, identifier_value)
VALUES
('33333333-3333-3333-3333-333333333301', 'vin', NULL, 'MROBA3CD400123456'),
('33333333-3333-3333-3333-333333333301', 'engine_number', NULL, '1GD-FTV-894321'),
('33333333-3333-3333-3333-333333333301', 'registration_number', NULL, '01234-123-39'),
('33333333-3333-3333-3333-333333333301', 'customs_number', NULL, 'DZ-OUED-2023-9944'),

('33333333-3333-3333-3333-333333333302', 'vin', NULL, 'KMHD881CNEU654321'),
('33333333-3333-3333-3333-333333333302', 'engine_number', NULL, 'G4FP-120987'),
('33333333-3333-3333-3333-333333333302', 'registration_number', NULL, '05678-122-39'),

('33333333-3333-3333-3333-333333333303', 'vin', NULL, 'WVWZZZCDZMW789012'),
('33333333-3333-3333-3333-333333333303', 'engine_number', NULL, 'DSRB-445566'),
('33333333-3333-3333-3333-333333333303', 'registration_number', NULL, '09812-121-39')
ON CONFLICT DO NOTHING;

-- عملية بيع أولية
INSERT INTO public.sales (
    id, reference_number, vehicle_id, customer_id, sale_date, sale_price, discount, payment_method, payment_status, notes
) VALUES (
    '44444444-4444-4444-4444-444444444401',
    'INV-2024-0001',
    '33333333-3333-3333-3333-333333333303',
    '22222222-2222-2222-2222-222222222201',
    '2024-02-10',
    5850000.00,
    50000.00,
    'bank_transfer',
    'paid',
    'تم تسليم السيارة مع وثائق التحويل وكافة المفاتيح الأصلية'
) ON CONFLICT (id) DO NOTHING;

