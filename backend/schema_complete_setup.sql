-- ==============================================================================
-- PRANA MEDICAL ECOSYSTEM - COMPLETE MASTER DATABASE SCHEMA & INITIAL SEED DATA
-- ==============================================================================
-- INSTRUCTIONS FOR USER:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/xpwkgsiaavpzwjnflghe
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New Query" (or paste into the editor)
-- 4. Paste this entire file and click "Run" (green button)
-- This creates all required tables, sets permissive RLS policies, and inserts seed data.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'medical_services',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. HOSPITALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT NOT NULL,
    hospital_code TEXT UNIQUE,
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
    rating NUMERIC DEFAULT 4.8,
    total_reviews INTEGER DEFAULT 0,
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '20:00:00',
    is_open BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. HOSPITAL DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    department_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. DOCTORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    department_id TEXT,
    name TEXT NOT NULL,
    doctor_name TEXT,
    title TEXT,
    specialty TEXT,
    specialization TEXT,
    department TEXT,
    experience_years INTEGER DEFAULT 5,
    experience INTEGER DEFAULT 5,
    qualification TEXT,
    languages JSONB DEFAULT '["English"]'::jsonb,
    schedule TEXT,
    schedule_details JSONB,
    consultation_fee NUMERIC DEFAULT 150,
    rating NUMERIC DEFAULT 4.8,
    review_count INTEGER DEFAULT 50,
    available_today BOOLEAN DEFAULT true,
    photo_url TEXT,
    profile_image TEXT,
    about TEXT,
    email TEXT,
    phone TEXT,
    is_available BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. DOCTOR AVAILABILITY TABLE
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. PATIENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender TEXT,
    date_of_birth DATE,
    blood_group TEXT,
    address TEXT,
    emergency_contact TEXT,
    allergies TEXT,
    medical_history TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    patient_id TEXT,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    reason TEXT,
    symptoms TEXT,
    status TEXT DEFAULT 'Confirmed',
    token_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. PRESCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    appointment_id TEXT REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    patient_id TEXT,
    diagnosis TEXT,
    medicines JSONB,
    dosage_instructions TEXT,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    report_type TEXT,
    file_url TEXT NOT NULL,
    test_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. HOSPITAL REVIEWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. DIAGNOSTIC CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL,
    category_image TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. DIAGNOSTIC TESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.diagnostic_categories(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    original_price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    report_time TEXT DEFAULT '24 Hours',
    fasting_required BOOLEAN DEFAULT false,
    home_collection BOOLEAN DEFAULT true,
    preparation TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. DIAGNOSTIC PACKAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.diagnostic_categories(id) ON DELETE SET NULL,
    package_name TEXT NOT NULL,
    description TEXT,
    package_image TEXT,
    original_price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    report_time TEXT DEFAULT '24 Hours',
    home_collection BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. PACKAGE TESTS JUNCTION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.diagnostic_packages(id) ON DELETE CASCADE,
    test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. PACKAGE BOOKINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    package_id UUID REFERENCES public.diagnostic_packages(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    booking_reference TEXT UNIQUE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT,
    patient_email TEXT,
    booking_date DATE DEFAULT CURRENT_DATE,
    appointment_date TEXT,
    appointment_time TEXT,
    preferred_time TEXT,
    collection_type TEXT DEFAULT 'home_collection',
    booking_status TEXT DEFAULT 'confirmed',
    payment_status TEXT DEFAULT 'paid',
    status TEXT DEFAULT 'Confirmed',
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure package_bookings columns exist if created in previous runs
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS appointment_date TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS appointment_time TEXT;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'confirmed';
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.package_bookings ADD COLUMN IF NOT EXISTS collection_type TEXT DEFAULT 'home_collection';

-- ------------------------------------------------------------------------------
-- 16. INSURANCE PROVIDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL,
    provider_logo TEXT,
    description TEXT,
    support_email TEXT,
    support_phone TEXT,
    website TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. INSURANCE PLANS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.insurance_providers(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    coverage_amount NUMERIC NOT NULL,
    description TEXT,
    eligibility TEXT,
    waiting_period TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 18. HOSPITAL INSURANCE TABLE (CASHLESS NETWORK)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.insurance_providers(id) ON DELETE CASCADE,
    cashless_available BOOLEAN DEFAULT true,
    pre_authorization_required BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 19. INSURANCE CLAIMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    patient_name TEXT NOT NULL,
    provider_id UUID REFERENCES public.insurance_providers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    claim_type TEXT NOT NULL DEFAULT 'Cashless',
    claim_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Submitted',
    description TEXT,
    claim_number TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 20. INSURANCE DOCUMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 21. INSURANCE FAQS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 22. HERO SLIDER IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slider_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & SET PERMISSIVE PUBLIC POLICIES
-- ==============================================================================
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'departments', 'hospitals', 'hospital_departments', 'doctors',
            'doctor_availability', 'patients', 'appointments', 'prescriptions',
            'reports', 'hospital_reviews', 'diagnostic_categories', 'diagnostic_tests',
            'diagnostic_packages', 'package_tests', 'package_bookings',
            'insurance_providers', 'insurance_plans', 'hospital_insurance',
            'insurance_claims', 'insurance_documents', 'insurance_faqs',
            'hero_slider_images'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'public_all_access_' || t, t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'public_all_access_' || t, t);
    END LOOP;
END $$;

-- ==============================================================================
-- SEED INITIAL CORE DATA
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO public.departments (id, name, description, icon) VALUES
('dept-1', 'Cardiology', 'Comprehensive cardiovascular diagnostics, angioplasty, and heart care.', 'favorite'),
('dept-2', 'Neurology', 'Precision neurology, brain mapping, stroke management, and cognitive care.', 'psychology'),
('dept-3', 'Pediatrics', 'Compassionate child wellness, neonatal intensive care, and development.', 'child_care'),
('dept-4', 'Orthopedics', 'Joint reconstruction, trauma surgery, and sports rehabilitation.', 'accessibility_new'),
('dept-5', 'General Medicine', 'Primary medical guidance, metabolic management, and prevention.', 'medication'),
('dept-6', 'Gynecology', 'Maternal care, reproductive wellness, and advanced gynecology.', 'female'),
('dept-7', 'Dermatology', 'Advanced skincare, allergy testing, and therapeutic dermatology.', 'health_and_safety'),
('dept-8', 'Oncology', 'Multidisciplinary cancer care, targeted immunotherapy, and surgery.', 'medication'),
('dept-9', 'Gastroenterology', 'Digestive tract therapeutics, advanced endoscopy, and liver wellness.', 'medical_services')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- 2. HOSPITALS
INSERT INTO public.hospitals (id, hospital_name, hospital_code, city, state, rating, total_reviews, is_open, address, phone, banner_url) VALUES
('11111111-1111-4111-a111-111111111111', 'Prana Central Medical Center', 'PCMC-01', 'Hyderabad', 'Telangana', 4.9, 320, true, 'Road No. 1, Banjara Hills, Hyderabad', '+91 40 1234 5678', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200'),
('22222222-2222-4222-a222-222222222222', 'Prana Metro Super Specialty', 'PMSS-02', 'Bangalore', 'Karnataka', 4.8, 240, true, 'Koramangala 4th Block, Bangalore', '+91 80 8765 4321', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200'),
('33333333-3333-4333-a333-333333333333', 'Prana Life Sciences Hospital', 'PLSH-03', 'Chennai', 'Tamil Nadu', 4.7, 185, true, 'Anna Nagar, Chennai', '+91 44 2468 1357', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200')
ON CONFLICT (id) DO NOTHING;

-- 3. DOCTORS
INSERT INTO public.doctors (
    id, name, doctor_name, title, specialty, specialization, department, experience_years, 
    languages, schedule, schedule_details, rating, review_count, available_today, photo_url, consultation_fee, about
) VALUES
(
    'doc-1', 'Dr. Alaric Thorne', 'Dr. Alaric Thorne', 'MD, FACC - Senior Cardiologist', 'Cardiology', 'Cardiology', 'Cardiology', 15,
    '["English", "Spanish"]'::jsonb, 'Mon - Fri: 09:00 - 14:00',
    '{"days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "09:00", "end": "14:00"}'::jsonb,
    4.8, 156, true,
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop',
    150, 'Academic physician specializing in non-invasive imaging, cardiac rhythm management, and cardiovascular risk containment.'
),
(
    'doc-2', 'Dr. Sarah Jenkins', 'Dr. Sarah Jenkins', 'PhD - Neurology Specialist', 'Neurology', 'Neurology', 'Neurology', 12,
    '["English", "Portuguese"]'::jsonb, 'Tue - Sat: 10:00 - 16:00',
    '{"days": ["Tue", "Wed", "Thu", "Fri", "Sat"], "start": "10:00", "end": "16:00"}'::jsonb,
    4.9, 203, true,
    'https://images.unsplash.com/photo-1594824813593-1b913673752e?q=80&w=400&h=400&auto=format&fit=crop',
    140, 'Focuses on translational neurosciences, neuromuscular pathology, and comprehensive electroencephalography diagnostics.'
),
(
    'doc-3', 'Dr. Robert Vance', 'Dr. Robert Vance', 'MD - Orthopedic Surgeon', 'Orthopedics', 'Orthopedics', 'Orthopedics', 18,
    '["English", "German"]'::jsonb, 'Mon - Wed: 08:00 - 12:00',
    '{"days": ["Mon", "Tue", "Wed"], "start": "08:00", "end": "12:00"}'::jsonb,
    4.7, 142, true,
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&h=400&auto=format&fit=crop',
    160, 'Specializes in arthroscopic reconstructive surgery, total joint revisions, and advanced bone preservation protocols.'
),
(
    'doc-4', 'Dr. Julian Sterling', 'Dr. Julian Sterling', 'MD, FACC - Senior Cardiologist', 'Cardiology', 'Cardiology', 'Cardiology', 20,
    '["English", "Spanish"]'::jsonb, 'Mon - Fri: 09:00 - 16:00',
    '{"days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "09:00", "end": "16:00"}'::jsonb,
    4.8, 187, true,
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&h=400&auto=format&fit=crop',
    180, 'Renowned clinical board member specializing in microvascular bypass surgery and chronic cardiac failure therapy.'
)
ON CONFLICT (id) DO NOTHING;

-- 4. DIAGNOSTIC CATEGORIES & PACKAGES
INSERT INTO public.diagnostic_categories (id, category_name, description) VALUES
('aaaaaaaa-1111-4111-a111-111111111111', 'Executive Health', 'Full-body wellness checks and preventative assessments'),
('bbbbbbbb-2222-4222-a222-222222222222', 'Heart & Cardiology', 'Cardiovascular evaluation, ECG, and lipid analysis'),
('cccccccc-3333-4333-a333-333333333333', 'Women Health', 'Comprehensive screenings tailored for maternal and hormonal health')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.diagnostic_packages (id, package_name, description, original_price, discount_price, report_time, home_collection) VALUES
('d1111111-1111-4111-a111-111111111111', 'Master Comprehensive Health Checkup', '85 Essential bio-markers including CBC, Lipid Profile, Liver Panel, Kidney Function, HbA1c, and Vitamin D.', 4500, 2499, '24 Hours', true),
('d2222222-2222-4222-a222-222222222222', 'Advanced Cardiac Wellness Panel', 'Targeted cardiovascular screening including ECG, Lipid Fractionation, hs-CRP, Homocysteine, and Troponin.', 3800, 1999, '12 Hours', true),
('d3333333-3333-4333-a333-333333333333', 'Complete Women Vitality Screening', 'Hormonal panel, Thyroid Profile, Bone Density, Iron Studies, Pap Smear, and Calcium analysis.', 3200, 1799, '24 Hours', true)
ON CONFLICT (id) DO NOTHING;

-- 5. INSURANCE PROVIDERS
INSERT INTO public.insurance_providers (id, provider_name, description, support_email, support_phone) VALUES
('a1111111-1111-4111-a111-111111111111', 'Star Health Allied Insurance', 'Comprehensive cashless hospitalization across 14,000+ network hospitals.', 'support@starhealth.in', '1800 425 2255'),
('a2222222-2222-4222-a222-222222222222', 'Care Health Insurance', 'Advanced critical illness cover with instant cashless pre-authorization.', 'claims@careinsurance.com', '1800 102 4488'),
('a3333333-3333-4333-a333-333333333333', 'HDFC ERGO General Insurance', 'Fast-track digital settlement with 100% paperless claim processing.', 'help@hdfcergo.com', '1800 2666')
ON CONFLICT (id) DO NOTHING;

-- 6. HERO SLIDER IMAGES
INSERT INTO public.hero_slider_images (id, title, image_url, display_order, is_active) VALUES
('e1111111-1111-4111-a111-111111111111', 'State-of-the-Art Hospital Plaza', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1600&auto=format&fit=crop', 1, true),
('e2222222-2222-4222-a222-222222222222', 'Modern Multi-Specialty Campus', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop', 2, true),
('e3333333-3333-4333-a333-333333333333', 'Specialist Care Network', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop', 3, true)
ON CONFLICT (id) DO NOTHING;

-- Complete!
