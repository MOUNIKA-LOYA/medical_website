-- =========================================================
-- DIAGNOSTIC PACKAGES MODULE - DATABASE FIRST SCHEMA & RLS POLICIES
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. DIAGNOSTIC CATEGORIES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL,
    category_image TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. LABORATORY TESTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.laboratory_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.diagnostic_categories(id) ON DELETE SET NULL,
    hospital_id UUID,
    test_name TEXT NOT NULL,
    test_code TEXT,
    description TEXT,
    preparation TEXT,
    fasting_required BOOLEAN DEFAULT false,
    sample_type TEXT DEFAULT 'Blood',
    report_time TEXT DEFAULT '24 Hours',
    original_price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    home_collection BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if laboratory_tests table was created previously
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.diagnostic_categories(id) ON DELETE SET NULL;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS test_name TEXT;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS test_code TEXT;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS preparation TEXT;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS fasting_required BOOLEAN DEFAULT false;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS sample_type TEXT DEFAULT 'Blood';
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS report_time TEXT DEFAULT '24 Hours';
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS discount_price NUMERIC;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS home_collection BOOLEAN DEFAULT true;
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.laboratory_tests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------
-- 3. DIAGNOSTIC PACKAGES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.diagnostic_categories(id) ON DELETE SET NULL,
    hospital_id UUID,
    package_name TEXT NOT NULL,
    package_code TEXT,
    package_image TEXT,
    description TEXT,
    original_price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    report_time TEXT DEFAULT '24 Hours',
    home_collection BOOLEAN DEFAULT true,
    recommended_for TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if diagnostic_packages table was created previously in existing database
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.diagnostic_categories(id) ON DELETE SET NULL;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS package_name TEXT;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS package_code TEXT;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS package_image TEXT;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS discount_price NUMERIC;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS report_time TEXT DEFAULT '24 Hours';
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS home_collection BOOLEAN DEFAULT true;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS recommended_for TEXT;
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.diagnostic_packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------
-- 4. PACKAGE TESTS JUNCTION TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID,
    test_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.package_tests ADD COLUMN IF NOT EXISTS package_id UUID;
ALTER TABLE public.package_tests ADD COLUMN IF NOT EXISTS test_id UUID;
ALTER TABLE public.package_tests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------
-- 5. PACKAGE BOOKINGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    patient_name TEXT DEFAULT 'Percy Boyina',
    hospital_id UUID,
    package_id UUID,
    booking_reference TEXT UNIQUE,
    appointment_date TEXT,
    appointment_time TEXT,
    booking_status TEXT DEFAULT 'confirmed',
    payment_status TEXT DEFAULT 'paid',
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if package_bookings table was created previously
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS package_id UUID;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS appointment_date TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS appointment_time TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'confirmed';
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS patient_email TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS collection_type TEXT DEFAULT 'home_collection';
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Confirmed';
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------
-- 6. SAMPLE COLLECTION SLOTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sample_collection_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID,
    slot_date TEXT NOT NULL,
    start_time TIME DEFAULT '07:00:00',
    end_time TIME DEFAULT '12:00:00',
    max_bookings INTEGER DEFAULT 10,
    available_slots INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if sample_collection_slots was created previously
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS slot_date TEXT;
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '07:00:00';
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '12:00:00';
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS max_bookings INTEGER DEFAULT 10;
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 10;
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.sample_collection_slots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =========================================================
-- INDEXES FOR PERFORMANCE & FAST QUERYING
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_diagnostic_categories_status ON public.diagnostic_categories(status);
CREATE INDEX IF NOT EXISTS idx_laboratory_tests_cat ON public.laboratory_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_laboratory_tests_hosp ON public.laboratory_tests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_packages_cat ON public.diagnostic_packages(category_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_packages_hosp ON public.diagnostic_packages(hospital_id);
CREATE INDEX IF NOT EXISTS idx_package_tests_pkg ON public.package_tests(package_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_ref ON public.package_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_package_bookings_user ON public.package_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_sample_collection_slots_hosp ON public.sample_collection_slots(hospital_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE public.diagnostic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_collection_slots ENABLE ROW LEVEL SECURITY;

-- 1. DIAGNOSTIC CATEGORIES RLS POLICIES
DROP POLICY IF EXISTS "Public diagnostic_categories read policy" ON public.diagnostic_categories;
CREATE POLICY "Public diagnostic_categories read policy" ON public.diagnostic_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full diagnostic_categories access" ON public.diagnostic_categories;
CREATE POLICY "Admin full diagnostic_categories access" ON public.diagnostic_categories FOR ALL USING (true) WITH CHECK (true);

-- 2. LABORATORY TESTS RLS POLICIES
DROP POLICY IF EXISTS "Public laboratory_tests read policy" ON public.laboratory_tests;
CREATE POLICY "Public laboratory_tests read policy" ON public.laboratory_tests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full laboratory_tests access" ON public.laboratory_tests;
CREATE POLICY "Admin full laboratory_tests access" ON public.laboratory_tests FOR ALL USING (true) WITH CHECK (true);

-- 3. DIAGNOSTIC PACKAGES RLS POLICIES
DROP POLICY IF EXISTS "Public diagnostic_packages read policy" ON public.diagnostic_packages;
CREATE POLICY "Public diagnostic_packages read policy" ON public.diagnostic_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full diagnostic_packages access" ON public.diagnostic_packages;
CREATE POLICY "Admin full diagnostic_packages access" ON public.diagnostic_packages FOR ALL USING (true) WITH CHECK (true);

-- 4. PACKAGE TESTS RLS POLICIES
DROP POLICY IF EXISTS "Public package_tests read policy" ON public.package_tests;
CREATE POLICY "Public package_tests read policy" ON public.package_tests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full package_tests access" ON public.package_tests;
CREATE POLICY "Admin full package_tests access" ON public.package_tests FOR ALL USING (true) WITH CHECK (true);

-- 5. PACKAGE BOOKINGS RLS POLICIES
DROP POLICY IF EXISTS "Public package_bookings read policy" ON public.package_bookings;
CREATE POLICY "Public package_bookings read policy" ON public.package_bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public package_bookings insert policy" ON public.package_bookings;
CREATE POLICY "Public package_bookings insert policy" ON public.package_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full package_bookings access" ON public.package_bookings;
CREATE POLICY "Admin full package_bookings access" ON public.package_bookings FOR ALL USING (true) WITH CHECK (true);

-- 6. SAMPLE COLLECTION SLOTS RLS POLICIES
DROP POLICY IF EXISTS "Public sample_collection_slots read policy" ON public.sample_collection_slots;
CREATE POLICY "Public sample_collection_slots read policy" ON public.sample_collection_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full sample_collection_slots access" ON public.sample_collection_slots;
CREATE POLICY "Admin full sample_collection_slots access" ON public.sample_collection_slots FOR ALL USING (true) WITH CHECK (true);
