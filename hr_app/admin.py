from django.contrib import admin
from .models import (
    User, Employee, Attendance, Payroll, JobPosting, Candidate,
    Benefit, EmployeeBenefit, Expense, Project, ProjectTeam, Task,
    PerformanceReview, KPIMetric, Course, Enrollment, TaxRecord, Budget
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'department')
    list_filter = ('role', 'department', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'position', 'get_department', 'hire_date', 'salary')
    list_filter = ('hire_date',)
    search_fields = ('user__first_name', 'user__last_name', 'position')

    def get_department(self, obj):
        return obj.user.department
    get_department.short_description = 'Department'

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'check_in', 'check_out', 'status')
    list_filter = ('status', 'date')
    search_fields = ('employee__user__first_name', 'employee__user__last_name')

@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('employee', 'period_start', 'period_end', 'net_salary', 'status')
    list_filter = ('status', 'period_start')
    search_fields = ('employee__user__first_name', 'employee__user__last_name')

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'location', 'status', 'posted_date')
    list_filter = ('status', 'department', 'employment_type')
    search_fields = ('title', 'department')

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'job_posting', 'status', 'applied_date', 'score')
    list_filter = ('status', 'applied_date')
    search_fields = ('first_name', 'last_name', 'email')

@admin.register(Benefit)
class BenefitAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')

@admin.register(EmployeeBenefit)
class EmployeeBenefitAdmin(admin.ModelAdmin):
    list_display = ('employee', 'benefit', 'enrolled_date', 'status')
    list_filter = ('status', 'enrolled_date')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'benefit__name')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('employee', 'title', 'amount', 'category', 'status', 'submitted_date')
    list_filter = ('status', 'category', 'submitted_date')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'title')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'manager', 'status', 'start_date', 'end_date', 'progress')
    list_filter = ('status', 'priority', 'start_date')
    search_fields = ('name', 'description')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_to', 'status', 'priority', 'due_date')
    list_filter = ('status', 'priority', 'due_date')
    search_fields = ('title', 'description')

@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ('employee', 'reviewer', 'overall_rating', 'review_date', 'status')
    list_filter = ('status', 'review_date', 'overall_rating')
    search_fields = ('employee__user__first_name', 'employee__user__last_name')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'duration_hours', 'is_active')
    list_filter = ('category', 'level', 'is_active')
    search_fields = ('title', 'description')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'course', 'status', 'enrolled_date', 'progress_percentage')
    list_filter = ('status', 'enrolled_date')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'course__title')

@admin.register(TaxRecord)
class TaxRecordAdmin(admin.ModelAdmin):
    list_display = ('employee', 'tax_year', 'gross_income', 'tax_due', 'status')
    list_filter = ('tax_year', 'status')
    search_fields = ('employee__user__first_name', 'employee__user__last_name')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('department', 'fiscal_year', 'total_budget', 'allocated_budget', 'status')
    list_filter = ('fiscal_year', 'status')
    search_fields = ('department',)
