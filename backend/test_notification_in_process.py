import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from server import app

client = TestClient(app)

def test_automated_notifications_in_process():
    # 1. Booking Initiated (Before Confirmation)
    payload_init = {
        "appointment_id": "APT-TEST-999",
        "patient_name": "Ravi Teja",
        "patient_phone": "7893124722",
        "doctor_name": "Dr. Rajesh Sharma",
        "doctor_title": "Senior Consultant Cardiologist",
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

    res1 = client.post("/api/notify/booking-initiated", json=payload_init)
    data1 = res1.json()
    assert res1.status_code == 200, f"Error: {res1.text}"
    assert data1["success"] is True
    assert data1["sender_number"] == "7893124722"
    assert "Dr. Rajesh Sharma" in data1["whatsapp_body"]
    assert "Dr. Dr." not in data1["whatsapp_body"]
    assert "Road No. 36, Jubilee Hills, Hyderabad" in data1["whatsapp_body"]
    assert "7893124722" in data1["whatsapp_body"]
    assert "10:30 AM" in data1["whatsapp_body"]

    # 2. Doctor Confirmation (After Confirmation)
    payload_conf = {
        "appointment_id": "APT-TEST-999",
        "patient_name": "Ravi Teja",
        "patient_phone": "7893124722",
        "doctor_name": "Dr. Rajesh Sharma",
        "doctor_title": "Senior Consultant Cardiologist",
        "specialty": "Cardiology",
        "hospital_name": "Prana Heart & Multispeciality Institute",
        "hospital_location": "Road No. 36, Jubilee Hills, Hyderabad",
        "appointment_date": "2026-09-15",
        "appointment_time": "10:30 AM",
        "consultation_fee": 1500.0,
        "notes": "Bring previous ECG reports. Arrive 15 min early.",
        "sender_number": "7893124722",
        "send_sms": True,
        "send_whatsapp": True
    }

    res2 = client.post("/api/notify/doctor-confirm", json=payload_conf)
    data2 = res2.json()
    assert res2.status_code == 200, f"Error: {res2.text}"
    assert data2["success"] is True
    assert data2["sender_number"] == "7893124722"
    assert "CONFIRMED" in data2["whatsapp_body"]
    assert "Dr. Rajesh Sharma" in data2["whatsapp_body"]
    assert "Dr. Dr." not in data2["whatsapp_body"]
    assert "Road No. 36, Jubilee Hills, Hyderabad" in data2["whatsapp_body"]
    assert "7893124722" in data2["whatsapp_body"]
    assert "Bring previous ECG reports" in data2["whatsapp_body"]

    # 3. Notification Logs
    res3 = client.get("/api/notifications/logs")
    data3 = res3.json()
    assert res3.status_code == 200
    assert data3["total"] >= 2

    # Save full unicode log to verification report
    with open("notification_verification_report.txt", "w", encoding="utf-8") as f:
        f.write("=== AUTOMATED NOTIFICATION VERIFICATION REPORT ===\n\n")
        f.write("[1] BOOKING INITIATED (BEFORE DOCTOR CONFIRMATION):\n")
        f.write("Status Code: 200 OK\n")
        f.write(f"Sender Phone: {data1['sender_number']}\n")
        f.write("WhatsApp Message:\n" + data1['whatsapp_body'] + "\n\n")
        f.write("SMS Message:\n" + data1['sms_body'] + "\n\n")
        f.write("Direct WhatsApp URL:\n" + data1['whatsapp_direct_url'] + "\n\n")
        f.write("-" * 50 + "\n\n")
        f.write("[2] DOCTOR CONFIRMATION (AFTER DOCTOR CONFIRMED):\n")
        f.write("Status Code: 200 OK\n")
        f.write(f"Sender Phone: {data2['sender_number']}\n")
        f.write("WhatsApp Message:\n" + data2['whatsapp_body'] + "\n\n")
        f.write("SMS Message:\n" + data2['sms_body'] + "\n\n")
        f.write("Direct WhatsApp URL:\n" + data2['whatsapp_direct_url'] + "\n\n")
        f.write("-" * 50 + "\n\n")
        f.write(f"[3] NOTIFICATION AUDIT LOGS: {data3['total']} total records stored.\n")

    print("ALL TESTS PASSED SUCCESSFULLY! Report written to notification_verification_report.txt")

if __name__ == "__main__":
    test_automated_notifications_in_process()
