#!/usr/bin/env python
"""
Database setup script for production deployment.
This script runs migrations and seeds initial data.
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hr_backend.settings')
django.setup()

from django.core.management import execute_from_command_line

def run_migrations():
    """Run database migrations"""
    print("🔄 Running database migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=1'])
        print("✅ Migrations completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

def seed_data():
    """Seed initial data"""
    print("🌱 Seeding initial data...")
    try:
        execute_from_command_line(['manage.py', 'seed_data'])
        print("✅ Data seeding completed successfully!")
    except Exception as e:
        print(f"❌ Data seeding failed: {e}")
        # Don't raise here - seeding failure shouldn't break deployment
        print("⚠️  Continuing deployment despite seeding failure...")

def collect_static():
    """Collect static files"""
    print("📦 Collecting static files...")
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput', '--verbosity=1'])
        print("✅ Static files collected successfully!")
    except Exception as e:
        print(f"❌ Static files collection failed: {e}")
        raise

if __name__ == '__main__':
    print("🚀 Starting database setup for HR System...")

    try:
        run_migrations()
        seed_data()
        collect_static()
        print("🎉 Database setup complete!")
    except Exception as e:
        print(f"💥 Database setup failed: {e}")
        sys.exit(1)