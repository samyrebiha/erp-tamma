-- ====================================================================
-- بيانات تجريبية أولية لنظام إدارة معرض السيارات (ERP Tamma)
-- العملة: د.ج (دينار جزائري)
-- ====================================================================

-- 1. إعدادات المعرض
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
    'معرض حسونة لبيع وشراء السيارات',
    '0550123456 / 0661789012',
    'contact@hassouna-auto.dz',
    'الجزائر العاصمة - الدار البيضاء، طريق المعارض الدولي رقم 44',
    '16/00-9874561B21',
    '002116098745612',
    'د.ج',
    'تم تسليم المركبة المبيّنة تفاصيلها أعلاه للمشتري بعد المعاينة الشاملة والفحص الفني وقبولها بحالتها الراهنة، مع تسليم كامل وثائقها ومفاتيحها الأصلية.'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    commercial_register = EXCLUDED.commercial_register,
    tax_number = EXCLUDED.tax_number,
    delivery_terms = EXCLUDED.delivery_terms;

-- 2. موردون تجريبيون
INSERT INTO public.suppliers (id, name, phone, email, address, business_registration_number, contact_person, notes)
VALUES
('11111111-1111-1111-1111-111111111101', 'شركة النورس لاستيراد المركبات', '0560987654', 'nourass.auto@gmail.com', 'البليدة - المنطقة الصناعية بن بولعيد', '09/00-7654321A19', 'السيد كريم بن عيسى', 'مورد رئيسي لسيارات تويوتا وهيونداي جديدة'),
('11111111-1111-1111-1111-111111111102', 'مؤسسة الوفاق لتجارة السيارات', '0661234567', 'contact@elouifak.dz', 'وهران - حي مرافال', '31/00-9876543B20', 'السيد طارق مزيان', 'مورد سيارات مستعملة نظيفة بحالة ممتازة')
ON CONFLICT (id) DO NOTHING;

-- 3. عملاء تجريبيون
INSERT INTO public.customers (id, full_name, phone, secondary_phone, address, identity_number, notes)
VALUES
('22222222-2222-2222-2222-222222222201', 'عبد الرحمن بن علي', '0770112233', '0555443322', 'الجزائر العاصمة - بئر خادم', '109823471012345', 'عميل دائم، مهتم بالسيارات العائلية SUV'),
('22222222-2222-2222-2222-222222222202', 'يوسف قاسم', '0666778899', NULL, 'بومرداس - وسط المدينة', '118765432098765', 'دفع نقدي فوري')
ON CONFLICT (id) DO NOTHING;

-- 4. سيارات تجريبية
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
    'تويوتا هايلوكس دبل كابين فل كامل محرك 2.8 لتر ديزل'
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

-- 5. الأرقام التعريفية للسيارات
INSERT INTO public.vehicle_identifiers (vehicle_id, identifier_type, custom_type_name, identifier_value)
VALUES
('33333333-3333-3333-3333-333333333301', 'vin', NULL, 'MROBA3CD400123456'),
('33333333-3333-3333-3333-333333333301', 'engine_number', NULL, '1GD-FTV-894321'),
('33333333-3333-3333-3333-333333333301', 'registration_number', NULL, '01234-123-16'),
('33333333-3333-3333-3333-333333333301', 'customs_number', NULL, 'DZ-ALG-2023-9944'),

('33333333-3333-3333-3333-333333333302', 'vin', NULL, 'KMHD881CNEU654321'),
('33333333-3333-3333-3333-333333333302', 'engine_number', NULL, 'G4FP-120987'),
('33333333-3333-3333-3333-333333333302', 'registration_number', NULL, '05678-122-16'),

('33333333-3333-3333-3333-333333333303', 'vin', NULL, 'WVWZZZCDZMW789012'),
('33333333-3333-3333-3333-333333333303', 'engine_number', NULL, 'DSRB-445566'),
('33333333-3333-3333-3333-333333333303', 'registration_number', NULL, '09812-121-09')
ON CONFLICT DO NOTHING;

-- 6. عملية بيع تجريبية للسيارة الثالثة
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
    'تم تسليم السيارة مع وثائق التحويل وكافة المفاتيح'
) ON CONFLICT (id) DO NOTHING;

