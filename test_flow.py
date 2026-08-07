import os
import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_flow():
    print("Testing flow...")

    # Login Teacher
    print("2. Teacher Login...")
    r = requests.post(f"{BASE_URL}/auth/token/", json={"email": "teacher@test.com", "password": "Password123!"})
    if r.status_code == 200:
        teacher_token = r.json()["access"]
        print("[PASS] Teacher Login")
    else:
        print(f"[FAIL] Teacher Login: {r.text}")
        return

    headers = {"Authorization": f"Bearer {teacher_token}"}

    import uuid
    group_name = f"Test Group {uuid.uuid4().hex[:6]}"
    r = requests.post(f"{BASE_URL}/classrooms/groups/", json={"name": group_name, "description": "Test"}, headers=headers)
    if r.status_code == 201:
        group_id = r.json()["id"]
        print("[PASS] Group Create")
    else:
        print(f"[FAIL] Group Create: {r.text}")
        return

    # Create Student
    print("4. Create Student...")
    student_data = {
        "first_name": "Student",
        "last_name": "One",
        "group_id": group_id,
        "phone_number": "+998901234567"
    }
    r = requests.post(f"{BASE_URL}/classrooms/students/", json=student_data, headers=headers)
    if r.status_code == 201:
        student = r.json()
        print("Student Response:", student)
        student_id = student["id"]
    student_email = student.get("email")
    student_password = student.get("password")

    # Create Assignment
    print("5. Create Assignment...")
    assignment_data = {
        "title": "Test Assignment",
        "description": "Solve 2+2",
        "group": group_id,
        "deadline": "2030-01-01T00:00:00Z"
    }
    r = requests.post(f"{BASE_URL}/assignments/teacher/assignments/", json=assignment_data, headers=headers)
    if r.status_code == 201:
        assignment_id = r.json()["id"]
        print("[PASS] Assignment Create")
    else:
        print(f"[FAIL] Assignment Create: {r.text}")
        return

    # Login Student
    print("6. Student Login...")
    r = requests.post(f"{BASE_URL}/auth/token/", json={"email": student_email, "password": student_password})
    if r.status_code == 200:
        student_token = r.json()["access"]
        print("[PASS] Student Login")
    else:
        print(f"[FAIL] Student Login: {r.text}")
        return

    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Upload Homework
    print("7. Upload Homework...")
    # Create a dummy image
    import base64
    valid_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
    with open("dummy.png", "wb") as f:
        f.write(base64.b64decode(valid_png_base64))
    
    data = {"assignment": assignment_id}
    r = requests.post(f"{BASE_URL}/assignments/student/submissions/", json=data, headers=student_headers)
    if r.status_code == 201:
        submission_id = r.json()["id"]
        print("[PASS] Homework Create")
    else:
        print(f"[FAIL] Homework Create: {r.text}")
        return

    # Upload Images
    print("7.5. Upload Images...")
    files = {"images": open("dummy.png", "rb")}
    r = requests.post(f"{BASE_URL}/assignments/student/submissions/{submission_id}/upload/", files=files, headers=student_headers)
    if r.status_code == 200:
        print("[PASS] Homework Upload Images")
    else:
        print(f"[FAIL] Homework Upload Images: {r.text}")
        return
    
    # Wait for AI Evaluation (Since it's eager, it might be done already, or we poll)
    print("8. Check AI Evaluation...")
    time.sleep(2)
    r = requests.get(f"{BASE_URL}/assignments/student/submissions/{submission_id}/", headers=student_headers)
    if r.status_code == 200:
        submission = r.json()
        print("Submission State:", submission)
        if submission.get("status") == "checked":
            print("[PASS] AI Evaluation Complete")
        else:
            print("[FAIL] AI Evaluation not completed yet, maybe celery failed or it's not eager")
    else:
        print(f"[FAIL] AI Evaluation Check: {r.text}")
    
    print("9. Dashboard API Check...")
    r = requests.get(f"{BASE_URL}/dashboard/teacher/", headers=headers)
    if r.status_code == 200:
        print("[PASS] Dashboard Updated")
    else:
        print(f"[FAIL] Dashboard API Check: {r.text}")

if __name__ == "__main__":
    test_flow()
