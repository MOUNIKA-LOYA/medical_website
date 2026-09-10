"""
Seed script for Diagnostic Packages Module - Populates 14 recommended categories,
laboratory tests, packages, package-test junction records, collection slots, and demo bookings.
"""
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

supabase_url = (
    os.environ.get('SUPABASE_URL')
    or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    or os.environ.get('REACT_APP_SUPABASE_URL', 'https://xpwkgsiaavpzwjnflghe.supabase.co')
)
supabase_key = (
    os.environ.get('SUPABASE_KEY')
    or os.environ.get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
    or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    or os.environ.get('REACT_APP_SUPABASE_ANON_KEY', 'sb_publishable_UT4qq3-iFC2KQatcMPKzpQ_rD-P1rmh')
)

try:
    if create_client and supabase_url and supabase_key:
        supabase_client: Client = create_client(supabase_url, supabase_key)
    else:
        supabase_client = None
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    supabase_client = None

# Deterministic UUIDs for categories
CAT_IDS = {
    "full_body": "b1111111-1111-4111-b111-111111111111",
    "diabetes": "b2222222-2222-4222-b222-222222222222",
    "cardiac": "b3333333-3333-4333-b333-333333333333",
    "women": "b4444444-4444-4444-b444-444444444444",
    "men": "b5555555-5555-4555-b555-555555555555",
    "senior": "b6666666-6666-4666-b666-666666666666",
    "thyroid": "b7777777-7777-4777-b777-777777777777",
    "liver": "b8888888-8888-4888-b888-888888888888",
    "kidney": "b9999999-9999-4999-b999-999999999999",
    "vitamin": "ba111111-1111-4111-ba11-111111111111",
    "fever": "ba222222-2222-4222-ba22-222222222222",
    "pregnancy": "ba333333-3333-4333-ba33-333333333333",
    "allergy": "ba444444-4444-4444-ba44-444444444444",
    "cancer": "ba555555-5555-4555-ba55-555555555555"
}

HOSPITAL_IDS = {
    "main": "11111111-1111-4111-a111-111111111111",
    "eastside": "22222222-2222-4222-a222-222222222222",
    "metro": "33333333-3333-4333-a333-333333333333",
    "northland": "44444444-4444-4444-a444-444444444444"
}

SEED_DIAGNOSTIC_DATA = {
    "diagnostic_categories": [
        {"id": CAT_IDS["full_body"], "category_name": "Full Body Wellness Profile", "category_image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&h=400&auto=format&fit=crop", "description": "Complete wellness evaluation covering major organs, blood parameters, and metabolic screening.", "status": "active"},
        {"id": CAT_IDS["diabetes"], "category_name": "Diabetes Assessment & Organ Shield", "category_image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=400&h=400&auto=format&fit=crop", "description": "HbA1c, fasting glucose, insulin resistance, and diabetic kidney risk markers.", "status": "active"},
        {"id": CAT_IDS["cardiac"], "category_name": "Cardiac Risk & Lipid Panel", "category_image": "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=400&h=400&auto=format&fit=crop", "description": "Lipid markers, hs-CRP, cardiac enzymes, and cardiovascular risk evaluation.", "status": "active"},
        {"id": CAT_IDS["women"], "category_name": "Women's Health & Hormonal Profile", "category_image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400&h=400&auto=format&fit=crop", "description": "Hormonal balances, bone density, anemia markers, and cervical & breast health screening.", "status": "active"},
        {"id": CAT_IDS["men"], "category_name": "Men's Health & Vitality Screening", "category_image": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=400&h=400&auto=format&fit=crop", "description": "Prostate screening (PSA), testosterone, cardiovascular risk, and vitality assessment.", "status": "active"},
        {"id": CAT_IDS["senior"], "category_name": "Senior Citizen Vital Care Panel", "category_image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&h=400&auto=format&fit=crop", "description": "Tailored geriatric screening including joint health, renal function, and memory markers.", "status": "active"},
        {"id": CAT_IDS["thyroid"], "category_name": "Thyroid Profile", "category_image": "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=400&h=400&auto=format&fit=crop", "description": "Complete T3, T4, TSH, and thyroid antibody assessment for metabolic balance.", "status": "active"},
        {"id": CAT_IDS["liver"], "category_name": "Liver Function Test", "category_image": "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=400&h=400&auto=format&fit=crop", "description": "Bilirubin, SGOT, SGPT, alkaline phosphatase, and total proteins for liver health.", "status": "active"},
        {"id": CAT_IDS["kidney"], "category_name": "Kidney Function Test", "category_image": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=400&h=400&auto=format&fit=crop", "description": "Serum creatinine, blood urea nitrogen, uric acid, and electrolyte panel.", "status": "active"},
        {"id": CAT_IDS["vitamin"], "category_name": "Vitamin Profile", "category_image": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&h=400&auto=format&fit=crop", "description": "Vitamin D3 (25-hydroxy), Vitamin B12, Calcium, and Magnesium levels.", "status": "active"},
        {"id": CAT_IDS["fever"], "category_name": "Fever Profile", "category_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&h=400&auto=format&fit=crop", "description": "Dengue NS1, Typhoid, Malaria antigen, and Complete Blood Count for acute fever.", "status": "active"},
        {"id": CAT_IDS["pregnancy"], "category_name": "Pregnancy Profile", "category_image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&h=400&auto=format&fit=crop", "description": "Antenatal screening, Beta-hCG, blood grouping, and maternal health markers.", "status": "active"},
        {"id": CAT_IDS["allergy"], "category_name": "Allergy Profile", "category_image": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=400&h=400&auto=format&fit=crop", "description": "Comprehensive IgE antibody screening for food, dust, pollens, and environmental allergens.", "status": "active"},
        {"id": CAT_IDS["cancer"], "category_name": "Cancer Screening", "category_image": "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=400&h=400&auto=format&fit=crop", "description": "Tumor markers including CEA, CA-125, PSA, and AFP for early detection.", "status": "active"}
    ],
    "laboratory_tests": [
        {"id": "d1111111-1111-4111-d111-111111111101", "category_id": CAT_IDS["full_body"], "hospital_id": HOSPITAL_IDS["main"], "test_name": "Complete Blood Count (CBC)", "test_code": "LAB-CBC-01", "description": "24 parameters including Hb, RBC, WBC, Platelets, ESR.", "preparation": "No special preparation required.", "fasting_required": False, "sample_type": "Blood", "report_time": "12 Hours", "original_price": 40.0, "discount_price": 25.0, "home_collection": True, "status": "active"},
        {"id": "d2222222-2222-4222-d222-222222222102", "category_id": CAT_IDS["diabetes"], "hospital_id": HOSPITAL_IDS["main"], "test_name": "HbA1c Glycated Hemoglobin", "test_code": "LAB-HBA1C-02", "description": "3-month average blood glucose control measurement.", "preparation": "Fast for 8 hours for best accuracy.", "fasting_required": True, "sample_type": "Blood", "report_time": "12 Hours", "original_price": 45.0, "discount_price": 30.0, "home_collection": True, "status": "active"},
        {"id": "d3333333-3333-4333-d333-333333333103", "category_id": CAT_IDS["cardiac"], "hospital_id": HOSPITAL_IDS["main"], "test_name": "Lipid Profile Gold", "test_code": "LAB-LIPID-03", "description": "Total Cholesterol, HDL, LDL, VLDL, Triglycerides & Ratio.", "preparation": "10-12 hours mandatory overnight fasting.", "fasting_required": True, "sample_type": "Blood", "report_time": "24 Hours", "original_price": 75.0, "discount_price": 50.0, "home_collection": True, "status": "active"},
        {"id": "d4444444-4444-4444-d444-444444444104", "category_id": CAT_IDS["thyroid"], "hospital_id": HOSPITAL_IDS["eastside"], "test_name": "Thyroid Stimulating Hormone (TSH)", "test_code": "LAB-TSH-04", "description": "Evaluates thyroid gland activity and metabolic regulation.", "preparation": "Early morning sample recommended.", "fasting_required": False, "sample_type": "Blood", "report_time": "24 Hours", "original_price": 35.0, "discount_price": 22.0, "home_collection": True, "status": "active"},
        {"id": "d5555555-5555-4555-d555-555555555105", "category_id": CAT_IDS["vitamin"], "hospital_id": HOSPITAL_IDS["main"], "test_name": "Vitamin D3 (25-OH)", "test_code": "LAB-VITD-05", "description": "Assesses bone health, immune strength, and calciferol levels.", "preparation": "No special preparation.", "fasting_required": False, "sample_type": "Blood", "report_time": "24 Hours", "original_price": 60.0, "discount_price": 40.0, "home_collection": True, "status": "active"}
    ],
    "diagnostic_tests": [
        {"id": "d1111111-1111-4111-d111-111111111101", "hospital_id": HOSPITAL_IDS["main"], "test_name": "Complete Blood Count (CBC)", "category": "Full Body Checkup", "description": "24 parameters including Hb, RBC, WBC, Platelets, ESR.", "preparation": "No special preparation required.", "fasting_required": False, "report_time": "12 Hours", "original_price": 40.0, "discount_price": 25.0, "home_collection": True, "status": "active"},
        {"id": "d2222222-2222-4222-d222-222222222102", "hospital_id": HOSPITAL_IDS["main"], "test_name": "HbA1c Glycated Hemoglobin", "category": "Diabetes Profile", "description": "3-month average blood glucose control measurement.", "preparation": "Fast for 8 hours for best accuracy.", "fasting_required": True, "report_time": "12 Hours", "original_price": 45.0, "discount_price": 30.0, "home_collection": True, "status": "active"},
        {"id": "d3333333-3333-4333-d333-333333333103", "hospital_id": HOSPITAL_IDS["main"], "test_name": "Lipid Profile Gold", "category": "Cardiac Profile", "description": "Total Cholesterol, HDL, LDL, VLDL, Triglycerides & Ratio.", "preparation": "10-12 hours mandatory overnight fasting.", "fasting_required": True, "report_time": "24 Hours", "original_price": 75.0, "discount_price": 50.0, "home_collection": True, "status": "active"},
        {"id": "d4444444-4444-4444-d444-444444444104", "hospital_id": HOSPITAL_IDS["eastside"], "test_name": "Thyroid Stimulating Hormone (TSH)", "category": "Thyroid Profile", "description": "Evaluates thyroid gland activity and metabolic regulation.", "preparation": "Early morning sample recommended.", "fasting_required": False, "report_time": "24 Hours", "original_price": 35.0, "discount_price": 22.0, "home_collection": True, "status": "active"},
        {"id": "d5555555-5555-4555-d555-555555555105", "hospital_id": HOSPITAL_IDS["main"], "test_name": "Vitamin D3 (25-OH)", "category": "Vitamin Profile", "description": "Assesses bone health, immune strength, and calciferol levels.", "preparation": "No special preparation.", "fasting_required": False, "report_time": "24 Hours", "original_price": 60.0, "discount_price": 40.0, "home_collection": True, "status": "active"}
    ],
    "diagnostic_packages": [
        {
            "id": "e1111111-1111-4111-e111-111111112001",
            "category_id": CAT_IDS["full_body"],
            "hospital_id": HOSPITAL_IDS["main"],
            "package_name": "Executive Comprehensive Wellness Profile",
            "package_code": "PKG-EXEC-FULL-01",
            "package_image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&h=400&auto=format&fit=crop",
            "description": "Comprehensive 75+ parameter health evaluation including metabolic profiles, vital organ screens, thyroid panels, and essential vitamin markers.",
            "original_price": 299.0,
            "discount_price": 149.0,
            "report_time": "24-36 Hours",
            "home_collection": True,
            "recommended_for": "Adults aged 25+ for yearly preventative health screening.",
            "status": "active"
        },
        {
            "id": "e2222222-2222-4222-e222-222222222002",
            "category_id": CAT_IDS["diabetes"],
            "hospital_id": HOSPITAL_IDS["main"],
            "package_name": "Diabetes Metabolic Assessment Panel",
            "package_code": "PKG-DIAB-CARE-02",
            "package_image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&h=400&auto=format&fit=crop",
            "description": "Advanced diabetic monitoring: HbA1c, Fasting & Post-prandial glucose, Serum Creatinine, Urine Microalbumin, and Lipid Profile.",
            "original_price": 180.0,
            "discount_price": 99.0,
            "report_time": "24 Hours",
            "home_collection": True,
            "recommended_for": "Diabetic & pre-diabetic patients monitoring blood sugar control.",
            "status": "active"
        },
        {
            "id": "e3333333-3333-4333-e333-333333332003",
            "category_id": CAT_IDS["cardiac"],
            "hospital_id": HOSPITAL_IDS["eastside"],
            "package_name": "Advanced Cardiovascular Wellness Shield",
            "package_code": "PKG-CARD-SHIELD-03",
            "package_image": "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=600&h=400&auto=format&fit=crop",
            "description": "Includes Lipid Gold Profile, High-sensitivity CRP, Apolipoprotein A1 & B, Homocysteine, and ECG screening.",
            "original_price": 250.0,
            "discount_price": 139.0,
            "report_time": "24 Hours",
            "home_collection": True,
            "recommended_for": "Individuals with high cholesterol, hypertension, or family history of heart disease.",
            "status": "active"
        },
        {
            "id": "e4444444-4444-4444-e444-444444442004",
            "category_id": CAT_IDS["women"],
            "hospital_id": HOSPITAL_IDS["eastside"],
            "package_name": "Women's Comprehensive Health Panel",
            "package_code": "PKG-WOMEN-WELL-04",
            "package_image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&h=400&auto=format&fit=crop", "description": "Tailored for women: Thyroid Profile Total, Iron & Ferritin, Calcium & Vitamin D3, LH, FSH, Prolactin, and CBC.",
            "original_price": 220.0,
            "discount_price": 119.0,
            "report_time": "24-48 Hours",
            "home_collection": True,
            "recommended_for": "Women seeking hormonal balance, bone health, and thyroid checkup.",
            "status": "active"
        },
        {
            "id": "e5555555-5555-4555-e555-555555552005",
            "category_id": CAT_IDS["senior"],
            "hospital_id": HOSPITAL_IDS["metro"],
            "package_name": "Senior Citizen Wellness Panel",
            "package_code": "PKG-SENIOR-CARE-05",
            "package_image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&h=400&auto=format&fit=crop",
            "description": "Geriatric wellness package including Joint & Bone markers, Kidney Function (KFT), Liver Function (LFT), Complete Blood Count, and Cardiac markers.",
            "original_price": 280.0,
            "discount_price": 129.0,
            "report_time": "24 Hours",
            "home_collection": True,
            "recommended_for": "Seniors aged 60+ for routine health tracking.",
            "status": "active"
        }
    ],
    "package_tests": [
        {"id": "c1111111-1111-4111-c111-111111111111", "package_id": "e1111111-1111-4111-e111-111111112001", "test_id": "d1111111-1111-4111-d111-111111111101"},
        {"id": "c2222222-2222-4222-c222-222222222222", "package_id": "e1111111-1111-4111-e111-111111112001", "test_id": "d2222222-2222-4222-d222-222222222102"},
        {"id": "c3333333-3333-4333-c333-333333333333", "package_id": "e1111111-1111-4111-e111-111111112001", "test_id": "d3333333-3333-4333-d333-333333333103"},
        {"id": "c4444444-4444-4444-c444-444444444444", "package_id": "e1111111-1111-4111-e111-111111112001", "test_id": "d4444444-4444-4444-d444-444444444104"},
        {"id": "c5555555-5555-4555-c555-555555555555", "package_id": "e1111111-1111-4111-e111-111111112001", "test_id": "d5555555-5555-4555-d555-555555555105"},
        {"id": "c6666666-6666-4666-c666-666666666666", "package_id": "e2222222-2222-4222-e222-222222222002", "test_id": "d1111111-1111-4111-d111-111111111101"},
        {"id": "c7777777-7777-4777-c777-777777777777", "package_id": "e2222222-2222-4222-e222-222222222002", "test_id": "d2222222-2222-4222-d222-222222222102"},
        {"id": "c8888888-8888-4888-c888-888888888888", "package_id": "e3333333-3333-4333-e333-333333332003", "test_id": "d3333333-3333-4333-d333-333333333103"}
    ],
    "sample_collection_slots": [
        {"id": "f1111111-1111-4111-f111-111111111111", "hospital_id": HOSPITAL_IDS["main"], "slot_date": "2026-08-04", "start_time": "07:00:00", "end_time": "09:00:00", "max_bookings": 10, "available_slots": 8, "status": "active"},
        {"id": "f2222222-2222-4222-f222-222222222222", "hospital_id": HOSPITAL_IDS["main"], "slot_date": "2026-08-04", "start_time": "09:00:00", "end_time": "11:00:00", "max_bookings": 10, "available_slots": 6, "status": "active"},
        {"id": "f3333333-3333-4333-f333-333333333333", "hospital_id": HOSPITAL_IDS["main"], "slot_date": "2026-08-04", "start_time": "11:00:00", "end_time": "13:00:00", "max_bookings": 10, "available_slots": 10, "status": "active"},
        {"id": "f4444444-4444-4444-f444-444444444444", "hospital_id": HOSPITAL_IDS["eastside"], "slot_date": "2026-08-04", "start_time": "08:00:00", "end_time": "10:00:00", "max_bookings": 10, "available_slots": 9, "status": "active"}
    ],
    "package_bookings": [
        {
            "id": "a3333333-3333-4333-a333-333333333001",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "patient_name": "Percy Boyina",
            "hospital_id": HOSPITAL_IDS["main"],
            "package_id": "e1111111-1111-4111-e111-111111112001",
            "booking_reference": "PKG-2026-9901",
            "appointment_date": "2026-08-04",
            "appointment_time": "07:00:00 - 09:00:00",
            "booking_status": "confirmed",
            "payment_status": "paid",
            "amount": 149.0,
            "created_at": "2026-08-02T16:00:00Z",
            "updated_at": "2026-08-02T16:00:00Z"
        }
    ]
}


def seed_diagnostic_all():
    print("Seed disabled: data is managed manually via the admin dashboard. Skipping auto-seed.")
    return {}

def _seed_diagnostic_all_internal():
    """Internal seed function - only call this explicitly during initial setup."""
    print("Beginning Diagnostic Packages Module Data Seeding...")
    if not supabase_client:
        print("Warning: Supabase client is not available. Returning local seed dictionary.")
        return SEED_DIAGNOSTIC_DATA

    for table_name, records in SEED_DIAGNOSTIC_DATA.items():
        try:
            print(f"Upserting {len(records)} records into table '{table_name}'...")
            supabase_client.table(table_name).upsert(records).execute()
            print(f"[OK] Table '{table_name}' seeded successfully.")
        except Exception as e:
            print(f"Note/Error seeding '{table_name}': {e}")

    print("Diagnostic seeding completed!")
    return SEED_DIAGNOSTIC_DATA


if __name__ == "__main__":
    seed_diagnostic_all()
