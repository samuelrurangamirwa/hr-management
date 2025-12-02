from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import models
from .models import (
    User, Employee, Attendance, Payroll, Deduction, PaySlip, JobPosting, Candidate,
    Benefit, EmployeeBenefit, Expense, Project, ProjectTeam, Task,
    PerformanceReview, KPIMetric, Course, Enrollment, TaxRecord, Budget, LeaveRequest
)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'avatar', 'password', 'employee_id')

    def get_employee_id(self, obj):
        try:
            return obj.employee_profile.id
        except Employee.DoesNotExist:
            return None

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    if user.is_active:
                        data['user'] = user
                    else:
                        raise serializers.ValidationError('User account is disabled.')
                else:
                    raise serializers.ValidationError('Invalid credentials.')
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')

        return data

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'

class DeductionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = Deduction
        fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    department = serializers.CharField(source='employee.user.department', read_only=True)
    position = serializers.CharField(source='employee.position', read_only=True)
    deductions_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ('gross_salary', 'total_deductions', 'net_salary', 'processed_date', 'payment_date')

    def get_deductions_breakdown(self, obj):
        deductions = Deduction.objects.filter(
            employee=obj.employee,
            effective_date__lte=obj.period_end,
            is_recurring=True
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=obj.period_start)
        )
        return DeductionSerializer(deductions, many=True).data

class PaySlipSerializer(serializers.ModelSerializer):
    payroll_details = PayrollSerializer(source='payroll', read_only=True)

    class Meta:
        model = PaySlip
        fields = '__all__'

class JobPostingSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)

    class Meta:
        model = JobPosting
        fields = '__all__'

class CandidateSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = '__all__'

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class BenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefit
        fields = '__all__'

class EmployeeBenefitSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    benefit_name = serializers.CharField(source='benefit.name', read_only=True)

    class Meta:
        model = EmployeeBenefit
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('employee', 'submitted_date', 'approved_by', 'approved_date')

class ProjectTeamSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = ProjectTeam
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    team_members = ProjectTeamSerializer(many=True, read_only=True)
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_tasks(self, obj):
        from .serializers import TaskSerializer  # Import here to avoid circular import
        tasks = obj.tasks.all()
        return TaskSerializer(tasks, many=True, context=self.context).data

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

class KPIMetricSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = KPIMetric
        fields = '__all__'

class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'

class TaxRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = TaxRecord
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ('employee', 'submitted_date', 'approved_by', 'approved_date')

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError("End date must be after start date.")

            # Recalculate days_requested to ensure consistency
            days_requested = (end_date - start_date).days + 1
            data['days_requested'] = days_requested

        return data

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'