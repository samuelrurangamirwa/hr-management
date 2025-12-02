from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    department = models.CharField(max_length=100, blank=True)
    avatar = models.URLField(blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})"

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    position = models.CharField(max_length=100)
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    onboarding_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ], default='pending')
    onboarding_completed_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.position}"

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
    ], default='present')
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['employee', 'date']

    def __str__(self):
        return f"{self.employee} - {self.date}"

class Deduction(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='deductions')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=50, choices=[
        ('tax', 'Tax'),
        ('insurance', 'Insurance'),
        ('retirement', 'Retirement'),
        ('loan', 'Loan'),
        ('other', 'Other'),
    ], default='other')
    is_recurring = models.BooleanField(default=True)
    effective_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee} - {self.name}: ${self.amount}"

class Payroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    period_start = models.DateField()
    period_end = models.DateField()
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('paid', 'Paid'),
    ], default='pending')
    processed_date = models.DateTimeField(null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)

    def calculate_gross_salary(self):
        """Calculate gross salary including overtime and allowances"""
        from decimal import Decimal

        # Ensure all values are Decimal for consistent arithmetic
        overtime_hours = Decimal(str(self.overtime_hours))
        overtime_rate = Decimal(str(self.overtime_rate))
        bonus = Decimal(str(self.bonus))
        allowances = Decimal(str(self.allowances))

        overtime_pay = overtime_hours * overtime_rate
        self.gross_salary = self.base_salary + overtime_pay + bonus + allowances
        return self.gross_salary

    def calculate_deductions(self):
        """Calculate total deductions for this payroll period"""
        from django.utils import timezone
        from decimal import Decimal

        current_date = timezone.now().date()

        # Get active deductions for this employee
        active_deductions = Deduction.objects.filter(
            employee=self.employee,
            effective_date__lte=current_date,
            is_recurring=True
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=current_date)
        )

        # Calculate monthly deductions (assuming bi-weekly payroll)
        monthly_deductions = sum(Decimal(str(deduction.amount)) for deduction in active_deductions)

        # For simplicity, we'll use half of monthly deductions for bi-weekly payroll
        # In a real system, you'd have more sophisticated calculation logic
        self.total_deductions = monthly_deductions / Decimal('2')
        return self.total_deductions

    def calculate_net_salary(self):
        """Calculate net salary after deductions"""
        self.net_salary = self.gross_salary - self.total_deductions
        return self.net_salary

    def __str__(self):
        return f"{self.employee} - {self.period_start} to {self.period_end}"

class JobPosting(models.Model):
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=50, choices=[
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ])
    description = models.TextField()
    requirements = models.TextField(blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    posted_date = models.DateField(auto_now_add=True)
    closing_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('filled', 'Filled'),
    ], default='active')
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.title

class Candidate(models.Model):
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='candidates')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    resume = models.FileField(upload_to='resumes/', blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    current_position = models.CharField(max_length=100, blank=True)
    expected_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('applied', 'Applied'),
        ('screening', 'Screening'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ], default='applied')
    stage = models.CharField(max_length=100, blank=True)
    score = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(0), MaxValueValidator(10)], default=0)
    applied_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_posting.title}"

class Benefit(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=[
        ('health', 'Health'),
        ('retirement', 'Retirement'),
        ('paid_time_off', 'Paid Time Off'),
        ('professional_development', 'Professional Development'),
        ('other', 'Other'),
    ])
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class EmployeeBenefit(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='benefits')
    benefit = models.ForeignKey(Benefit, on_delete=models.CASCADE)
    enrolled_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('enrolled', 'Enrolled'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ], default='enrolled')

    class Meta:
        unique_together = ['employee', 'benefit']

    def __str__(self):
        return f"{self.employee} - {self.benefit}"

class Expense(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=[
        ('travel', 'Travel'),
        ('equipment', 'Equipment'),
        ('training', 'Training'),
        ('medical', 'Medical'),
        ('other', 'Other'),
    ])
    receipt = models.FileField(upload_to='receipts/', blank=True)
    submitted_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('reimbursed', 'Reimbursed'),
    ], default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    approved_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.employee} - {self.title} (${self.amount})"

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_projects')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='planning')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    progress = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])

    def update_status_based_on_tasks(self):
        """Update project status based on task completion status with weighted progress"""
        tasks = self.tasks.all()
        if not tasks.exists():
            # No tasks - keep current status or set to planning
            if self.status not in ['planning', 'completed']:
                self.status = 'planning'
            self.progress = 0
        else:
            # Calculate weighted progress based on task statuses
            total_tasks = tasks.count()
            progress_sum = 0

            for task in tasks:
                if task.status == 'completed':
                    progress_sum += 100
                elif task.status == 'review':
                    progress_sum += 75
                elif task.status == 'in_progress':
                    progress_sum += 50
                elif task.status == 'todo':
                    progress_sum += 0

            # Calculate average completion percentage
            self.progress = int(progress_sum / total_tasks)

            # Determine project status
            if self.progress == 100:
                self.status = 'completed'
            elif tasks.filter(status__in=['in_progress', 'review']).exists():
                self.status = 'active'
            else:
                self.status = 'planning'

        self.save()

    def __str__(self):
        return self.name

class ProjectTeam(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_members')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    role = models.CharField(max_length=100)
    joined_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ['project', 'employee']

    def __str__(self):
        return f"{self.employee} - {self.project} ({self.role})"

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')
    status = models.CharField(max_length=20, choices=[
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('completed', 'Completed'),
    ], default='todo')
    due_date = models.DateField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    completed_date = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Update completed_date when status changes to completed
        if self.status == 'completed' and not self.completed_date:
            self.completed_date = timezone.now()
        elif self.status != 'completed':
            self.completed_date = None

        super().save(*args, **kwargs)

        # Update project status after saving task
        if self.project:
            self.project.update_status_based_on_tasks()

    def delete(self, *args, **kwargs):
        project = self.project
        super().delete(*args, **kwargs)

        # Update project status after deleting task
        if project:
            project.update_status_based_on_tasks()

    def __str__(self):
        return self.title

class PerformanceReview(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='performance_reviews_given')
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    overall_rating = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    employee_feedback = models.TextField(blank=True)
    reviewer_feedback = models.TextField(blank=True)
    review_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('acknowledged', 'Acknowledged'),
    ], default='draft')

    def __str__(self):
        return f"{self.employee} - {self.review_period_start} to {self.review_period_end}"

class KPIMetric(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='kpi_metrics')
    metric_name = models.CharField(max_length=100)
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    actual_value = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.DateField()
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)

    def __str__(self):
        return f"{self.employee} - {self.metric_name}"

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.CharField(max_length=100, blank=True)
    duration_hours = models.PositiveIntegerField()
    level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ], default='beginner')
    category = models.CharField(max_length=50, choices=[
        ('technical', 'Technical'),
        ('soft_skills', 'Soft Skills'),
        ('compliance', 'Compliance'),
        ('leadership', 'Leadership'),
        ('other', 'Other'),
    ])
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_date = models.DateField(auto_now_add=True)
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ], default='enrolled')
    progress_percentage = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])
    certificate_earned = models.BooleanField(default=False)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ['employee', 'course']

    def __str__(self):
        return f"{self.employee} - {self.course}"

class TaxRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='tax_records')
    tax_year = models.PositiveIntegerField()
    gross_income = models.DecimalField(max_digits=12, decimal_places=2)
    taxable_income = models.DecimalField(max_digits=12, decimal_places=2)
    tax_due = models.DecimalField(max_digits=12, decimal_places=2)
    tax_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('filed', 'Filed'),
        ('paid', 'Paid'),
    ], default='pending')

    def __str__(self):
        return f"{self.employee} - Tax Year {self.tax_year}"

class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=50, choices=[
        ('annual', 'Annual Leave'),
        ('sick', 'Sick Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
        ('emergency', 'Emergency Leave'),
        ('other', 'Other'),
    ])
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    submitted_date = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_date = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True)

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.start_date} to {self.end_date})"

class PaySlip(models.Model):
    payroll = models.OneToOneField(Payroll, on_delete=models.CASCADE, related_name='pay_slip')
    pdf_file = models.FileField(upload_to='pay_slips/', null=True, blank=True)
    generated_date = models.DateTimeField(auto_now_add=True)
    is_downloaded = models.BooleanField(default=False)
    download_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Pay Slip - {self.payroll.employee} - {self.payroll.period_start}"

class Budget(models.Model):
    department = models.CharField(max_length=100)
    fiscal_year = models.PositiveIntegerField()
    total_budget = models.DecimalField(max_digits=15, decimal_places=2)
    allocated_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    remaining_budget = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    ], default='draft')

    def __str__(self):
        return f"{self.department} - FY{self.fiscal_year}"
