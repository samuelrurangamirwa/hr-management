#!/usr/bin/env python
"""
Test script to verify deployment readiness.
Run this before deploying to ensure everything is configured correctly.
"""
import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hr_backend.settings')
django.setup()

from django.conf import settings
from django.core.management import execute_from_command_line

def test_settings():
    """Test Django settings configuration"""
    print("🔧 Testing Django settings...")

    # Check critical settings
    assert not settings.DEBUG, "DEBUG should be False in production"
    assert settings.SECRET_KEY, "SECRET_KEY must be set"
    assert 'DATABASES' in settings.__dict__, "DATABASES must be configured"

    print("✅ Django settings look good!")

def test_database():
    """Test database connectivity"""
    print("🗄️  Testing database connection...")

    from django.db import connection
    try:
        cursor = connection.cursor()
        # Test SQLite-specific query
        cursor.execute("SELECT sqlite_version()")
        result = cursor.fetchone()
        print(f"✅ SQLite database connection successful! Version: {result[0]}")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

def test_models():
    """Test that all models can be imported and queried"""
    print("📋 Testing models...")

    try:
        from hr_app.models import User, Employee, Payroll, Task

        # Test basic queries
        user_count = User.objects.count()
        employee_count = Employee.objects.count()

        print(f"✅ Models working - {user_count} users, {employee_count} employees")
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        raise

def test_api_endpoints():
    """Test basic API endpoints"""
    print("🌐 Testing API endpoints...")

    # This would normally test against a running server
    # For now, just check that URLs are configured
    from django.urls import reverse
    try:
        # Test URL resolution
        login_url = reverse('login')
        employees_url = reverse('employee-list')
        print("✅ API URLs configured correctly")
    except Exception as e:
        print(f"❌ API URL test failed: {e}")
        raise

def test_static_files():
    """Test static files configuration"""
    print("📦 Testing static files...")

    assert hasattr(settings, 'STATIC_URL'), "STATIC_URL not configured"
    assert hasattr(settings, 'STATIC_ROOT'), "STATIC_ROOT not configured"
    assert 'whitenoise' in settings.STATICFILES_STORAGE, "WhiteNoise not configured"

    print("✅ Static files configured correctly")

def run_management_commands():
    """Test that management commands work"""
    print("⚙️  Testing management commands...")

    try:
        # Test check command
        execute_from_command_line(['manage.py', 'check', '--deploy'])
        print("✅ Management commands working")
    except Exception as e:
        print(f"❌ Management command test failed: {e}")
        raise

def main():
    """Run all deployment tests"""
    print("🚀 Running deployment readiness tests...\n")

    tests = [
        test_settings,
        test_static_files,
        run_management_commands,
        test_models,
        test_api_endpoints,
    ]

    # Always test database for SQLite (no DATABASE_URL needed)
    tests.insert(1, test_database)

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} failed: {e}")
            failed += 1
        print()

    print(f"📊 Test Results: {passed} passed, {failed} failed")

    if failed > 0:
        print("❌ Some tests failed. Please fix before deploying.")
        sys.exit(1)
    else:
        print("🎉 All tests passed! Ready for deployment.")

if __name__ == '__main__':
    main()