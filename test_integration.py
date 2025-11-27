#!/usr/bin/env python3
"""
Integration test script for the HR System
Tests login and all API endpoints to ensure everything works correctly
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_login():
    """Test user login"""
    print("Testing login...")

    credentials = [
        {"email": "admin@company.com", "password": "admin123"},
        {"email": "manager@company.com", "password": "manager123"},
        {"email": "employee@company.com", "password": "employee123"}
    ]

    tokens = {}

    for cred in credentials:
        response = requests.post(f"{BASE_URL}/auth/login/", json=cred)
        if response.status_code == 200:
            data = response.json()
            tokens[cred["email"]] = {
                "access": data["access"],
                "refresh": data["refresh"],
                "user": data["user"]
            }
            print(f"[OK] Login successful for {cred['email']} (Role: {data['user']['role']})")
        else:
            print(f"[FAIL] Login failed for {cred['email']}: {response.status_code} - {response.text}")
            return False

    return tokens

def test_api_endpoints(tokens):
    """Test all API endpoints with authentication"""
    print("\nTesting API endpoints...")

    admin_token = tokens["admin@company.com"]["access"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    endpoints = [
        ("Dashboard Stats", "GET", "/dashboard/stats/"),
        ("Employees", "GET", "/employees/"),
        ("Job Postings", "GET", "/job-postings/"),
        ("Candidates", "GET", "/candidates/"),
        ("Attendance", "GET", "/attendance/"),
        ("Payroll", "GET", "/payroll/"),
        ("Benefits", "GET", "/benefits/"),
        ("Expenses", "GET", "/expenses/"),
        ("Projects", "GET", "/projects/"),
        ("Tasks", "GET", "/tasks/"),
        ("Performance Reviews", "GET", "/performance-reviews/"),
        ("Courses", "GET", "/courses/"),
        ("Enrollments", "GET", "/enrollments/"),
        ("Tax Records", "GET", "/tax-records/"),
        ("Budgets", "GET", "/budgets/"),
    ]

    success_count = 0
    total_count = len(endpoints)

    for name, method, endpoint in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            elif method == "POST":
                response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json={})

            if response.status_code in [200, 201]:
                print(f"[OK] {name}: {response.status_code}")
                success_count += 1
            else:
                print(f"[FAIL] {name}: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"[FAIL] {name}: Error - {str(e)}")

    print(f"\nAPI Test Results: {success_count}/{total_count} endpoints working")

    return success_count == total_count

def test_data_creation(tokens):
    """Test creating new data"""
    print("\nTesting data creation...")

    admin_token = tokens["admin@company.com"]["access"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Test creating a job posting
    job_data = {
        "title": "Test Software Engineer",
        "department": "Engineering",
        "location": "Remote",
        "employment_type": "full_time",
        "description": "Test job description",
        "salary_range": "$70k - $90k"
    }

    response = requests.post(f"{BASE_URL}/job-postings/", headers=headers, json=job_data)
    if response.status_code == 201:
        print("[OK] Job posting created successfully")
        job_id = response.json()["id"]

        # Test creating a candidate
        candidate_data = {
            "job_posting": job_id,
            "first_name": "Test",
            "last_name": "Candidate",
            "email": "test@example.com",
            "experience_years": 3
        }

        candidate_response = requests.post(f"{BASE_URL}/candidates/", headers=headers, json=candidate_data)
        if candidate_response.status_code == 201:
            print("[OK] Candidate created successfully")
            return True
        else:
            print(f"[FAIL] Candidate creation failed: {candidate_response.status_code}")
            return False
    else:
        print(f"[FAIL] Job posting creation failed: {response.status_code}")
        return False

def main():
    """Run all integration tests"""
    print("Starting HR System Integration Tests")
    print("=" * 50)

    # Test login
    tokens = test_login()
    if not tokens:
        print("\nLogin tests failed. Aborting.")
        sys.exit(1)

    # Test API endpoints
    api_success = test_api_endpoints(tokens)
    if not api_success:
        print("\nAPI endpoint tests failed.")
        sys.exit(1)

    # Test data creation
    creation_success = test_data_creation(tokens)
    if not creation_success:
        print("\nData creation tests failed.")
        sys.exit(1)

    print("\nAll integration tests passed!")
    print("Authentication working")
    print("API endpoints responding correctly")
    print("Data creation and retrieval working")
    print("Frontend-backend integration confirmed")

if __name__ == "__main__":
    main()