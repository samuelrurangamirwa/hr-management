from django.core.management.base import BaseCommand
from django.utils import timezone
from hr_app.models import User, Employee, Attendance, Payroll, JobPosting, Candidate, Benefit, Project, Task, Course
from datetime import date, time

class Command(BaseCommand):
    help = 'Seed the database with initial demo data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # Create users
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@company.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='admin',
            department='Administration'
        )

        manager_user = User.objects.create_user(
            username='manager',
            email='manager@company.com',
            password='manager123',
            first_name='Manager',
            last_name='User',
            role='manager',
            department='Operations'
        )

        employee_user = User.objects.create_user(
            username='employee',
            email='employee@company.com',
            password='employee123',
            first_name='Employee',
            last_name='User',
            role='employee',
            department='Engineering'
        )

        # Create employees
        admin_employee, _ = Employee.objects.get_or_create(
            user=admin_user,
            defaults={
                'position': 'HR Administrator',
                'hire_date': date(2020, 1, 1),
                'salary': 75000.00
            }
        )

        manager_employee, _ = Employee.objects.get_or_create(
            user=manager_user,
            defaults={
                'position': 'Operations Manager',
                'hire_date': date(2019, 6, 1),
                'salary': 85000.00
            }
        )

        employee_employee, _ = Employee.objects.get_or_create(
            user=employee_user,
            defaults={
                'position': 'Software Engineer',
                'hire_date': date(2021, 3, 15),
                'salary': 65000.00
            }
        )

        # Create attendance records (only if not exists)
        Attendance.objects.get_or_create(
            employee=employee_employee,
            date=date.today(),
            defaults={
                'check_in': time(9, 0),
                'check_out': time(17, 30),
                'status': 'present'
            }
        )

        # Create payroll (only if not exists)
        Payroll.objects.get_or_create(
            employee=employee_employee,
            period_start=date.today().replace(day=1),
            defaults={
                'period_end': date.today(),
                'base_salary': 65000.00,
                'bonus': 1000.00,
                'deductions': 500.00,
                'net_salary': 65500.00,
                'status': 'processed'
            }
        )

        # Create job posting (only if not exists)
        job, _ = JobPosting.objects.get_or_create(
            title='Senior Full Stack Developer',
            defaults={
                'department': 'Engineering',
                'location': 'Remote',
                'employment_type': 'full_time',
                'description': 'We are looking for a Senior Full Stack Developer...',
                'salary_range': '$80k - $120k',
                'posted_by': admin_user
            }
        )

        # Create candidate (only if not exists)
        Candidate.objects.get_or_create(
            job_posting=job,
            email='john.doe@email.com',
            defaults={
                'first_name': 'John',
                'last_name': 'Doe',
                'phone': '+1234567890',
                'experience_years': 5,
                'current_position': 'Full Stack Developer',
                'expected_salary': 90000.00,
                'status': 'interview',
                'stage': 'Technical Interview',
                'score': 8.5
            }
        )

        # Create benefit (only if not exists)
        Benefit.objects.get_or_create(
            name='Health Insurance',
            defaults={
                'description': 'Comprehensive health insurance coverage',
                'category': 'health'
            }
        )

        # Create project (only if not exists)
        project, _ = Project.objects.get_or_create(
            name='HR System Upgrade',
            defaults={
                'description': 'Upgrading the HR management system',
                'manager': manager_user,
                'start_date': date.today(),
                'budget': 50000.00,
                'status': 'active',
                'priority': 'high'
            }
        )

        # Create task (only if not exists)
        Task.objects.get_or_create(
            title='Implement user authentication',
            defaults={
                'description': 'Implement JWT authentication for the system',
                'project': project,
                'assigned_to': employee_employee,
                'assigned_by': manager_user,
                'priority': 'high',
                'status': 'in_progress',
                'due_date': date.today()
            }
        )

        # Create course (only if not exists)
        Course.objects.get_or_create(
            title='Django REST Framework Basics',
            defaults={
                'description': 'Learn the fundamentals of Django REST Framework',
                'instructor': 'Jane Smith',
                'duration_hours': 20,
                'level': 'intermediate',
                'category': 'technical'
            }
        )

        self.stdout.write(self.style.SUCCESS('Data seeded successfully!'))