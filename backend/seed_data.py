"""
Script to seed the database with sample data for Clinical Serenity
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
    print(f"Warning: Could not connect to Supabase: {e}")
    supabase_client = None


def seed_database():
    departments = [
        {
            "id": "dept-1",
            "name": "Cardiology",
            "description": "Comprehensive cardiovascular diagnostics and advanced heart care.",
            "icon": "medical_services"
        },
        {
            "id": "dept-2",
            "name": "Neurology",
            "description": "Precision neurology, brain mapping, and cognitive healthcare.",
            "icon": "psychology"
        },
        {
            "id": "dept-3",
            "name": "Pediatrics",
            "description": "Child wellness programs, neonatal care, and child development.",
            "icon": "child_care"
        },
        {
            "id": "dept-4",
            "name": "Orthopedics",
            "description": "Joint reconstruction, trauma care, and clinical orthopedics.",
            "icon": "orthopedics"
        },
        {
            "id": "dept-5",
            "name": "General Medicine",
            "description": "Primary medical guidance, metabolic management, and prevention.",
            "icon": "medication"
        },
        {
            "id": "dept-6",
            "name": "Gynecology",
            "description": "Maternal care, reproductive wellness, and advanced gynecology.",
            "icon": "female"
        }
    ]
    try:
        if supabase_client:
            print("Seeding departments...")
            supabase_client.table("departments").upsert(departments).execute()
            print(f"[OK] Seeded {len(departments)} departments")
        else:
            print("Notice: Supabase client not initialized. Skipped remote department seed.")
    except Exception as e:
        print(f"Notice: Supabase seeding for departments skipped: {e}")
    
    # Seed Doctors
    doctors = [
        {
            "id": "doc-1",
            "name": "Dr. Alaric Thorne",
            "title": "MD, FACC - Senior Cardiologist",
            "specialty": "Cardiology",
            "department": "Cardiology",
            "experience_years": 15,
            "languages": ["English", "Spanish", "French"],
            "schedule": "Mon - Fri: 09:00 - 14:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "09:00", "end": "14:00"},
            "rating": 4.8,
            "review_count": 156,
            "available_today": True,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAdOa23nNmk0HML_ndYsoYQ_sikF4xYfacjy4KAWn9CM_GXIFWwqJEHcOzKuTvFS7rwOWkBOCo18MAM7mU49PwnO5f71rm1V95KxN51SA0KqQI2LKbiqW3WXtHs43OMQw8-Vt0OQYuFmY0jyguzJwgOX-DDIgPDfm9BeCRq3NAqcZcPY1-7g7RukltzRvCV9Qgjtb_3De3OhLvCIPkeVKouBrrwJjTgJrGuuS9DgSarTlsPWZDkceJpDJDQI16QL9F2NVlAMjCmZXo",
            "about": "Academic physician specializing in non-invasive imaging, cardiac rhythm management, and cardiovascular risk containment."
        },
        {
            "id": "doc-2",
            "name": "Dr. Sarah Jenkins",
            "title": "PhD - Neurology Specialist",
            "specialty": "Neurology",
            "department": "Neurology",
            "experience_years": 12,
            "languages": ["English", "Portuguese"],
            "schedule": "Tue - Sat: 10:00 - 16:00",
            "schedule_details": {"days": ["Tue", "Wed", "Thu", "Fri", "Sat"], "start": "10:00", "end": "16:00"},
            "rating": 4.9,
            "review_count": 203,
            "available_today": False,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCCZ4pqPwzvKk2tztqUWdb5w9ZMvP0OFaw5onUj3YyybQbnXKMF_hgNpAYt8wbk8KWnjh9SwxUAvr-h75nhZfywKTjNz8TcISWKasrFNmVx9n0ej63d1R87HQxjJi6tbjHm0Ss2o1OgBUbc2wTroLT6qJN2sy4nearpen0IIUlahAuw8l1zDB6qh3tvlTNk2Xiakns5CzrRjBOS7ZyQellwy_a9bo8mKAJDpbymH5q27GdULIAiHND5yftXFl444xizndusCfILgRw",
            "about": "Focuses on translational neurosciences, neuromuscular pathology, and comprehensive electroencephalography diagnostics."
        },
        {
            "id": "doc-3",
            "name": "Dr. Robert Vance",
            "title": "MD - Orthopedic Surgeon",
            "specialty": "Orthopedics",
            "department": "Orthopedics",
            "experience_years": 18,
            "languages": ["English", "German"],
            "schedule": "Mon - Wed: 08:00 - 12:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed"], "start": "08:00", "end": "12:00"},
            "rating": 4.7,
            "review_count": 142,
            "available_today": True,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAx8MP2Ei5bSteUPrjdk9KSDSVJ6nX7HZcFV_n3voZ9_loNAB9-N_W4EqJHTVjsALOJKAEIbqXuYaucvmjsABGPG5QH79s4VG7F2tCzRxsIVWnxbmFdgYSuKFz5eog99J4glfYnZAXzEbc9E79DNAP7T9XT09Y-FhWMk4HLTTomnsb9Jb3_h3naIJlr5g_GbHlvLqCj1phEgliyu_tR9fAr91IT6FieXygX97SCmLiH1krC-GaCJJDE6rUxJj6yTdEhR8nvAJDx_Gk",
            "about": "Specializes in arthroscopic reconstructive surgery, total joint revisions, and advanced bone preservation protocols."
        },
        {
            "id": "doc-4",
            "name": "Dr. Julian Sterling",
            "title": "MD, FACC - Senior Cardiologist",
            "specialty": "Cardiology",
            "department": "Cardiology",
            "experience_years": 20,
            "languages": ["English", "Spanish", "French"],
            "schedule": "Mon - Fri: 09:00 - 16:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "09:00", "end": "16:00"},
            "rating": 4.8,
            "review_count": 187,
            "available_today": True,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBgZY3Rkw349Nx_k69R6TdzW-bGTLkoytKCuP7zB6mak1TIA_YjlPWgzY9ZCZsaidSiNRsfRP4U88RmIbOHugwXxDoeDNo8wq11lhGqcouoxP-DHIgyKWyZ4Etho8To03X0O8DTN8Q4QcuyGPJ9Xf65nJVlx8yUtXVr9O1LSIAln-3KpFmi97LbSWt0FXnYyj0LdJxPH2Es4ZXN22nFhc__cNGEtNbMUXZdH6mSK5YTfmddsg36e_qfSJMqeHJwUckQufd5DifWSXU",
            "about": "Renowned clinical board member specializing in microvascular bypass surgery and chronic cardiac failure therapy."
        },
        {
            "id": "doc-5",
            "name": "Dr. Elena Rodriguez",
            "title": "PhD - Neurology Specialist",
            "specialty": "Neurology",
            "department": "Neurology",
            "experience_years": 14,
            "languages": ["English", "Portuguese"],
            "schedule": "Mon - Fri: 08:00 - 14:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "08:00", "end": "14:00"},
            "rating": 4.9,
            "review_count": 165,
            "available_today": False,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDZogRdIZGwZGPrJ0Oo0M5_lU0GQZG2EcRcm4EqUoPGyDQDFcU3EqMxUV9nUqYxlNsFIwkJhTYwj2OOsunXmfUgZVFsEHo2Lm4eMtux8R9-qVBbepHSe9QSAuooJKRlyUcGfRjh2PNV_pyYFyauRwl0XcQvsU-z4JLJC-3J-dF9DaNAxR0mw1sQ4vbaMTNsZPktYZWmrILbbj-qDWOqiRSLviIip6Snp4QJC5Wb8-htEESyJKWPeUdv0MXq0zt870WXajncBLcHu7I",
            "about": "Dedicated researcher in clinical neuro-therapeutics, pediatric epilepsy control, and molecular neuro-pathology."
        },
        {
            "id": "doc-6",
            "name": "Dr. Marcus Thorne",
            "title": "MD - Pediatrics & Neonatal Care",
            "specialty": "Pediatrics",
            "department": "Pediatrics",
            "experience_years": 10,
            "languages": ["English", "German"],
            "schedule": "Mon - Fri: 11:00 - 19:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "start": "11:00", "end": "19:00"},
            "rating": 4.9,
            "review_count": 234,
            "available_today": True,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDoDK2ZMuGmJvd5lEOIU-yeH3oBPKY1Mh8SuVUTr4BItUtqC3og0UdK5Bo0jyAhB8pJndjOI-unDhs3vAJdhJqzlLlK9jmHsg9AQRUHKdIx78TU-yUMiBm-Zu-WgMtlOXfJMoEvJKfuqXTUKLuKclTHkS2W_q2bBl54Mx64ME4GEzlKfLhUdX804jf_yDYTpVS_DrC5ivtPT99SOnXPfzViDI6eawWE3Ba6ATqzlUu11gLD7-4otye8E9elMPofOzKf3Mtp4rFdwFQ",
            "about": "Pediatric department head leading pediatric critical care, congenital disease management, and child developmental milestones."
        },
        {
            "id": "doc-7",
            "name": "Dr. Amelia Chen",
            "title": "MD - General Medicine",
            "specialty": "General Medicine",
            "department": "General Medicine",
            "experience_years": 8,
            "languages": ["English", "Mandarin", "Cantonese"],
            "schedule": "Mon - Sat: 09:00 - 15:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "start": "09:00", "end": "15:00"},
            "rating": 4.7,
            "review_count": 98,
            "available_today": True,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCNxB-58vyINzHuEAGmGNDZlVm06su4o2tbpVxzxW69kFWyorsbjvb4opTudRYzSXx3reyR56xzJwWWnqsz24cc1OoWVMJhepsFuU8L7ispdAAuRq5yr6ASJAHyyGmn1Y496F1ph7TCzS3xMoKjQMdmJKIUZkP-48wIJ2KeRZmEcQ80AymYuUnh6Mzc3OYJRjtKHCIt3oTRqr82IIY3G4VSofWF8ykCqakl8pL4gzDAfSXUjEENZl9gDAAa9IxwDQosS3K_qsTpihA",
            "about": "Integrative care specialist focused on evidence-based lifestyle modifications and diagnostic screening audits."
        },
        {
            "id": "doc-8",
            "name": "Dr. Priya Sharma",
            "title": "MD - Gynecology & Obstetrics",
            "specialty": "Gynecology",
            "department": "Gynecology",
            "experience_years": 13,
            "languages": ["English", "Hindi", "Punjabi"],
            "schedule": "Tue - Sat: 10:00 - 17:00",
            "schedule_details": {"days": ["Tue", "Wed", "Thu", "Fri", "Sat"], "start": "10:00", "end": "17:00"},
            "rating": 4.9,
            "review_count": 276,
            "available_today": False,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAoSRowFL9j4q9tKK4qSjyFUvfgcY-meAwPjhxPEMXrvlk7yYkZ3M0tl7U3jK0Wf7UMu75BiZq4Q0Z8xmnx2cyvGsdEy9t7yJ1vTp9aMKwG3nGoX_kFe4H50Gzu7eRqH1chck9bxHMsNARtLc3qJCKuGPz90LL0lIdXq_0WxHmQEI1oJNtSQSu4jxhPGrrLfSztLPH-M1vpykiu74fqD0jCVld0v4kkr5wZd8ceBCgPZa2gvOSNDvseO1sTrKvPMxVYPS9iZCSNR2s",
            "about": "Specializes in reproductive endocrinology, high-risk obstetrics, and laparoscopic gynecological microsurgery."
        },
        {
            "id": "doc-9",
            "name": "Dr. James McKenzie",
            "title": "MD - Orthopedic Surgeon",
            "specialty": "Sports Medicine",
            "department": "Orthopedics",
            "experience_years": 16,
            "languages": ["English"],
            "schedule": "Mon - Thu: 07:00 - 14:00",
            "schedule_details": {"days": ["Mon", "Tue", "Wed", "Thu"], "start": "07:00", "end": "14:00"},
            "rating": 4.8,
            "review_count": 189,
            "available_today": True,
            "photo_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBgZY3Rkw349Nx_k69R6TdzW-bGTLkoytKCuP7zB6mak1TIA_YjlPWgzY9ZCZsaidSiNRsfRP4U88RmIbOHugwXxDoeDNo8wq11lhGqcouoxP-DHIgyKWyZ4Etho8To03X0O8DTN8Q4QcuyGPJ9Xf65nJVlx8yUtXVr9O1LSIAln-3KpFmi97LbSWt0FXnYyj0LdJxPH2Es4ZXN22nFhc__cNGEtNbMUXZdH6mSK5YTfmddsg36e_qfSJMqeHJwUckQufd5DifWSXU",
            "about": "Orthopedic clinical consultant managing sports trauma recovery, ligament reconstruction, and tissue engineering."
        }
    ]
    try:
        if supabase_client:
            print("Seeding doctors...")
            supabase_client.table("doctors").upsert(doctors).execute()
            print(f"[OK] Seeded {len(doctors)} doctors")
        else:
            print("Notice: Supabase client not initialized. Skipped remote doctor seed.")
    except Exception as e:
        print(f"Notice: Supabase seeding for doctors skipped: {e}")
    
    print("[OK] Database seed process finished.")


if __name__ == "__main__":
    print("Starting database seed...")
    seed_database()
