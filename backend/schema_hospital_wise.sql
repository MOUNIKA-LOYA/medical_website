-- =========================================================
-- HOSPITAL WISE MODULE - DATABASE FIRST SCHEMA & RLS POLICIES
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. HOSPITALS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT NOT NULL,
    hospital_code TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    rating NUMERIC DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '20:00:00',
    is_open BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. HOSPITAL DEPARTMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    department_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. DOCTORS TABLE (Upgrade existing or create)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.hospital_departments(id) ON DELETE SET NULL,
    doctor_name TEXT,
    qualification TEXT,
    specialization TEXT,
    experience INTEGER DEFAULT 0,
    languages JSONB DEFAULT '["English"]'::jsonb,
    consultation_fee NUMERIC DEFAULT 500,
    profile_image TEXT,
    about TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure doctor backward compatibility columns exist if doctors table already existed
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.hospital_departments(id) ON DELETE SET NULL;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS doctor_name TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC DEFAULT 500;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ---------------------------------------------------------
-- 4. DOCTOR AVAILABILITY TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_patients INTEGER DEFAULT 20,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. DIAGNOSTIC TESTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    original_price NUMERIC NOT NULL,
    discount_price NUMERIC,
    report_time TEXT DEFAULT '24 Hours',
    fasting_required BOOLEAN DEFAULT false,
    home_collection BOOLEAN DEFAULT true,
    preparation TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 6. DIAGNOSTIC PACKAGES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    description TEXT,
    package_image TEXT,
    original_price NUMERIC NOT NULL,
    discount_price NUMERIC,
    report_time TEXT DEFAULT '24 Hours',
    home_collection BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 7. PACKAGE TESTS JUNCTION TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.diagnostic_packages(id) ON DELETE CASCADE,
    test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 8. HOSPITAL REVIEWS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id TEXT,
    user_name TEXT DEFAULT 'Anonymous Patient',
    patient_name TEXT DEFAULT 'Anonymous Patient',
    rating NUMERIC DEFAULT 5.0,
    review TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if hospital_reviews was created previously
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Anonymous Patient';
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS patient_name TEXT DEFAULT 'Anonymous Patient';
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS review TEXT;
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.hospital_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------
-- 9. HOSPITAL IMAGES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'gallery',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if hospital_images was created previously
ALTER TABLE public.hospital_images ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.hospital_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.hospital_images ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'gallery';
ALTER TABLE public.hospital_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.hospital_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- =========================================================
-- INDEXES FOR PERFORMANCE & FAST FILTERING
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON public.hospitals(status);
CREATE INDEX IF NOT EXISTS idx_hospitals_rating ON public.hospitals(rating);
CREATE INDEX IF NOT EXISTS idx_hospital_departments_hospital ON public.hospital_departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON public.doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_department ON public.doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON public.doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_hospital ON public.diagnostic_tests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_packages_hospital ON public.diagnostic_packages(hospital_id);
CREATE INDEX IF NOT EXISTS idx_package_tests_package ON public.package_tests(package_id);
CREATE INDEX IF NOT EXISTS idx_hospital_reviews_hospital ON public.hospital_reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_images_hospital ON public.hospital_images(hospital_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_images ENABLE ROW LEVEL SECURITY;

-- 1. HOSPITALS RLS POLICIES
DROP POLICY IF EXISTS "Public hospitals read policy" ON public.hospitals;
CREATE POLICY "Public hospitals read policy" ON public.hospitals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full hospitals access" ON public.hospitals;
CREATE POLICY "Admin full hospitals access" ON public.hospitals FOR ALL USING (true) WITH CHECK (true);

-- 2. HOSPITAL DEPARTMENTS RLS POLICIES
DROP POLICY IF EXISTS "Public hospital_departments read policy" ON public.hospital_departments;
CREATE POLICY "Public hospital_departments read policy" ON public.hospital_departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full hospital_departments access" ON public.hospital_departments;
CREATE POLICY "Admin full hospital_departments access" ON public.hospital_departments FOR ALL USING (true) WITH CHECK (true);

-- 3. DOCTORS RLS POLICIES
DROP POLICY IF EXISTS "Public doctors read policy" ON public.doctors;
CREATE POLICY "Public doctors read policy" ON public.doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full doctors access" ON public.doctors;
CREATE POLICY "Admin full doctors access" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

-- 4. DOCTOR AVAILABILITY RLS POLICIES
DROP POLICY IF EXISTS "Public doctor_availability read policy" ON public.doctor_availability;
CREATE POLICY "Public doctor_availability read policy" ON public.doctor_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full doctor_availability access" ON public.doctor_availability;
CREATE POLICY "Admin full doctor_availability access" ON public.doctor_availability FOR ALL USING (true) WITH CHECK (true);

-- 5. DIAGNOSTIC TESTS RLS POLICIES
DROP POLICY IF EXISTS "Public diagnostic_tests read policy" ON public.diagnostic_tests;
CREATE POLICY "Public diagnostic_tests read policy" ON public.diagnostic_tests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full diagnostic_tests access" ON public.diagnostic_tests;
CREATE POLICY "Admin full diagnostic_tests access" ON public.diagnostic_tests FOR ALL USING (true) WITH CHECK (true);

-- 6. DIAGNOSTIC PACKAGES RLS POLICIES
DROP POLICY IF EXISTS "Public diagnostic_packages read policy" ON public.diagnostic_packages;
CREATE POLICY "Public diagnostic_packages read policy" ON public.diagnostic_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full diagnostic_packages access" ON public.diagnostic_packages;
CREATE POLICY "Admin full diagnostic_packages access" ON public.diagnostic_packages FOR ALL USING (true) WITH CHECK (true);

-- 7. PACKAGE TESTS RLS POLICIES
DROP POLICY IF EXISTS "Public package_tests read policy" ON public.package_tests;
CREATE POLICY "Public package_tests read policy" ON public.package_tests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full package_tests access" ON public.package_tests;
CREATE POLICY "Admin full package_tests access" ON public.package_tests FOR ALL USING (true) WITH CHECK (true);

-- 8. HOSPITAL REVIEWS RLS POLICIES
DROP POLICY IF EXISTS "Public hospital_reviews read policy" ON public.hospital_reviews;
CREATE POLICY "Public hospital_reviews read policy" ON public.hospital_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public hospital_reviews insert policy" ON public.hospital_reviews;
CREATE POLICY "Public hospital_reviews insert policy" ON public.hospital_reviews FOR INSERT WITH CHECK (true);

-- 9. HOSPITAL IMAGES RLS POLICIES
DROP POLICY IF EXISTS "Public hospital_images read policy" ON public.hospital_images;
CREATE POLICY "Public hospital_images read policy" ON public.hospital_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full hospital_images access" ON public.hospital_images;
CREATE POLICY "Admin full hospital_images access" ON public.hospital_images FOR ALL USING (true) WITH CHECK (true);
