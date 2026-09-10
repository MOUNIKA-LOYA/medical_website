-- =========================================================
-- INSURANCE MODULE - DATABASE FIRST SCHEMA & RLS POLICIES
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. INSURANCE PROVIDERS TABLE
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 2. INSURANCE PLANS TABLE
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 3. HOSPITAL INSURANCE JUNCTION TABLE (CASHLESS NETWORK)
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 4. INSURANCE CLAIMS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    patient_name TEXT,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.insurance_providers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE SET NULL,
    claim_number TEXT UNIQUE,
    claim_amount NUMERIC NOT NULL DEFAULT 0,
    approved_amount NUMERIC DEFAULT 0,
    claim_status TEXT DEFAULT 'submitted',
    status TEXT DEFAULT 'Submitted',
    claim_type TEXT DEFAULT 'Cashless',
    description TEXT,
    remarks TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if insurance_claims was created previously
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS hospital_id UUID;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS provider_id UUID;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS plan_id UUID;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_number TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_amount NUMERIC DEFAULT 0;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS approved_amount NUMERIC DEFAULT 0;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'submitted';
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Submitted';
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_type TEXT DEFAULT 'Cashless';
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------
-- 5. INSURANCE DOCUMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
    document_name TEXT,
    document_type TEXT NOT NULL,
    document_url TEXT,
    file_name TEXT,
    file_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if insurance_documents was created previously
ALTER TABLE public.insurance_documents ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.insurance_documents ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.insurance_documents ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.insurance_documents ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.insurance_documents ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.insurance_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- =========================================================
-- INDEXES FOR PERFORMANCE & FAST QUERYING
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_insurance_providers_status ON public.insurance_providers(status);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_provider ON public.insurance_plans(provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_type ON public.insurance_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_hospital_insurance_hosp ON public.hospital_insurance(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_insurance_prov ON public.hospital_insurance(provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user ON public.insurance_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_number ON public.insurance_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_insurance_documents_claim ON public.insurance_documents(claim_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_documents ENABLE ROW LEVEL SECURITY;

-- 1. INSURANCE PROVIDERS RLS POLICIES
DROP POLICY IF EXISTS "Public insurance_providers read policy" ON public.insurance_providers;
CREATE POLICY "Public insurance_providers read policy" ON public.insurance_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full insurance_providers access" ON public.insurance_providers;
CREATE POLICY "Admin full insurance_providers access" ON public.insurance_providers FOR ALL USING (true) WITH CHECK (true);

-- 2. INSURANCE PLANS RLS POLICIES
DROP POLICY IF EXISTS "Public insurance_plans read policy" ON public.insurance_plans;
CREATE POLICY "Public insurance_plans read policy" ON public.insurance_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full insurance_plans access" ON public.insurance_plans;
CREATE POLICY "Admin full insurance_plans access" ON public.insurance_plans FOR ALL USING (true) WITH CHECK (true);

-- 3. HOSPITAL INSURANCE RLS POLICIES
DROP POLICY IF EXISTS "Public hospital_insurance read policy" ON public.hospital_insurance;
CREATE POLICY "Public hospital_insurance read policy" ON public.hospital_insurance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full hospital_insurance access" ON public.hospital_insurance;
CREATE POLICY "Admin full hospital_insurance access" ON public.hospital_insurance FOR ALL USING (true) WITH CHECK (true);

-- 4. INSURANCE CLAIMS RLS POLICIES
DROP POLICY IF EXISTS "Public insurance_claims read policy" ON public.insurance_claims;
CREATE POLICY "Public insurance_claims read policy" ON public.insurance_claims FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insurance_claims insert policy" ON public.insurance_claims;
CREATE POLICY "Public insurance_claims insert policy" ON public.insurance_claims FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full insurance_claims access" ON public.insurance_claims;
CREATE POLICY "Admin full insurance_claims access" ON public.insurance_claims FOR ALL USING (true) WITH CHECK (true);

-- 5. INSURANCE DOCUMENTS RLS POLICIES
DROP POLICY IF EXISTS "Public insurance_documents read policy" ON public.insurance_documents;
CREATE POLICY "Public insurance_documents read policy" ON public.insurance_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insurance_documents insert policy" ON public.insurance_documents;
CREATE POLICY "Public insurance_documents insert policy" ON public.insurance_documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full insurance_documents access" ON public.insurance_documents;
CREATE POLICY "Admin full insurance_documents access" ON public.insurance_documents FOR ALL USING (true) WITH CHECK (true);
