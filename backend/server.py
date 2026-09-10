import os
import json
import logging
import random
import uuid
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

# Configure logging at module initialization
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("server")

from fastapi import FastAPI, APIRouter, HTTPException, Query, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

try:
    from twilio.rest import Client as TwilioClient
except ImportError:
    TwilioClient = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# File storage paths
DEPARTMENTS_FILE = ROOT_DIR / "departments_store.json"
SERVICES_FILE = ROOT_DIR / "services_store.json"
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Supabase connection
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

supabase_client: Optional[Client] = None
try:
    if create_client and supabase_url and supabase_key:
        supabase_client = create_client(supabase_url, supabase_key)
except Exception as e:
    logger.warning(f"Could not initialize Supabase client: {e}")
    supabase_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup connection check
    try:
        if supabase_client:
            supabase_client.table("departments").select("id").limit(1).execute()
            logger.info("Connected to Supabase database successfully.")
    except Exception as e:
        logger.warning(f"Could not query Supabase on startup: {e}")
    yield


# Create the main FastAPI app
app = FastAPI(title="Prana Medical API", version="1.0.0", lifespan=lifespan)

# Setup CORS Middleware
cors_origins_env = os.environ.get('CORS_ORIGINS', '')
if cors_origins_env and cors_origins_env != '*':
    allowed_origins = [orig.strip() for orig in cors_origins_env.split(',') if orig.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@app.get("/")
@app.get("/health")
def root_health():
    return {"status": "ok", "service": "PRANA Medical API", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/health")
def api_health():
    return {"status": "ok", "service": "PRANA Medical API", "timestamp": datetime.now(timezone.utc).isoformat()}


# ============= MODELS =============

class HospitalCreate(BaseModel):
    hospital_name: str
    hospital_code: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: str
    email: str
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_time: Optional[str] = "08:00:00"
    closing_time: Optional[str] = "20:00:00"
    is_open: bool = True
    status: str = "active"

class HospitalReviewCreate(BaseModel):
    user_id: Optional[str] = None
    user_name: Optional[str] = "Anonymous Patient"
    rating: float = Field(..., ge=1.0, le=5.0)
    review: str

# Insurance Models
class InsuranceClaimCreate(BaseModel):
    user_id: Optional[str] = "00000000-0000-0000-0000-000000000001"
    patient_name: Optional[str] = None
    hospital_id: str
    provider_id: str
    plan_id: Optional[str] = None
    claim_amount: float
    remarks: Optional[str] = None

class InsuranceProviderCreate(BaseModel):
    provider_name: str
    provider_logo: Optional[str] = None
    description: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    website: Optional[str] = None
    status: str = "active"

class InsurancePlanCreate(BaseModel):
    provider_id: str
    plan_name: str
    plan_type: str
    coverage_amount: float
    description: Optional[str] = None
    eligibility: Optional[str] = None
    waiting_period: Optional[str] = None
    status: str = "active"

# Diagnostic Packages Models
class PackageBookingCreate(BaseModel):
    user_id: Optional[str] = "00000000-0000-0000-0000-000000000001"
    patient_name: Optional[str] = "Percy Boyina"
    hospital_id: str
    package_id: str
    appointment_date: str
    appointment_time: str
    amount: float

class DiagnosticCategoryCreate(BaseModel):
    category_name: str
    category_image: Optional[str] = None
    description: Optional[str] = None
    status: str = "active"

class DiagnosticPackageCreate(BaseModel):
    category_id: Optional[str] = None
    hospital_id: str
    package_name: str
    package_code: Optional[str] = None
    package_image: Optional[str] = None
    description: Optional[str] = None
    original_price: float
    discount_price: Optional[float] = None
    report_time: Optional[str] = "24 Hours"
    home_collection: bool = True
    recommended_for: Optional[str] = None
    status: str = "active"

# Import Seed Data for fallback database store
try:
    from seed_hospitals import SEED_DATA as HOSPITAL_SEED_DATA
except Exception:
    HOSPITAL_SEED_DATA = {"hospitals": [], "departments": [], "doctors": [], "doctor_availability": [], "diagnostic_tests": [], "diagnostic_packages": [], "package_tests": [], "hospital_reviews": [], "hospital_images": []}

try:
    from seed_insurance import SEED_INSURANCE_DATA, SEED_FAQS
except Exception:
    SEED_INSURANCE_DATA = {"insurance_providers": [], "insurance_plans": [], "hospital_insurance": [], "insurance_claims": [], "insurance_documents": []}
    SEED_FAQS = []

try:
    from seed_diagnostic_packages import SEED_DIAGNOSTIC_DATA
except Exception:
    SEED_DIAGNOSTIC_DATA = {"diagnostic_categories": [], "laboratory_tests": [], "diagnostic_packages": [], "package_tests": [], "sample_collection_slots": [], "package_bookings": []}

try:
    from seed_hero_slider import DEFAULT_SLIDER_IMAGES
except Exception:
    DEFAULT_SLIDER_IMAGES = [
        {"id": "slide-1", "title": "Main Integrated Care Complex", "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop", "display_order": 1, "is_active": True},
        {"id": "slide-2", "title": "Advanced Surgical & Trauma Center", "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop", "display_order": 2, "is_active": True},
        {"id": "slide-3", "title": "Dedicated Family Health & Neonatal Care", "image_url": "https://images.unsplash.com/photo-1502740479091-635887520276?q=80&w=1200&auto=format&fit=crop", "display_order": 3, "is_active": True}
    ]

def _normalize_doctor(d: dict) -> dict:
    if not isinstance(d, dict):
        return d
    doc = dict(d)
    if not doc.get("name") and doc.get("doctor_name"):
        doc["name"] = doc["doctor_name"]
    elif not doc.get("name"):
        doc["name"] = "Medical Specialist"

    if not doc.get("title") and doc.get("qualification"):
        doc["title"] = doc["qualification"]
    elif not doc.get("title"):
        doc["title"] = f"Senior Consultant - {doc.get('department') or 'Specialist'}"

    if not doc.get("specialty") and doc.get("specialization"):
        doc["specialty"] = doc["specialization"]
    elif not doc.get("specialty"):
        doc["specialty"] = doc.get("department") or "General Medicine"

    if not doc.get("department"):
        doc["department"] = doc.get("specialization") or doc.get("specialty") or "General Medicine"

    if doc.get("experience_years") is None:
        doc["experience_years"] = doc.get("experience") if doc.get("experience") is not None else 10

    if not doc.get("schedule"):
        doc["schedule"] = "Mon - Sat: 09:00 - 17:00"

    if not doc.get("photo_url") and doc.get("profile_image"):
        doc["photo_url"] = doc["profile_image"]
    elif not doc.get("photo_url"):
        doc["photo_url"] = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop"

    if doc.get("consultation_fee") is None:
        doc["consultation_fee"] = 150.0

    if doc.get("rating") is None:
        doc["rating"] = 4.9
    if doc.get("review_count") is None:
        doc["review_count"] = 50
    if doc.get("available_today") is None:
        doc["available_today"] = doc.get("is_available", True)

    return doc

# In-Memory DB Store initialized with seed data
LOCAL_DB = {
    "hospitals": list(HOSPITAL_SEED_DATA.get("hospitals", [])),
    "hospital_departments": list(HOSPITAL_SEED_DATA.get("departments", [])),
    "doctors": [_normalize_doctor(d) for d in HOSPITAL_SEED_DATA.get("doctors", [])],
    "doctor_availability": list(HOSPITAL_SEED_DATA.get("doctor_availability", [])),
    "diagnostic_tests": list(HOSPITAL_SEED_DATA.get("diagnostic_tests", [])),
    "diagnostic_packages": list(HOSPITAL_SEED_DATA.get("diagnostic_packages", [])) + list(SEED_DIAGNOSTIC_DATA.get("diagnostic_packages", [])),
    "package_tests": list(HOSPITAL_SEED_DATA.get("package_tests", [])) + list(SEED_DIAGNOSTIC_DATA.get("package_tests", [])),
    "hospital_reviews": list(HOSPITAL_SEED_DATA.get("hospital_reviews", [])),
    "hospital_images": list(HOSPITAL_SEED_DATA.get("hospital_images", [])),
    "insurance_providers": list(SEED_INSURANCE_DATA.get("insurance_providers", [])),
    "insurance_plans": list(SEED_INSURANCE_DATA.get("insurance_plans", [])),
    "hospital_insurance": list(SEED_INSURANCE_DATA.get("hospital_insurance", [])),
    "insurance_claims": list(SEED_INSURANCE_DATA.get("insurance_claims", [])),
    "insurance_documents": list(SEED_INSURANCE_DATA.get("insurance_documents", [])),
    "insurance_faqs": list(SEED_FAQS),
    "diagnostic_categories": list(SEED_DIAGNOSTIC_DATA.get("diagnostic_categories", [])),
    "laboratory_tests": list(SEED_DIAGNOSTIC_DATA.get("laboratory_tests", [])),
    "sample_collection_slots": list(SEED_DIAGNOSTIC_DATA.get("sample_collection_slots", [])),
    "package_bookings": list(SEED_DIAGNOSTIC_DATA.get("package_bookings", [])),
    "appointments": [],
    "hero_slider_images": list(DEFAULT_SLIDER_IMAGES),
    "notification_logs": []
}

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str = "medical_services"
    is_active: Optional[bool] = True

class DepartmentCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    name: str
    description: str
    icon: Optional[str] = "medical_services"
    is_active: Optional[bool] = True

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    icon: str = "medical_services"
    path: str = "/doctors"
    badge: Optional[str] = ""
    is_active: bool = True
    display_order: int = 0
    bg_color: Optional[str] = "bg-blue-50 text-[#275B99]"

class ServiceCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    title: str
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    icon: Optional[str] = "medical_services"
    path: Optional[str] = "/doctors"
    badge: Optional[str] = ""
    is_active: Optional[bool] = True
    display_order: Optional[int] = 0
    bg_color: Optional[str] = "bg-blue-50 text-[#275B99]"


DEFAULT_SERVICES = [
    {
        "id": "serv-1",
        "title": "Clinical Specialists",
        "subtitle": "Expert consultations",
        "description": "Comprehensive one-on-one evaluations with board-certified physicians across multiple specialized disciplines.",
        "icon": "Stethoscope",
        "path": "/doctors",
        "badge": "Top Rated",
        "is_active": True,
        "display_order": 1,
        "bg_color": "bg-blue-50 text-[#275B99]"
    },
    {
        "id": "serv-2",
        "title": "Our Care Facilities",
        "subtitle": "State-of-the-art centers",
        "description": "Leading hospitals and surgical wings equipped with modern diagnostic units and patient-friendly suites.",
        "icon": "Building2",
        "path": "/hospitals",
        "badge": "Verified",
        "is_active": True,
        "display_order": 2,
        "bg_color": "bg-green-50 text-[#4D9B2A]"
    },
    {
        "id": "serv-3",
        "title": "Direct Coverage",
        "subtitle": "Stress-free billing",
        "description": "Seamless cashless hospital admission and immediate insurance pre-authorization with major providers.",
        "icon": "ShieldCheck",
        "path": "/insurance",
        "badge": "Cashless",
        "is_active": True,
        "display_order": 3,
        "bg_color": "bg-blue-50 text-[#275B99]"
    },
    {
        "id": "serv-4",
        "title": "Wellness Panels",
        "subtitle": "Proactive screenings",
        "description": "Thorough full-body preventative health checkups, cardiovascular panels, and executive wellness packages.",
        "icon": "Activity",
        "path": "/packages",
        "badge": "Popular",
        "is_active": True,
        "display_order": 4,
        "bg_color": "bg-green-50 text-[#4D9B2A]"
    },
    {
        "id": "serv-5",
        "title": "Advanced Diagnostics",
        "subtitle": "High-precision testing",
        "description": "State-of-the-art radiology, clinical pathology, and imaging facilities delivering rapid digital lab reports.",
        "icon": "Microscope",
        "path": "/book-appointment",
        "badge": "24h Reports",
        "is_active": True,
        "display_order": 5,
        "bg_color": "bg-blue-50 text-[#275B99]"
    },
    {
        "id": "serv-6",
        "title": "Immediate Response",
        "subtitle": "24/7 emergency dispatch",
        "description": "Round-the-clock priority trauma triage, rapid critical ambulance transport, and acute care assistance.",
        "icon": "Phone",
        "path": "/book-appointment",
        "badge": "24/7 Urgent",
        "is_active": True,
        "display_order": 6,
        "bg_color": "bg-green-50 text-[#4D9B2A]"
    }
]

DEFAULT_DEPARTMENTS = [
    {"id": "dept-1", "name": "Cardiology", "description": "Comprehensive cardiac evaluations, angioplasty, and cardiovascular wellness programs.", "icon": "favorite"},
    {"id": "dept-2", "name": "Neurology", "description": "Expert treatment for stroke, epilepsy, neuromuscular conditions, and spine disorders.", "icon": "psychology"},
    {"id": "dept-3", "name": "Orthopedics", "description": "Joint replacement, fracture treatment, sports trauma rehabilitation, and spine surgery.", "icon": "accessibility_new"},
    {"id": "dept-4", "name": "Pediatrics", "description": "Compassionate pediatric healthcare, immunization, neonatal intensive care, and development tracking.", "icon": "child_care"},
    {"id": "dept-5", "name": "Gastroenterology", "description": "Treatment for digestive system disorders, endoscopy, liver wellness, and metabolic care.", "icon": "medical_services"},
    {"id": "dept-6", "name": "Dermatology", "description": "Advanced therapeutic skincare, cosmetic dermatology, allergy testing, and minor laser procedures.", "icon": "health_and_safety"},
    {"id": "dept-7", "name": "Oncology", "description": "Multidisciplinary oncology care, targeted chemotherapy, surgical oncology, and patient support.", "icon": "medication"},
    {"id": "dept-8", "name": "ENT", "description": "Ear, nose, and throat diagnostic evaluation, microsurgery, and audiometric screenings.", "icon": "hearing"},
    {"id": "dept-9", "name": "General Medicine", "description": "Primary diagnosis, preventive checkups, seasonal infections, and chronic illness care.", "icon": "medical_services"}
]

def load_services_from_file() -> List[dict]:
    if SERVICES_FILE.exists():
        try:
            with open(SERVICES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            logger.warning(f"Error loading services from file: {e}")
    save_services_to_file(DEFAULT_SERVICES)
    return list(DEFAULT_SERVICES)

def save_services_to_file(services: List[dict]):
    try:
        with open(SERVICES_FILE, "w", encoding="utf-8") as f:
            json.dump(services, f, indent=2)
    except Exception as e:
        logger.warning(f"Error saving services to file: {e}")

def load_departments_from_file() -> List[dict]:
    if DEPARTMENTS_FILE.exists():
        try:
            with open(DEPARTMENTS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            logger.warning(f"Error loading departments from file: {e}")
    save_departments_to_file(DEFAULT_DEPARTMENTS)
    return list(DEFAULT_DEPARTMENTS)

def save_departments_to_file(departments: List[dict]):
    try:
        with open(DEPARTMENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(departments, f, indent=2)
    except Exception as e:
        logger.warning(f"Error saving departments to file: {e}")


class TimeSlot(BaseModel):
    time: str  # e.g., "09:00 AM"
    available: bool


class Doctor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = "Medical Specialist"
    title: Optional[str] = "Senior Medical Consultant"  # e.g., "MD, FACC - Senior Cardiologist"
    specialty: Optional[str] = "General Medicine"
    department: Optional[str] = "General Medicine"
    experience_years: Optional[int] = 10
    languages: List[str] = ["English", "Hindi"]
    schedule: Optional[str] = "Mon - Sat: 09:00 - 17:00"  # e.g., "Mon - Fri: 09:00 - 14:00"
    schedule_details: dict = {}  # e.g., {"days": ["Mon", "Tue", "Wed"], "start": "09:00", "end": "14:00"}
    rating: float = 4.9
    review_count: int = 50
    available_today: bool = True
    photo_url: Optional[str] = None
    display_sections: List[str] = []
    about: Optional[str] = None
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    location_address: Optional[str] = None
    consultation_fee: Optional[float] = 150.0

class DoctorCreate(BaseModel):
    name: str
    title: Optional[str] = "Senior Medical Consultant"
    specialty: Optional[str] = "General Medicine"
    department: str
    experience_years: Optional[int] = 10
    languages: List[str] = ["English", "Hindi"]
    schedule: Optional[str] = "Mon - Sat: 09:00 - 17:00"
    schedule_details: dict = {}
    rating: float = 4.9
    review_count: int = 0
    available_today: bool = True
    photo_url: Optional[str] = None
    display_sections: List[str] = []
    about: Optional[str] = None
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    location_address: Optional[str] = None
    consultation_fee: Optional[float] = 150.0


class PatientDetails(BaseModel):
    full_name: str
    age: int
    gender: str
    phone: str
    whatsapp_notification: bool
    sms_notification: bool
    symptoms: str


class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    doctor_id: str
    doctor_name: str
    department: str
    appointment_date: str  # e.g., "2024-10-24"
    appointment_time: str  # e.g., "09:30 AM"
    patient: PatientDetails
    consultation_fee: float
    status: str = "confirmed"  # confirmed, cancelled, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str
    appointment_time: str
    patient: PatientDetails

class NotificationRequest(BaseModel):
    phone: str
    doctor_name: str
    date: str
    time: str
    patient_name: Optional[str] = "Patient"
    hospital_name: Optional[str] = "Prana Medical Center"
    hospital_location: Optional[str] = "Road No. 72, Jubilee Hills, Hyderabad"
    specialty: Optional[str] = None
    doctor_title: Optional[str] = None
    consultation_fee: Optional[float] = 135.0
    appointment_id: Optional[str] = None
    sender_number: Optional[str] = "7893124722"
    send_sms: bool = True
    send_whatsapp: bool = True

class BookingInitiatedNotificationRequest(BaseModel):
    appointment_id: Optional[str] = None
    patient_name: str
    patient_phone: str
    doctor_id: Optional[str] = None
    doctor_name: str
    doctor_title: Optional[str] = "Specialist Consultant"
    specialty: Optional[str] = "General Medicine"
    department: Optional[str] = None
    hospital_name: Optional[str] = "Prana Medical Center"
    hospital_location: Optional[str] = "Road No. 72, Jubilee Hills, Hyderabad"
    appointment_date: str
    appointment_time: str
    consultation_fee: Optional[float] = 135.0
    sender_number: Optional[str] = "7893124722"
    send_sms: bool = True
    send_whatsapp: bool = True

class DoctorConfirmationNotificationRequest(BaseModel):
    appointment_id: Optional[str] = None
    patient_name: str
    patient_phone: str
    doctor_id: Optional[str] = None
    doctor_name: str
    doctor_title: Optional[str] = "Specialist Consultant"
    specialty: Optional[str] = "General Medicine"
    hospital_name: Optional[str] = "Prana Medical Center"
    hospital_location: Optional[str] = "Road No. 72, Jubilee Hills, Hyderabad"
    appointment_date: str
    appointment_time: str
    consultation_fee: Optional[float] = 135.0
    notes: Optional[str] = "Please arrive 15 minutes prior to your scheduled consultation."
    sender_number: Optional[str] = "7893124722"
    send_sms: bool = True
    send_whatsapp: bool = True



# ============= ROUTES =============

@app.get("/")
async def main_root():
    return {
        "message": "Clinical Serenity API is running!",
        "status": "online",
        "endpoints": {
            "api": "/api",
            "departments": "/api/departments",
            "doctors": "/api/doctors",
            "hospitals": "/api/hospitals",
            "docs": "/docs"
        }
    }

@api_router.get("/")
async def root():
    return {"message": "Clinical Serenity API"}

# ============= HOSPITAL WISE ROUTES =============

@api_router.get("/hospitals/filters/options")
async def get_hospital_filter_options():
    """Get available filter options (cities, departments, rating options)"""
    cities = sorted(list({h["city"] for h in LOCAL_DB["hospitals"] if h.get("city")}))
    departments = sorted(list({d["department_name"] for d in LOCAL_DB["hospital_departments"] if d.get("department_name")}))
    return {
        "cities": cities,
        "departments": departments,
        "ratings": [4.5, 4.0, 3.5, 3.0]
    }

@api_router.get("/hospitals")
async def get_hospitals(
    search: Optional[str] = None,
    city: Optional[str] = None,
    department: Optional[str] = None,
    min_rating: Optional[float] = None,
    is_open: Optional[bool] = None,
    status: Optional[str] = "active"
):
    """Get hospitals list with optional filters"""
    # Try fetching from Supabase table first
    hospitals = []
    if supabase_client:
        try:
            query = supabase_client.table("hospitals").select("*")
            if status:
                query = query.eq("status", status)
            if city and city != "All Cities":
                query = query.eq("city", city)
            if is_open is not None:
                query = query.eq("is_open", is_open)
            if min_rating:
                query = query.gte("rating", min_rating)
            res = query.execute()
            if res.data:
                hospitals = res.data
        except Exception as e:
            logger.info(f"Supabase hospitals query fallback to LOCAL_DB: {e}")

    if not hospitals:
        hospitals = [h for h in LOCAL_DB["hospitals"] if h.get("status", "active") == status]
        if city and city != "All Cities":
            hospitals = [h for h in hospitals if h.get("city", "").lower() == city.lower()]
        if is_open is not None:
            hospitals = [h for h in hospitals if h.get("is_open") == is_open]
        if min_rating:
            hospitals = [h for h in hospitals if float(h.get("rating", 0)) >= min_rating]

    # Department filter check
    if department and department != "All Departments":
        matching_hosp_ids = {
            d["hospital_id"] for d in LOCAL_DB["hospital_departments"]
            if department.lower() in d.get("department_name", "").lower()
        }
        hospitals = [h for h in hospitals if h["id"] in matching_hosp_ids]

    # Search query check
    if search:
        s_lower = search.lower()
        hospitals = [
            h for h in hospitals
            if s_lower in h.get("hospital_name", "").lower()
            or s_lower in h.get("city", "").lower()
            or s_lower in h.get("address", "").lower()
            or s_lower in h.get("description", "").lower()
        ]

    return hospitals

@api_router.get("/hospitals/{hospital_id}")
async def get_hospital_details(hospital_id: str):
    """Get complete hospital detail including departments, doctors, tests, packages, reviews, images"""
    hospital = None
    if supabase_client:
        try:
            res = supabase_client.table("hospitals").select("*").eq("id", hospital_id).execute()
            if res.data:
                hospital = res.data[0]
        except Exception:
            pass

    if not hospital:
        matched = [h for h in LOCAL_DB["hospitals"] if h["id"] == hospital_id]
        if not matched:
            raise HTTPException(status_code=404, detail="Hospital not found")
        hospital = matched[0]

    # Related items
    departments = [d for d in LOCAL_DB["hospital_departments"] if d.get("hospital_id") == hospital_id]
    doctors = [doc for doc in LOCAL_DB["doctors"] if doc.get("hospital_id") == hospital_id]
    for doc in doctors:
        doc["availability"] = [a for a in LOCAL_DB["doctor_availability"] if a.get("doctor_id") == doc["id"]]
    
    diagnostic_tests = [t for t in LOCAL_DB["diagnostic_tests"] if t.get("hospital_id") == hospital_id]
    diagnostic_packages = [p for p in LOCAL_DB["diagnostic_packages"] if p.get("hospital_id") == hospital_id]
    for pkg in diagnostic_packages:
        p_test_ids = {pt["test_id"] for pt in LOCAL_DB["package_tests"] if pt.get("package_id") == pkg["id"]}
        pkg["included_tests"] = [t for t in diagnostic_tests if t["id"] in p_test_ids]

    reviews = [r for r in LOCAL_DB["hospital_reviews"] if r.get("hospital_id") == hospital_id]
    images = [img for img in LOCAL_DB["hospital_images"] if img.get("hospital_id") == hospital_id]

    return {
        **hospital,
        "departments": departments,
        "doctors": doctors,
        "diagnostic_tests": diagnostic_tests,
        "diagnostic_packages": diagnostic_packages,
        "reviews": reviews,
        "images": images
    }

@api_router.post("/hospitals/{hospital_id}/reviews")
async def add_hospital_review(hospital_id: str, review_data: HospitalReviewCreate):
    """Add a review to a hospital and recalculate total review score"""
    new_review = {
        "id": f"rev-{uuid.uuid4()}",
        "hospital_id": hospital_id,
        "user_id": review_data.user_id,
        "user_name": review_data.user_name,
        "rating": review_data.rating,
        "review": review_data.review,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["hospital_reviews"].append(new_review)

    # Recalculate rating
    h_reviews = [r for r in LOCAL_DB["hospital_reviews"] if r.get("hospital_id") == hospital_id]
    avg_rating = round(sum(r["rating"] for r in h_reviews) / len(h_reviews), 1) if h_reviews else 5.0

    for h in LOCAL_DB["hospitals"]:
        if h["id"] == hospital_id:
            h["rating"] = avg_rating
            h["total_reviews"] = len(h_reviews)
            break

    if supabase_client:
        try:
            supabase_client.table("hospital_reviews").insert(new_review).execute()
            supabase_client.table("hospitals").update({"rating": avg_rating, "total_reviews": len(h_reviews)}).eq("id", hospital_id).execute()
        except Exception:
            pass

    return {"message": "Review submitted successfully", "review": new_review, "new_rating": avg_rating}

# Admin CRUD operations for Hospitals
@api_router.post("/hospitals")
async def create_hospital(data: HospitalCreate):
    """Create a new hospital (Admin)"""
    new_hosp = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "rating": 5.0,
        "total_reviews": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["hospitals"].append(new_hosp)
    if supabase_client:
        try:
            supabase_client.table("hospitals").insert(new_hosp).execute()
        except Exception:
            pass
    return new_hosp

@api_router.put("/hospitals/{hospital_id}")
async def update_hospital(hospital_id: str, data: HospitalCreate):
    """Update existing hospital (Admin)"""
    for i, h in enumerate(LOCAL_DB["hospitals"]):
        if h["id"] == hospital_id:
            updated = {**h, **data.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
            LOCAL_DB["hospitals"][i] = updated
            if supabase_client:
                try:
                    supabase_client.table("hospitals").update(data.model_dump()).eq("id", hospital_id).execute()
                except Exception:
                    pass
            return updated
    raise HTTPException(status_code=404, detail="Hospital not found")

@api_router.delete("/hospitals/{hospital_id}")
async def delete_hospital(hospital_id: str):
    """Delete hospital (Admin)"""
    LOCAL_DB["hospitals"] = [h for h in LOCAL_DB["hospitals"] if h["id"] != hospital_id]
    if supabase_client:
        try:
            supabase_client.table("hospitals").delete().eq("id", hospital_id).execute()
        except Exception:
            pass
    return {"message": "Hospital deleted successfully"}

# ============= INSURANCE MODULE ROUTES =============

@api_router.get("/insurance/providers")
async def get_insurance_providers(
    search: Optional[str] = None,
    status: Optional[str] = "active"
):
    """List all insurance providers with search filter"""
    providers = []
    if supabase_client:
        try:
            query = supabase_client.table("insurance_providers").select("*")
            if status:
                query = query.eq("status", status)
            res = query.execute()
            if res.data:
                providers = res.data
        except Exception:
            pass

    if not providers:
        providers = [p for p in LOCAL_DB["insurance_providers"] if p.get("status", "active") == status]

    if search:
        s = search.lower()
        providers = [
            p for p in providers
            if s in p.get("provider_name", "").lower()
            or s in p.get("description", "").lower()
        ]

    return providers

@api_router.get("/insurance/plans")
async def get_insurance_plans(
    provider_id: Optional[str] = None,
    plan_type: Optional[str] = None,
    min_coverage: Optional[float] = None
):
    """Get insurance plans with optional provider, plan type, or coverage filter"""
    plans = []
    if supabase_client:
        try:
            query = supabase_client.table("insurance_plans").select("*").eq("status", "active")
            if provider_id:
                query = query.eq("provider_id", provider_id)
            if plan_type and plan_type != "All Types":
                query = query.eq("plan_type", plan_type)
            if min_coverage:
                query = query.gte("coverage_amount", min_coverage)
            res = query.execute()
            if res.data:
                plans = res.data
        except Exception:
            pass

    if not plans:
        plans = [p for p in LOCAL_DB["insurance_plans"] if p.get("status", "active") == "active"]
        if provider_id:
            plans = [p for p in plans if p.get("provider_id") == provider_id]
        if plan_type and plan_type != "All Types":
            plans = [p for p in plans if p.get("plan_type", "").lower() == plan_type.lower()]
        if min_coverage:
            plans = [p for p in plans if float(p.get("coverage_amount", 0)) >= min_coverage]

    # Attach provider info
    provider_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}
    for p in plans:
        p["provider"] = provider_map.get(p.get("provider_id"))

    return plans

@api_router.get("/insurance/cashless-hospitals")
async def get_cashless_hospitals(
    provider_id: Optional[str] = None,
    hospital_id: Optional[str] = None
):
    """Get hospitals offering cashless treatment for insurance providers"""
    mappings = LOCAL_DB["hospital_insurance"]
    if provider_id:
        mappings = [m for m in mappings if m.get("provider_id") == provider_id]
    if hospital_id:
        mappings = [m for m in mappings if m.get("hospital_id") == hospital_id]

    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    prov_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}

    results = []
    for m in mappings:
        h = hosp_map.get(m.get("hospital_id"))
        p = prov_map.get(m.get("provider_id"))
        if h and p:
            results.append({
                **m,
                "hospital": h,
                "provider": p
            })
    return results

@api_router.post("/insurance/claims")
async def create_insurance_claim(claim_data: InsuranceClaimCreate):
    """Submit a new insurance claim with auto-generated claim number"""
    claim_num = f"CLM-2026-{random.randint(1000, 9999)}"
    
    new_claim = {
        "id": f"claim-{uuid.uuid4()}",
        "user_id": claim_data.user_id,
        "patient_name": claim_data.patient_name or "Percy Boyina",
        "hospital_id": claim_data.hospital_id,
        "provider_id": claim_data.provider_id,
        "plan_id": claim_data.plan_id,
        "claim_number": claim_num,
        "claim_amount": claim_data.claim_amount,
        "approved_amount": 0.0,
        "claim_status": "submitted",
        "remarks": claim_data.remarks or "Claim submitted successfully. Under initial verification.",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["insurance_claims"].append(new_claim)

    if supabase_client:
        try:
            supabase_client.table("insurance_claims").insert(new_claim).execute()
        except Exception:
            pass

    return new_claim

@api_router.get("/insurance/claims/user/{user_id}")
async def get_user_claims(user_id: str):
    """Get all claims submitted by a patient/user"""
    claims = [c for c in LOCAL_DB["insurance_claims"] if c.get("user_id") == user_id]
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    prov_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}
    plan_map = {pl["id"]: pl for pl in LOCAL_DB["insurance_plans"]}

    for c in claims:
        c["hospital"] = hosp_map.get(c.get("hospital_id"))
        c["provider"] = prov_map.get(c.get("provider_id"))
        c["plan"] = plan_map.get(c.get("plan_id"))
        c["documents"] = [d for d in LOCAL_DB["insurance_documents"] if d.get("claim_id") == c["id"]]

    return claims

@api_router.get("/insurance/claims/{identifier}")
async def get_claim_status(identifier: str):
    """Track claim status by claim_number or claim_id"""
    matched = [
        c for c in LOCAL_DB["insurance_claims"]
        if c.get("claim_number", "").lower() == identifier.lower() or c.get("id") == identifier
    ]
    if not matched:
        raise HTTPException(status_code=404, detail="Claim not found. Please check your Claim Number.")

    c = matched[0]
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    prov_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}
    plan_map = {pl["id"]: pl for pl in LOCAL_DB["insurance_plans"]}

    c["hospital"] = hosp_map.get(c.get("hospital_id"))
    c["provider"] = prov_map.get(c.get("provider_id"))
    c["plan"] = plan_map.get(c.get("plan_id"))
    c["documents"] = [d for d in LOCAL_DB["insurance_documents"] if d.get("claim_id") == c["id"]]

    # Timeline stage builder
    status_order = ["submitted", "under_review", "approved", "paid"]
    current_status = c.get("claim_status", "submitted").lower()
    
    current_index = status_order.index(current_status) if current_status in status_order else 0
    timeline = [
        {"stage": "Submitted", "completed": current_index >= 0, "date": c.get("submitted_at")},
        {"stage": "Under Review", "completed": current_index >= 1, "date": c.get("updated_at") if current_index >= 1 else None},
        {"stage": "Approved", "completed": current_index >= 2, "date": c.get("updated_at") if current_index >= 2 else None},
        {"stage": "Payment Disbursed", "completed": current_index >= 3, "date": c.get("updated_at") if current_index >= 3 else None}
    ]

    return {
        **c,
        "timeline": timeline
    }

@api_router.post("/insurance/claims/{claim_id}/documents")
async def upload_claim_document(
    claim_id: str,
    document_name: str = Form(...),
    document_type: str = Form(...),
    file: Optional[UploadFile] = File(None),
    document_url: Optional[str] = Form(None)
):
    """Upload or attach a document to an insurance claim"""
    final_url = document_url
    if file and file.filename:
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
        file_name = f"claim-{claim_id}-{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(await file.read())
        final_url = f"/uploads/{file_name}"

    if not final_url:
        final_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

    new_doc = {
        "id": f"doc-{uuid.uuid4()}",
        "claim_id": claim_id,
        "document_name": document_name,
        "document_type": document_type,
        "document_url": final_url,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["insurance_documents"].append(new_doc)

    if supabase_client:
        try:
            supabase_client.table("insurance_documents").insert(new_doc).execute()
        except Exception:
            pass

    return new_doc

@api_router.get("/insurance/faqs")
async def get_insurance_faqs():
    """Get list of FAQs for insurance claims and cashless treatment"""
    return LOCAL_DB.get("insurance_faqs", [])

# ============= DIAGNOSTIC PACKAGES MODULE ROUTES =============

@api_router.get("/diagnostic/categories")
async def get_diagnostic_categories(status: Optional[str] = "active"):
    """Get all diagnostic categories (Full Body, Cardiac, Diabetes, Women's, Senior, etc.)"""
    categories = []
    if supabase_client:
        try:
            res = supabase_client.table("diagnostic_categories").select("*").eq("status", status).execute()
            if res.data:
                categories = res.data
        except Exception:
            pass

    if not categories:
        categories = [c for c in LOCAL_DB["diagnostic_categories"] if c.get("status", "active") == status]

    return categories

@api_router.get("/diagnostic/packages")
async def get_diagnostic_packages(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    hospital_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = "active"
):
    """Get diagnostic health checkup packages with optional filters"""
    packages = []
    if supabase_client:
        try:
            query = supabase_client.table("diagnostic_packages").select("*").eq("status", status)
            if category_id and category_id != "All":
                query = query.eq("category_id", category_id)
            if hospital_id and hospital_id != "All":
                query = query.eq("hospital_id", hospital_id)
            res = query.execute()
            if res.data:
                packages = res.data
        except Exception:
            pass

    if not packages:
        packages = [p for p in LOCAL_DB["diagnostic_packages"] if p.get("status", "active") == status]
        if category_id and category_id != "All":
            packages = [p for p in packages if p.get("category_id") == category_id]
        if hospital_id and hospital_id != "All":
            packages = [p for p in packages if p.get("hospital_id") == hospital_id]
        if min_price:
            packages = [p for p in packages if float(p.get("discount_price") or p.get("original_price", 0)) >= min_price]
        if max_price:
            packages = [p for p in packages if float(p.get("discount_price") or p.get("original_price", 0)) <= max_price]

    if search:
        s = search.lower()
        packages = [
            p for p in packages
            if s in p.get("package_name", "").lower()
            or s in p.get("description", "").lower()
            or s in p.get("recommended_for", "").lower()
        ]

    # Attach category & hospital info, and included tests count
    cat_map = {c["id"]: c for c in LOCAL_DB["diagnostic_categories"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    test_map = {t["id"]: t for t in LOCAL_DB["diagnostic_tests"] + LOCAL_DB["laboratory_tests"]}

    for p in packages:
        p["category"] = cat_map.get(p.get("category_id"))
        p["hospital"] = hosp_map.get(p.get("hospital_id"))
        p_test_ids = {pt["test_id"] for pt in LOCAL_DB["package_tests"] if pt.get("package_id") == p["id"]}
        p["included_tests"] = [test_map[tid] for tid in p_test_ids if tid in test_map]

    return packages

@api_router.get("/diagnostic/packages/{package_id}")
async def get_diagnostic_package_details(package_id: str):
    """Get single diagnostic package details with included laboratory tests and collection slots"""
    matched = [p for p in LOCAL_DB["diagnostic_packages"] if p["id"] == package_id]
    if not matched:
        raise HTTPException(status_code=404, detail="Diagnostic package not found")

    pkg = dict(matched[0])
    cat_map = {c["id"]: c for c in LOCAL_DB["diagnostic_categories"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    test_map = {t["id"]: t for t in LOCAL_DB["diagnostic_tests"] + LOCAL_DB["laboratory_tests"]}

    pkg["category"] = cat_map.get(pkg.get("category_id"))
    pkg["hospital"] = hosp_map.get(pkg.get("hospital_id"))

    p_test_ids = {pt["test_id"] for pt in LOCAL_DB["package_tests"] if pt.get("package_id") == package_id}
    pkg["included_tests"] = [test_map[tid] for tid in p_test_ids if tid in test_map]

    slots = [s for s in LOCAL_DB["sample_collection_slots"] if s.get("hospital_id") == pkg.get("hospital_id")]
    pkg["collection_slots"] = slots

    return pkg

@api_router.get("/diagnostic/slots")
async def get_sample_collection_slots(
    hospital_id: Optional[str] = None,
    date: Optional[str] = None
):
    """Get available home sample collection slots for a hospital campus"""
    slots = LOCAL_DB["sample_collection_slots"]
    if hospital_id:
        slots = [s for s in slots if s.get("hospital_id") == hospital_id]
    if date:
        slots = [s for s in slots if s.get("slot_date") == date]
    return slots

@api_router.post("/diagnostic/bookings")
async def create_package_booking(booking_data: PackageBookingCreate):
    """Create a new diagnostic package booking with auto-generated reference code"""
    ref_code = f"PKG-2026-{random.randint(1000, 9999)}"

    new_booking = {
        "id": f"book-{uuid.uuid4()}",
        "user_id": booking_data.user_id,
        "patient_name": booking_data.patient_name,
        "hospital_id": booking_data.hospital_id,
        "package_id": booking_data.package_id,
        "booking_reference": ref_code,
        "appointment_date": booking_data.appointment_date,
        "appointment_time": booking_data.appointment_time,
        "booking_status": "confirmed",
        "payment_status": "paid",
        "amount": booking_data.amount,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["package_bookings"].append(new_booking)

    if supabase_client:
        try:
            supabase_client.table("package_bookings").insert(new_booking).execute()
        except Exception:
            pass

    return new_booking

@api_router.get("/diagnostic/bookings/user/{user_id}")
async def get_user_package_bookings(user_id: str):
    """Get diagnostic package booking history for a user"""
    bookings = [b for b in LOCAL_DB["package_bookings"] if b.get("user_id") == user_id]
    pkg_map = {p["id"]: p for p in LOCAL_DB["diagnostic_packages"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}

    for b in bookings:
        b["package"] = pkg_map.get(b.get("package_id"))
        b["hospital"] = hosp_map.get(b.get("hospital_id"))

    return bookings

@api_router.get("/diagnostic/bookings/{identifier}")
async def get_package_booking_status(identifier: str):
    """Track booking status by booking_reference or booking ID"""
    matched = [
        b for b in LOCAL_DB["package_bookings"]
        if b.get("booking_reference", "").lower() == identifier.lower() or b.get("id") == identifier
    ]
    if not matched:
        raise HTTPException(status_code=404, detail="Booking not found. Please check your Reference Code.")

    b = matched[0]
    pkg_map = {p["id"]: p for p in LOCAL_DB["diagnostic_packages"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}

    b["package"] = pkg_map.get(b.get("package_id"))
    b["hospital"] = hosp_map.get(b.get("hospital_id"))

    # Booking status timeline
    timeline = [
        {"stage": "Confirmed", "completed": True, "date": b.get("created_at")},
        {"stage": "Sample Collection Assigned", "completed": True, "date": b.get("appointment_date")},
        {"stage": "Lab Processing", "completed": b.get("booking_status") in ["processing", "completed"], "date": None},
        {"stage": "Report Generated", "completed": b.get("booking_status") == "completed", "date": None}
    ]

    return {
        **b,
        "timeline": timeline
    }





# Department Routes
@api_router.get("/departments", response_model=List[Department])
async def get_departments():
    """Get all medical departments (Supabase + Local persistent store)"""
    file_depts = load_departments_from_file()
    dept_map = {d.get("name", "").strip().lower(): d for d in file_depts if d.get("name")}
    
    if supabase_client:
        try:
            res = supabase_client.table("departments").select("*").execute()
            for d in (res.data or []):
                key = d.get("name", "").strip().lower()
                if key:
                    dept_map[key] = {
                        "id": str(d.get("id")),
                        "name": d.get("name"),
                        "description": d.get("description") or "",
                        "icon": d.get("icon") or "medical_services"
                    }
        except Exception as e:
            logger.error(f"Error fetching departments from Supabase: {e}")
            
    sorted_depts = sorted(list(dept_map.values()), key=lambda x: x.get("name", ""))
    return sorted_depts

@api_router.post("/departments", response_model=Department)
async def create_department(dept: DepartmentCreate):
    """Create a new department dynamically"""
    new_id = str(uuid.uuid4())
    dept_dict = {
        "id": new_id,
        "name": dept.name.strip(),
        "description": dept.description.strip(),
        "icon": dept.icon or "medical_services"
    }
    
    # Save to persistent file store
    current_depts = load_departments_from_file()
    # Check duplicate
    if any(d.get("name", "").lower() == dept_dict["name"].lower() for d in current_depts):
        raise HTTPException(status_code=400, detail="Department with this name already exists")
        
    current_depts.append(dept_dict)
    save_departments_to_file(current_depts)
    
    # Attempt to sync with Supabase (graceful fail if RLS)
    if supabase_client:
        try:
            supabase_client.table("departments").insert([dept_dict]).execute()
        except Exception as e:
            logger.warning(f"Supabase sync warning for new department: {e}")
            
    return dept_dict

@api_router.put("/departments/{dept_id}", response_model=Department)
async def update_department(dept_id: str, dept: DepartmentCreate):
    """Update an existing department"""
    current_depts = load_departments_from_file()
    found = False
    updated_item = None
    for i, d in enumerate(current_depts):
        if str(d.get("id")) == str(dept_id):
            current_depts[i] = {
                "id": dept_id,
                "name": dept.name.strip(),
                "description": dept.description.strip(),
                "icon": dept.icon or d.get("icon", "medical_services")
            }
            updated_item = current_depts[i]
            found = True
            break
            
    if not found:
        # Check if exists in Supabase
        updated_item = {
            "id": dept_id,
            "name": dept.name.strip(),
            "description": dept.description.strip(),
            "icon": dept.icon or "medical_services"
        }
        current_depts.append(updated_item)
        
    save_departments_to_file(current_depts)
    
    if supabase_client:
        try:
            supabase_client.table("departments").update({
                "name": dept.name.strip(),
                "description": dept.description.strip(),
                "icon": dept.icon
            }).eq("id", dept_id).execute()
        except Exception as e:
            logger.warning(f"Supabase sync warning for update department: {e}")
            
    return updated_item

@api_router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str):
    """Delete a department"""
    current_depts = load_departments_from_file()
    new_depts = [d for d in current_depts if str(d.get("id")) != str(dept_id)]
    save_departments_to_file(new_depts)
    
    if supabase_client:
        try:
            supabase_client.table("departments").delete().eq("id", dept_id).execute()
        except Exception as e:
            logger.warning(f"Supabase sync warning for delete department: {e}")
            
    return {"message": "Department deleted successfully"}


# =========================================================
# Service Routes (Dynamic Healthcare Services)
# =========================================================
@api_router.get("/services", response_model=List[Service])
async def get_services():
    """Get all healthcare services, sorted by display_order"""
    services = load_services_from_file()
    return sorted(services, key=lambda x: x.get("display_order", 0))

@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate):
    """Create a new service dynamically"""
    new_id = str(uuid.uuid4())
    service_dict = {
        "id": new_id,
        "title": service.title.strip(),
        "subtitle": service.subtitle.strip() if service.subtitle else "",
        "description": service.description.strip() if service.description else "",
        "icon": service.icon or "medical_services",
        "path": service.path or "/doctors",
        "badge": service.badge or "",
        "is_active": service.is_active if service.is_active is not None else True,
        "display_order": service.display_order if service.display_order is not None else 0,
        "bg_color": service.bg_color or "bg-blue-50 text-[#275B99]"
    }
    
    services = load_services_from_file()
    services.append(service_dict)
    save_services_to_file(services)
    return service_dict

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service: ServiceCreate):
    """Update an existing service"""
    services = load_services_from_file()
    found = False
    updated_item = None
    
    for i, s in enumerate(services):
        if str(s.get("id")) == str(service_id):
            services[i] = {
                "id": service_id,
                "title": service.title.strip(),
                "subtitle": service.subtitle.strip() if service.subtitle else "",
                "description": service.description.strip() if service.description else "",
                "icon": service.icon or s.get("icon", "medical_services"),
                "path": service.path or s.get("path", "/doctors"),
                "badge": service.badge if service.badge is not None else s.get("badge", ""),
                "is_active": service.is_active if service.is_active is not None else s.get("is_active", True),
                "display_order": service.display_order if service.display_order is not None else s.get("display_order", 0),
                "bg_color": service.bg_color or s.get("bg_color", "bg-blue-50 text-[#275B99]")
            }
            updated_item = services[i]
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Service not found")
        
    save_services_to_file(services)
    return updated_item

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    """Delete a service"""
    services = load_services_from_file()
    new_services = [s for s in services if str(s.get("id")) != str(service_id)]
    if len(new_services) == len(services):
        raise HTTPException(status_code=404, detail="Service not found")
    save_services_to_file(new_services)
    return {"message": "Service deleted successfully"}



# Doctor Routes
@api_router.get("/doctors", response_model=List[Doctor])
async def get_doctors(
    department: Optional[str] = Query(None, description="Filter by department"),
    available_today: Optional[bool] = Query(None, description="Filter by availability today"),
    search: Optional[str] = Query(None, description="Search by name or specialty")
):
    """Get all doctors with optional filters"""
    doctors = []
    if supabase_client:
        try:
            query = supabase_client.table("doctors").select("*")
            if department and department != "All Departments":
                query = query.eq("department", department)
            if available_today is not None:
                query = query.eq("available_today", available_today)
            res = query.execute()
            if res.data:
                doctors = [_normalize_doctor(d) for d in res.data]
        except Exception as e:
            logger.info(f"Supabase doctors query fallback to LOCAL_DB: {e}")

    if not doctors:
        doctors = [_normalize_doctor(d) for d in LOCAL_DB.get("doctors", [])]
        if department and department != "All Departments":
            doctors = [d for d in doctors if d.get("department", "").lower() == department.lower() or d.get("specialty", "").lower() == department.lower()]
        if available_today is not None:
            doctors = [d for d in doctors if d.get("available_today") == available_today]

    if search:
        search_lower = search.lower()
        doctors = [
            d for d in doctors
            if search_lower in d.get("name", "").lower()
            or search_lower in d.get("specialty", "").lower()
            or search_lower in d.get("title", "").lower()
        ]

    return doctors


@api_router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    """Get single doctor by ID"""
    if supabase_client:
        try:
            res = supabase_client.table("doctors").select("*").eq("id", doctor_id).execute()
            if res.data:
                return _normalize_doctor(res.data[0])
        except Exception as e:
            logger.info(f"Supabase doctor fetch fallback: {e}")

    for d in LOCAL_DB.get("doctors", []):
        if str(d.get("id")) == str(doctor_id):
            return _normalize_doctor(d)

    raise HTTPException(status_code=404, detail="Doctor not found")


@api_router.get("/doctors/{doctor_id}/available-slots")
async def get_available_slots(doctor_id: str, date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """Get available time slots for a doctor on a specific date"""
    morning_slots = [
        "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
        "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
        "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM"
    ]
    afternoon_slots = [
        "02:00 PM", "02:15 PM", "02:30 PM", "02:45 PM",
        "03:00 PM", "03:15 PM", "03:30 PM", "03:45 PM",
        "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM",
        "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM"
    ]
    
    booked_times = set()
    
    # 1. Check in local memory store
    for apt in LOCAL_DB.get("appointments", []):
        if (
            str(apt.get("doctor_id")) == str(doctor_id)
            and str(apt.get("appointment_date")) == str(date)
            and apt.get("status") != "cancelled"
        ):
            booked_times.add(apt.get("appointment_time"))

    # 2. Check Supabase if connected
    if supabase_client:
        try:
            res_apts = supabase_client.table("appointments").select("appointment_time, status").eq("doctor_id", doctor_id).eq("appointment_date", date).execute()
            for apt in (res_apts.data or []):
                if apt.get("status") != "cancelled":
                    booked_times.add(apt.get("appointment_time"))
        except Exception as e:
            logger.info(f"Supabase slots check fallback: {e}")

    return {
        "morning": [{"time": slot, "available": slot not in booked_times} for slot in morning_slots],
        "afternoon": [{"time": slot, "available": slot not in booked_times} for slot in afternoon_slots]
    }


# Appointment Routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    """Create a new appointment with conflict check and fallback support"""
    doctor = None
    
    # 1. Look up doctor in Supabase or LOCAL_DB
    if supabase_client:
        try:
            res_doc = supabase_client.table("doctors").select("*").eq("id", appointment_data.doctor_id).execute()
            if res_doc.data:
                doctor = res_doc.data[0]
        except Exception as e:
            logger.info(f"Supabase doctor lookup fallback: {e}")

    if not doctor:
        for d in LOCAL_DB.get("doctors", []):
            if str(d.get("id")) == str(appointment_data.doctor_id):
                doctor = d
                break

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # 2. Verify time slot is not already booked
    is_booked = False
    for apt in LOCAL_DB.get("appointments", []):
        if (
            str(apt.get("doctor_id")) == str(appointment_data.doctor_id)
            and str(apt.get("appointment_date")) == str(appointment_data.appointment_date)
            and str(apt.get("appointment_time")) == str(appointment_data.appointment_time)
            and apt.get("status") != "cancelled"
        ):
            is_booked = True
            break

    if not is_booked and supabase_client:
        try:
            res_existing = supabase_client.table("appointments").select("id, status").eq("doctor_id", appointment_data.doctor_id).eq("appointment_date", appointment_data.appointment_date).eq("appointment_time", appointment_data.appointment_time).execute()
            if res_existing.data and any(a.get("status") != "cancelled" for a in res_existing.data):
                is_booked = True
        except Exception as e:
            logger.info(f"Supabase existing appointment check fallback: {e}")

    if is_booked:
        raise HTTPException(status_code=400, detail="This time slot is already booked")

    # 3. Create appointment model
    consultation_fee = float(doctor.get("consultation_fee") or 150.0)
    appointment = Appointment(
        doctor_id=appointment_data.doctor_id,
        doctor_name=doctor.get("name") or doctor.get("doctor_name") or "Specialist Doctor",
        department=doctor.get("department") or doctor.get("specialty") or "General Medicine",
        appointment_date=appointment_data.appointment_date,
        appointment_time=appointment_data.appointment_time,
        patient=appointment_data.patient,
        consultation_fee=consultation_fee,
        status="confirmed"
    )

    # 4. Save to LOCAL_DB
    doc = appointment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    LOCAL_DB.setdefault("appointments", []).append(doc)

    # 5. Sync with Supabase if available
    if supabase_client:
        try:
            supabase_client.table("appointments").insert(doc).execute()
        except Exception as e:
            logger.warning(f"Supabase appointment insert fallback: {e}")

    return appointment


# =========================================================
# Automatic Notification Routes (Sender: 7893124722)
# Supports:
# 1. Booking Initiated (Before Doctor Confirmation)
# 2. Doctor Confirmation (After Doctor Confirmed)
# =========================================================

def _format_phone(phone_str: str) -> str:
    cleaned = "".join(filter(str.isdigit, str(phone_str)))
    if not cleaned:
        return "+917893124722"
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    elif not phone_str.startswith("+"):
        return f"+{cleaned}"
    return phone_str

def _format_doctor_name(doc_name: Optional[str]) -> str:
    if not doc_name:
        return "Specialist Physician"
    name = doc_name.strip()
    if name.lower().startswith("dr.") or name.lower().startswith("dr "):
        return name
    return f"Dr. {name}"

@api_router.post("/notify/booking-initiated")
async def notify_booking_initiated(req: BookingInitiatedNotificationRequest):
    """
    Sends automated WhatsApp and SMS notification to the patient when an appointment booking
    is initiated (before doctor confirmation), containing complete doctor details, hospital name,
    location, date/time slot, and fee from sender number 7893124722.
    """
    sender_phone = os.environ.get('SENDER_PHONE_NUMBER', req.sender_number or '7893124722')
    to_phone = _format_phone(req.patient_phone)
    apt_id = req.appointment_id or f"APT-{uuid.uuid4().hex[:8].upper()}"
    hosp_name = req.hospital_name or "Prana Main Medical Center"
    hosp_loc = req.hospital_location or "Road No. 72, Jubilee Hills, Hyderabad"
    doc_formatted = _format_doctor_name(req.doctor_name)
    doc_title = req.doctor_title or "Senior Medical Specialist"
    doc_spec = req.specialty or req.department or "Clinical Specialist"
    fee_str = f"₹{req.consultation_fee:,.2f}" if req.consultation_fee else "₹135.00"

    # 1. Compose Rich WhatsApp Message
    whatsapp_text = (
        f"🏥 *PRANA HEALTH NETWORK - BOOKING RECEIVED* ⏳\n\n"
        f"Dear *{req.patient_name}*,\n"
        f"Your appointment request has been successfully received and is awaiting doctor confirmation.\n\n"
        f"👨‍⚕️ *Doctor:* {doc_formatted}\n"
        f"🎓 *Designation:* {doc_title} ({doc_spec})\n"
        f"🏥 *Hospital:* {hosp_name}\n"
        f"📍 *Location:* {hosp_loc}\n"
        f"📅 *Date:* {req.appointment_date}\n"
        f"⏰ *Time Slot:* {req.appointment_time}\n"
        f"💰 *Estimated Fee:* {fee_str}\n"
        f"🆔 *Ref Number:* {apt_id}\n\n"
        f"📌 *Status:* ⏳ *Pending Doctor Review*\n"
        f"You will receive an automated confirmation message as soon as {doc_formatted} confirms your slot.\n\n"
        f"📞 *Hospital Helpline:* {sender_phone}\n"
        f"Thank you for choosing Prana Health Network."
    )

    # 2. Compose Concise SMS Message
    sms_text = (
        f"Prana Health: Dear {req.patient_name}, your appointment request with {doc_formatted} ({doc_spec}) "
        f"at {hosp_name}, {hosp_loc} on {req.appointment_date} at {req.appointment_time} is RECEIVED (Ref: {apt_id}). "
        f"Status: Pending Confirmation. Helpline: {sender_phone}."
    )

    # Dispatch via Twilio if configured
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_sms = os.environ.get('TWILIO_PHONE_NUMBER', f"+91{sender_phone}")
    from_whatsapp = os.environ.get('TWILIO_WHATSAPP_NUMBER', f"whatsapp:+91{sender_phone}")

    delivery_status = {"sms": "simulated", "whatsapp": "simulated"}
    
    if account_sid and auth_token and not account_sid.startswith('ACXXXX'):
        try:
            twilio_client = TwilioClient(account_sid, auth_token)
            if req.send_sms:
                try:
                    msg = twilio_client.messages.create(body=sms_text, from_=from_sms, to=to_phone)
                    delivery_status["sms"] = f"sent (sid: {msg.sid})"
                    logger.info(f"Initiation SMS sent to {to_phone}: {msg.sid}")
                except Exception as e:
                    delivery_status["sms"] = f"error: {str(e)}"
                    logger.error(f"Error sending Initiation SMS: {e}")

            if req.send_whatsapp:
                try:
                    wa_to = f"whatsapp:{to_phone}" if not to_phone.startswith("whatsapp:") else to_phone
                    msg = twilio_client.messages.create(body=whatsapp_text, from_=from_whatsapp, to=wa_to)
                    delivery_status["whatsapp"] = f"sent (sid: {msg.sid})"
                    logger.info(f"Initiation WhatsApp sent to {to_phone}: {msg.sid}")
                except Exception as e:
                    delivery_status["whatsapp"] = f"error: {str(e)}"
                    logger.error(f"Error sending Initiation WhatsApp: {e}")
        except Exception as e:
            logger.error(f"Twilio client init error: {e}")
            delivery_status["error"] = str(e)
    else:
        logger.info(f"[SIMULATED NOTIFICATION] Sent from {sender_phone} to {to_phone}:\nSMS: {sms_text}\nWhatsApp: {whatsapp_text}")

    # Record notification log
    log_entry = {
        "id": f"notif-{uuid.uuid4().hex[:8]}",
        "type": "booking_initiated",
        "patient_name": req.patient_name,
        "patient_phone": to_phone,
        "sender_number": sender_phone,
        "doctor_name": doc_formatted,
        "hospital_name": hosp_name,
        "hospital_location": hosp_loc,
        "appointment_date": req.appointment_date,
        "appointment_time": req.appointment_time,
        "appointment_id": apt_id,
        "sms_body": sms_text,
        "whatsapp_body": whatsapp_text,
        "delivery_status": delivery_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["notification_logs"].insert(0, log_entry)

    clean_digits = "".join(filter(str.isdigit, to_phone))
    encoded_wa = urllib.parse.quote(whatsapp_text)
    return {
        "success": True,
        "message": f"Booking initiated notification processed for {req.patient_name} ({to_phone}) from {sender_phone}",
        "appointment_id": apt_id,
        "sender_number": sender_phone,
        "delivery_status": delivery_status,
        "sms_body": sms_text,
        "whatsapp_body": whatsapp_text,
        "whatsapp_direct_url": f"https://wa.me/{clean_digits}?text={encoded_wa}"
    }


@api_router.post("/notify/doctor-confirm")
async def notify_doctor_confirm(req: DoctorConfirmationNotificationRequest):
    """
    Sends automated WhatsApp and SMS notification to the patient when the doctor confirms
    the appointment in the Doctor Portal, with full doctor details, hospital location, and confirmed slot.
    """
    sender_phone = os.environ.get('SENDER_PHONE_NUMBER', req.sender_number or '7893124722')
    to_phone = _format_phone(req.patient_phone)
    apt_id = req.appointment_id or f"CONF-{uuid.uuid4().hex[:8].upper()}"
    hosp_name = req.hospital_name or "Prana Main Medical Center"
    hosp_loc = req.hospital_location or "Road No. 72, Jubilee Hills, Hyderabad"
    doc_formatted = _format_doctor_name(req.doctor_name)
    doc_title = req.doctor_title or "Senior Medical Specialist"
    doc_spec = req.specialty or "Clinical Specialist"
    fee_str = f"₹{req.consultation_fee:,.2f}" if req.consultation_fee else "₹135.00"
    notes = req.notes or "Please arrive 15 minutes before your time slot."

    # 1. Compose Rich WhatsApp Message for Confirmation
    whatsapp_text = (
        f"✅ *APPOINTMENT CONFIRMED - PRANA HEALTH NETWORK* 🎉\n\n"
        f"Dear *{req.patient_name}*,\n"
        f"Your appointment has been *OFFICIALLY CONFIRMED* by {doc_formatted}.\n\n"
        f"👨‍⚕️ *Doctor:* {doc_formatted}\n"
        f"🎓 *Designation:* {doc_title} ({doc_spec})\n"
        f"🏥 *Hospital:* {hosp_name}\n"
        f"📍 *Location:* {hosp_loc}\n"
        f"📅 *Confirmed Date:* {req.appointment_date}\n"
        f"⏰ *Confirmed Slot:* {req.appointment_time}\n"
        f"💰 *Consultation Fee:* {fee_str}\n"
        f"🆔 *Appointment ID:* {apt_id}\n\n"
        f"📋 *Doctor's Instructions:* {notes}\n"
        f"📞 *Doctor Desk / Helpline:* {sender_phone}\n\n"
        f"We look forward to welcoming you for your consultation. Please bring any prior medical records."
    )

    # 2. Compose Concise SMS Message for Confirmation
    sms_text = (
        f"CONFIRMED: Dear {req.patient_name}, {doc_formatted} ({doc_spec}) has confirmed your appointment "
        f"at {hosp_name}, {hosp_loc} on {req.appointment_date} at {req.appointment_time}. "
        f"Appt ID: {apt_id}. Instructions: {notes} Helpline: {sender_phone}."
    )

    # Update appointment status in Supabase if exists
    if supabase_client and req.appointment_id:
        try:
            supabase_client.table("appointments").update({
                "status": "confirmed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", req.appointment_id).execute()
        except Exception as e:
            logger.info(f"Supabase appointment status update: {e}")

    # Update in LOCAL_DB if exists
    if req.appointment_id:
        for apt in LOCAL_DB.get("appointments", []):
            if str(apt.get("id")) == str(req.appointment_id):
                apt["status"] = "confirmed"
        for apt in LOCAL_DB.get("package_bookings", []):
            if str(apt.get("id")) == str(req.appointment_id):
                apt["status"] = "confirmed"

    # Dispatch via Twilio if configured
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_sms = os.environ.get('TWILIO_PHONE_NUMBER', f"+91{sender_phone}")
    from_whatsapp = os.environ.get('TWILIO_WHATSAPP_NUMBER', f"whatsapp:+91{sender_phone}")

    delivery_status = {"sms": "simulated", "whatsapp": "simulated"}

    if account_sid and auth_token and not account_sid.startswith('ACXXXX'):
        try:
            twilio_client = TwilioClient(account_sid, auth_token)
            if req.send_sms:
                try:
                    msg = twilio_client.messages.create(body=sms_text, from_=from_sms, to=to_phone)
                    delivery_status["sms"] = f"sent (sid: {msg.sid})"
                    logger.info(f"Confirmation SMS sent to {to_phone}: {msg.sid}")
                except Exception as e:
                    delivery_status["sms"] = f"error: {str(e)}"
                    logger.error(f"Error sending Confirmation SMS: {e}")

            if req.send_whatsapp:
                try:
                    wa_to = f"whatsapp:{to_phone}" if not to_phone.startswith("whatsapp:") else to_phone
                    msg = twilio_client.messages.create(body=whatsapp_text, from_=from_whatsapp, to=wa_to)
                    delivery_status["whatsapp"] = f"sent (sid: {msg.sid})"
                    logger.info(f"Confirmation WhatsApp sent to {to_phone}: {msg.sid}")
                except Exception as e:
                    delivery_status["whatsapp"] = f"error: {str(e)}"
                    logger.error(f"Error sending Confirmation WhatsApp: {e}")
        except Exception as e:
            logger.error(f"Twilio client confirmation error: {e}")
            delivery_status["error"] = str(e)
    else:
        logger.info(f"[SIMULATED CONFIRMATION] Sent from {sender_phone} to {to_phone}:\nSMS: {sms_text}\nWhatsApp: {whatsapp_text}")

    # Record notification log
    log_entry = {
        "id": f"notif-{uuid.uuid4().hex[:8]}",
        "type": "doctor_confirmation",
        "patient_name": req.patient_name,
        "patient_phone": to_phone,
        "sender_number": sender_phone,
        "doctor_name": doc_formatted,
        "hospital_name": hosp_name,
        "hospital_location": hosp_loc,
        "appointment_date": req.appointment_date,
        "appointment_time": req.appointment_time,
        "appointment_id": apt_id,
        "sms_body": sms_text,
        "whatsapp_body": whatsapp_text,
        "delivery_status": delivery_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["notification_logs"].insert(0, log_entry)

    clean_digits = "".join(filter(str.isdigit, to_phone))
    encoded_wa = urllib.parse.quote(whatsapp_text)
    return {
        "success": True,
        "message": f"Doctor confirmation notification sent to {req.patient_name} ({to_phone}) from {sender_phone}",
        "appointment_id": apt_id,
        "sender_number": sender_phone,
        "delivery_status": delivery_status,
        "sms_body": sms_text,
        "whatsapp_body": whatsapp_text,
        "whatsapp_direct_url": f"https://wa.me/{clean_digits}?text={encoded_wa}"
    }


@api_router.post("/send-notification")
async def send_notification(req: NotificationRequest):
    """General notification endpoint with dynamic parameters"""
    booking_req = BookingInitiatedNotificationRequest(
        patient_name=req.patient_name or "Valued Patient",
        patient_phone=req.phone,
        doctor_name=req.doctor_name,
        doctor_title=req.doctor_title or "Specialist Consultant",
        specialty=req.specialty or "Clinical Specialist",
        hospital_name=req.hospital_name or "Prana Medical Center",
        hospital_location=req.hospital_location or "Road No. 72, Jubilee Hills, Hyderabad",
        appointment_date=req.date,
        appointment_time=req.time,
        consultation_fee=req.consultation_fee or 135.0,
        appointment_id=req.appointment_id,
        sender_number=req.sender_number or "7893124722",
        send_sms=req.send_sms,
        send_whatsapp=req.send_whatsapp
    )
    return await notify_booking_initiated(booking_req)


@api_router.get("/notifications/logs")
async def get_notification_logs(limit: Optional[int] = 50):
    """Retrieve history of all sent automated SMS and WhatsApp messages"""
    logs = LOCAL_DB.get("notification_logs", [])
    return {
        "total": len(logs),
        "logs": logs[:limit]
    }

@api_router.post("/doctors")
async def create_doctor_form(
    full_name: str = Form(...),
    title: str = Form(...),
    speciality: str = Form(...),
    department: str = Form(...),
    experience: int = Form(...),
    schedule: str = Form(...),
    available: bool = Form(...),
    display_sections: List[str] = Form([]),
    image: Optional[UploadFile] = File(None),
    photo_url: Optional[str] = Form(None),
    hospital_id: Optional[str] = Form(None),
    hospital_name: Optional[str] = Form(None),
    location_address: Optional[str] = Form(None),
    consultation_fee: Optional[float] = Form(500.0)
):
    """Create a new doctor using Form Data with Hospital and Fee fields"""
    # Handle image upload
    final_photo_url = photo_url
    if image and image.filename:
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(await image.read())
        final_photo_url = f"/uploads/{file_name}"

    doctor_id = str(uuid.uuid4())
    schedule_details = {
        "days": [], 
        "start": "", 
        "end": "",
        "hospital_name": hospital_name or "",
        "location_address": location_address or ""
    }
    doctor_doc = {
        "id": doctor_id,
        "name": full_name,
        "title": title,
        "specialty": speciality,
        "department": department,
        "experience_years": experience,
        "languages": ["English", "Hindi"], # Default
        "schedule": schedule,
        "schedule_details": schedule_details,
        "rating": 5.0,
        "review_count": 0,
        "available_today": available,
        "photo_url": final_photo_url,
        "display_sections": display_sections,
        "consultation_fee": float(consultation_fee) if consultation_fee is not None else 500.0,
    }
    if hospital_id:
        doctor_doc["hospital_id"] = hospital_id
    
    LOCAL_DB["doctors"].append(doctor_doc)

    if supabase_client:
        try:
            supabase_client.table("doctors").insert(doctor_doc).execute()
        except Exception as e:
            logger.info(f"Supabase doctor insert fallback to LOCAL_DB: {e}")

    return {"message": "Doctor created successfully", "id": doctor_id}

@api_router.put("/doctors/{doctor_id}")
async def update_doctor_form(
    doctor_id: str,
    full_name: str = Form(...),
    title: str = Form(...),
    speciality: str = Form(...),
    department: str = Form(...),
    experience: int = Form(...),
    schedule: str = Form(...),
    available: bool = Form(...),
    display_sections: List[str] = Form([]),
    image: Optional[UploadFile] = File(None),
    photo_url: Optional[str] = Form(None),
    hospital_id: Optional[str] = Form(None),
    hospital_name: Optional[str] = Form(None),
    location_address: Optional[str] = Form(None),
    consultation_fee: Optional[float] = Form(None)
):
    """Update doctor using Form Data with Hospital and Fee fields"""
    # Handle image upload
    final_photo_url = photo_url
    if image and image.filename:
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(await image.read())
        final_photo_url = f"/uploads/{file_name}"

    # Get current doctor to preserve schedule_details
    curr_schedule_details: Dict[str, Any] = {}
    if supabase_client:
        try:
            curr_res = supabase_client.table("doctors").select("schedule_details").eq("id", doctor_id).execute()
            if curr_res.data and isinstance(curr_res.data[0], dict):
                curr_schedule_details = curr_res.data[0].get("schedule_details") or {}
        except Exception:
            pass

    if not curr_schedule_details:
        for d in LOCAL_DB.get("doctors", []):
            if str(d.get("id")) == str(doctor_id):
                curr_schedule_details = d.get("schedule_details") or {}
                break

    if hospital_name is not None:
        curr_schedule_details["hospital_name"] = hospital_name
    if location_address is not None:
        curr_schedule_details["location_address"] = location_address

    update_doc = {
        "name": full_name,
        "title": title,
        "specialty": speciality,
        "department": department,
        "experience_years": experience,
        "schedule": schedule,
        "available_today": available,
        "display_sections": display_sections,
        "schedule_details": curr_schedule_details
    }
    if consultation_fee is not None:
        update_doc["consultation_fee"] = float(consultation_fee)
    if hospital_id is not None:
        update_doc["hospital_id"] = hospital_id
    if final_photo_url:
        update_doc["photo_url"] = final_photo_url

    # Update in LOCAL_DB
    found = False
    for i, d in enumerate(LOCAL_DB.get("doctors", [])):
        if str(d.get("id")) == str(doctor_id):
            LOCAL_DB["doctors"][i] = {**d, **update_doc}
            found = True
            break

    if supabase_client:
        try:
            res = supabase_client.table("doctors").update(update_doc).eq("id", doctor_id).execute()
            if res.data:
                found = True
        except Exception as e:
            logger.info(f"Supabase doctor update fallback: {e}")

    if not found:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    return {"message": "Doctor updated successfully"}

@api_router.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str):
    """Delete doctor by ID"""
    LOCAL_DB["doctors"] = [d for d in LOCAL_DB.get("doctors", []) if str(d.get("id")) != str(doctor_id)]
    if supabase_client:
        try:
            supabase_client.table("doctors").delete().eq("id", doctor_id).execute()
        except Exception as e:
            logger.info(f"Supabase delete doctor fallback: {e}")
    return {"message": "Doctor deleted successfully"}

# ============= HERO SLIDER & APPOINTMENTS / PATIENTS ENDPOINTS =============

@api_router.get("/hero-slider")
async def get_hero_slider():
    """Get active hero slider images"""
    if supabase_client:
        try:
            res = supabase_client.table("hero_slider_images").select("*").eq("is_active", True).order("display_order").execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.info(f"Supabase hero slider fallback: {e}")
    return LOCAL_DB.get("hero_slider_images", [])

@api_router.get("/appointments")
async def get_appointments(
    doctor_id: Optional[str] = Query(None),
    patient_phone: Optional[str] = Query(None)
):
    """Get all appointments with optional filters"""
    if supabase_client:
        try:
            query = supabase_client.table("appointments").select("*").order("appointment_date", desc=True)
            if doctor_id:
                query = query.eq("doctor_id", doctor_id)
            if patient_phone:
                query = query.eq("patient_phone", patient_phone)
            res = query.execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.info(f"Supabase appointments fallback: {e}")
            
    apts = list(LOCAL_DB.get("appointments", []))
    if doctor_id:
        apts = [a for a in apts if a.get("doctor_id") == doctor_id]
    if patient_phone:
        apts = [a for a in apts if a.get("patient_phone") == patient_phone]
    return apts

@api_router.get("/patients")
async def get_patients():
    """Get all registered patients"""
    if supabase_client:
        try:
            res = supabase_client.table("patients").select("*").execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.info(f"Supabase patients fallback: {e}")
    return []

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Get aggregate statistics for the admin dashboard"""
    hospitals_count = len(LOCAL_DB.get("hospitals", []))
    doctors_count = len(LOCAL_DB.get("doctors", []))
    departments_count = len(LOCAL_DB.get("hospital_departments", [])) or len(DEFAULT_DEPARTMENTS)
    services_count = len(DEFAULT_SERVICES)
    insurance_count = len(LOCAL_DB.get("insurance_providers", []))
    packages_count = len(LOCAL_DB.get("diagnostic_packages", []))
    appointments_count = len(LOCAL_DB.get("appointments", []))
    patients_count = 0

    if supabase_client:
        try:
            h_res = supabase_client.table("hospitals").select("*", count="exact", head=True).execute()
            if h_res.count is not None: hospitals_count = h_res.count
            d_res = supabase_client.table("doctors").select("*", count="exact", head=True).execute()
            if d_res.count is not None: doctors_count = d_res.count
            a_res = supabase_client.table("appointments").select("*", count="exact", head=True).execute()
            if a_res.count is not None: appointments_count = a_res.count
            p_res = supabase_client.table("patients").select("*", count="exact", head=True).execute()
            if p_res.count is not None: patients_count = p_res.count
        except Exception as e:
            logger.info(f"Supabase admin stats fallback: {e}")

    return {
        "hospitals": hospitals_count,
        "doctors": doctors_count,
        "departments": departments_count,
        "services": services_count,
        "insurance": insurance_count,
        "packages": packages_count,
        "appointments": appointments_count,
        "patients": patients_count
    }

@api_router.get("/doctor/stats")
async def get_doctor_stats(doctor_id: Optional[str] = Query(None)):
    """Get aggregate statistics for the doctor portal"""
    total = 0
    confirmed = 0
    pending = 0
    if supabase_client and doctor_id:
        try:
            res = supabase_client.table("appointments").select("status").eq("doctor_id", doctor_id).execute()
            if res.data:
                total = len(res.data)
                confirmed = sum(1 for a in res.data if isinstance(a, dict) and a.get("status") == "confirmed")
                pending = sum(1 for a in res.data if isinstance(a, dict) and a.get("status") in ["pending", "requested"])
        except Exception as e:
            logger.info(f"Supabase doctor stats fallback: {e}")

    return {
        "total_appointments": total,
        "confirmed_appointments": confirmed,
        "pending_appointments": pending
    }

# Include the API router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
