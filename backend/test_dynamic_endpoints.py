from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def run_tests():
    print("--- Starting Dynamic Endpoints Test ---")
    
    # 1. Test GET /api/departments
    res = client.get("/api/departments")
    print(f"GET /api/departments status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    initial_depts = res.json()
    print(f"Initial departments count: {len(initial_depts)}")
    
    # 2. Test POST /api/departments
    new_dept_payload = {
        "name": "Test Dynamic Department",
        "description": "Department created for automated verification",
        "icon": "HeartPulse",
        "is_active": True
    }
    res = client.post("/api/departments", json=new_dept_payload)
    print(f"POST /api/departments status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    created_dept = res.json()
    assert created_dept["name"] == "Test Dynamic Department"
    dept_id = created_dept["id"]
    print(f"Created dept ID: {dept_id}")
    
    # 3. Test PUT /api/departments/{id}
    update_dept_payload = {
        "name": "Updated Dynamic Department",
        "description": "Updated description",
        "icon": "Activity",
        "is_active": True
    }
    res = client.put(f"/api/departments/{dept_id}", json=update_dept_payload)
    print(f"PUT /api/departments/{dept_id} status: {res.status_code}")
    assert res.status_code == 200
    assert res.json()["name"] == "Updated Dynamic Department"
    
    # 4. Test DELETE /api/departments/{id}
    res = client.delete(f"/api/departments/{dept_id}")
    print(f"DELETE /api/departments/{dept_id} status: {res.status_code}")
    assert res.status_code == 200
    
    # 5. Test GET /api/services
    res = client.get("/api/services")
    print(f"GET /api/services status: {res.status_code}")
    assert res.status_code == 200
    services = res.json()
    print(f"Initial services count: {len(services)}")
    
    # 6. Test POST /api/services
    new_service_payload = {
        "title": "Home ECG Diagnostics",
        "subtitle": "At-home cardiac monitoring",
        "description": "State-of-the-art 12-lead portable ECG at your doorstep.",
        "icon": "Activity",
        "path": "/ecg-home",
        "is_active": True,
        "order": 99
    }
    res = client.post("/api/services", json=new_service_payload)
    print(f"POST /api/services status: {res.status_code}")
    assert res.status_code == 200
    created_service = res.json()
    assert created_service["title"] == "Home ECG Diagnostics"
    service_id = created_service["id"]
    print(f"Created service ID: {service_id}")
    
    # 7. Test PUT /api/services/{id}
    update_service_payload = {
        "title": "Home ECG Diagnostics & Echo",
        "subtitle": "At-home cardiac diagnostic suite",
        "description": "Portable 12-lead ECG and 2D Echo.",
        "icon": "Heart",
        "path": "/ecg-echo-home",
        "is_active": True,
        "order": 1
    }
    res = client.put(f"/api/services/{service_id}", json=update_service_payload)
    print(f"PUT /api/services/{service_id} status: {res.status_code}")
    assert res.status_code == 200
    assert res.json()["title"] == "Home ECG Diagnostics & Echo"
    
    # 8. Test DELETE /api/services/{id}
    res = client.delete(f"/api/services/{service_id}")
    print(f"DELETE /api/services/{service_id} status: {res.status_code}")
    assert res.status_code == 200
    
    # 9. Test Doctor creation with hospital_name, location_address, consultation_fee
    doctor_payload = {
        "full_name": "Dr. Verification Test",
        "title": "Senior Cardiologist",
        "speciality": "Cardiology",
        "department": "Cardiology",
        "experience": 12,
        "schedule": "Mon, Wed, Fri 10:00 AM - 04:00 PM",
        "available": True,
        "consultation_fee": 850.0,
        "hospital_name": "Apollo Super Specialty Hospital",
        "location_address": "Road No. 72, Jubilee Hills, Hyderabad"
    }
    res = client.post("/api/doctors", data=doctor_payload)
    print(f"POST /api/doctors status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    res_data = res.json()
    print(f"Doctor response: {res_data}")
    assert res_data.get("message") == "Doctor created successfully"
    created_id = res_data.get("id")
    print(f"Created Doctor ID: {created_id}")

    # Verify retrieval from /api/doctors/{id} or /api/doctors
    doc_res = client.get(f"/api/doctors/{created_id}")
    print(f"GET /api/doctors/{created_id} status: {doc_res.status_code}")
    if doc_res.status_code == 200:
        doc_details = doc_res.json()
        print(f"Retrieved Doctor Name: {doc_details.get('name')}")
        print(f"Retrieved Doctor Fee: {doc_details.get('consultation_fee')}")
        print(f"Retrieved Doctor Schedule Details: {doc_details.get('schedule_details')}")
        assert doc_details.get("consultation_fee") == 850.0
        assert doc_details.get("schedule_details", {}).get("hospital_name") == "Apollo Super Specialty Hospital"
        assert doc_details.get("schedule_details", {}).get("location_address") == "Road No. 72, Jubilee Hills, Hyderabad"
    
    # 10. Clean up created test doctor
    if created_id:
        del_res = client.delete(f"/api/doctors/{created_id}")
        print(f"Cleaned up test doctor ID {created_id}, status: {del_res.status_code}")
        
    print("\nALL DYNAMIC ENDPOINT VERIFICATION TESTS PASSED SUCCESSFULLY! [PASSED]")

if __name__ == "__main__":
    run_tests()
