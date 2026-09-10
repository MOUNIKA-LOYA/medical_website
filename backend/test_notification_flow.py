import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def get_client():
    try:
        r = requests.get(f"{BASE_URL}/api/notifications/logs", timeout=1)
        if r.status_code == 200:
            print("Using Live Server at http://127.0.0.1:8000")
            return requests
    except Exception:
        pass
    
    print("Live server not running; using in-memory FastAPI TestClient")
    from fastapi.testclient import TestClient
    from server import app
    return TestClient(app)

def test_full_notification_flow():
    print("=" * 60)
    print("TESTING FULL AUTOMATED NOTIFICATION FLOW (SENDER: 7893124722)")
    print("=" * 60)

    client = get_client()
    is_testclient = not hasattr(client, 'Session') and not isinstance(client, type(requests))
    failures = []

    # 1. Test Booking Initiated Notification (Before Confirmation)
    init_payload = {
        "appointment_id": "APT-TEST-001",
        "patient_name": "Ravi Teja",
        "patient_phone": "9876543210",
        "doctor_name": "Dr. Rajesh Sharma",
        "doctor_title": "Senior Consultant Interventional Cardiologist",
        "specialty": "Cardiology",
        "department": "Cardiology",
        "hospital_name": "Prana Heart & Multispeciality Institute",
        "hospital_location": "Road No. 36, Jubilee Hills, Hyderabad",
        "appointment_date": "2026-09-15",
        "appointment_time": "10:30 AM",
        "consultation_fee": 1500.0,
        "sender_number": "7893124722",
        "send_sms": True,
        "send_whatsapp": True
    }

    print("\n[STEP 1] Testing /api/notify/booking-initiated (Before Doctor Confirmation)...")
    try:
        url = "/api/notify/booking-initiated" if is_testclient else f"{BASE_URL}/api/notify/booking-initiated"
        r1 = client.post(url, json=init_payload)
        print(f"Status Code: {r1.status_code}")
        data1 = r1.json()
        print(f"Success: {data1.get('success')}")
        print(f"Sender: {data1.get('sender_number')}")
        assert r1.status_code == 200, f"Expected 200, got {r1.status_code}"
        assert data1.get("sender_number") == "7893124722"
        assert "Dr. Rajesh Sharma" in data1.get("whatsapp_body")
        assert "Road No. 36, Jubilee Hills, Hyderabad" in data1.get("whatsapp_body")
        assert "7893124722" in data1.get("whatsapp_body")
        print(">>> STEP 1 PASSED!")
    except Exception as e:
        print(f"FAILED Step 1: {e}")
        failures.append(f"Step 1: {e}")

    # 2. Test Doctor Confirmation Notification (After Doctor Confirmation)
    conf_payload = {
        "appointment_id": "APT-TEST-001",
        "patient_name": "Ravi Teja",
        "patient_phone": "9876543210",
        "doctor_name": "Dr. Rajesh Sharma",
        "doctor_title": "Senior Consultant Interventional Cardiologist",
        "specialty": "Cardiology",
        "hospital_name": "Prana Heart & Multispeciality Institute",
        "hospital_location": "Road No. 36, Jubilee Hills, Hyderabad",
        "appointment_date": "2026-09-15",
        "appointment_time": "10:30 AM",
        "consultation_fee": 1500.0,
        "notes": "Fast 8 hours prior for lipid and ECG evaluation. Arrive 15 minutes early.",
        "sender_number": "7893124722",
        "send_sms": True,
        "send_whatsapp": True
    }

    print("\n[STEP 2] Testing /api/notify/doctor-confirm (After Doctor Confirmed Appointment)...")
    try:
        url = "/api/notify/doctor-confirm" if is_testclient else f"{BASE_URL}/api/notify/doctor-confirm"
        r2 = client.post(url, json=conf_payload)
        print(f"Status Code: {r2.status_code}")
        data2 = r2.json()
        print(f"Success: {data2.get('success')}")
        print(f"Sender: {data2.get('sender_number')}")
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}"
        assert data2.get("sender_number") == "7893124722"
        assert "CONFIRMED" in data2.get("whatsapp_body")
        assert "Dr. Rajesh Sharma" in data2.get("whatsapp_body")
        assert "Road No. 36, Jubilee Hills, Hyderabad" in data2.get("whatsapp_body")
        assert "7893124722" in data2.get("whatsapp_body")
        print(">>> STEP 2 PASSED!")
    except Exception as e:
        print(f"FAILED Step 2: {e}")
        failures.append(f"Step 2: {e}")

    # 3. Test Notification Logs Retrieval
    print("\n[STEP 3] Testing /api/notifications/logs...")
    try:
        url = "/api/notifications/logs" if is_testclient else f"{BASE_URL}/api/notifications/logs"
        r3 = client.get(url)
        print(f"Status Code: {r3.status_code}")
        data3 = r3.json()
        print(f"Total Logs Count: {data3.get('total')}")
        logs = data3.get("logs", [])
        if logs:
            print(f"Latest Log Type: {logs[0].get('type')} for {logs[0].get('patient_name')} ({logs[0].get('patient_phone')})")
        assert r3.status_code == 200
        assert data3.get("total") >= 2
        print(">>> STEP 3 PASSED!")
    except Exception as e:
        print(f"FAILED Step 3: {e}")
        failures.append(f"Step 3: {e}")

    print("\n" + "=" * 60)
    if not failures:
        print("ALL AUTOMATED NOTIFICATION TESTS COMPLETED SUCCESSFULLY!")
    else:
        print(f"NOTIFICATION TESTS COMPLETED WITH {len(failures)} FAILURE(S):")
        for f in failures:
            print(f" - {f}")
        sys.exit(1)
    print("=" * 60)

if __name__ == "__main__":
    test_full_notification_flow()
