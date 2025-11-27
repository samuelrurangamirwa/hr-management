from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, Employee, Attendance, Payroll, JobPosting, Candidate,
    Benefit, EmployeeBenefit, Expense, Project, ProjectTeam, Task,
    PerformanceReview, KPIMetric, Course, Enrollment, TaxRecord, Budget
)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'avatar', 'password')

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

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    department = serializers.CharField(source='employee.user.department', read_only=True)
    position = serializers.CharField(source='employee.position', read_only=True)

    class Meta:
        model = Payroll
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

class ProjectTeamSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = ProjectTeam
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    team_members = ProjectTeamSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

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

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'