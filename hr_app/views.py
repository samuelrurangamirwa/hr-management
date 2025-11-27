from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    User, Employee, Attendance, Payroll, JobPosting, Candidate,
    Benefit, EmployeeBenefit, Expense, Project, Task,
    PerformanceReview, Course, Enrollment, TaxRecord, Budget
)
from .serializers import (
    UserSerializer, LoginSerializer, EmployeeSerializer, AttendanceSerializer,
    PayrollSerializer, JobPostingSerializer, CandidateSerializer,
    BenefitSerializer, EmployeeBenefitSerializer, ExpenseSerializer,
    ProjectSerializer, TaskSerializer, PerformanceReviewSerializer,
    CourseSerializer, EnrollmentSerializer, TaxRecordSerializer, BudgetSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    print("Register validation errors:", serializer.errors)  # Debug logging
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user

    # Basic stats
    total_employees = Employee.objects.count()
    active_projects = Project.objects.filter(status='active').count()
    pending_tasks = Task.objects.filter(status__in=['todo', 'in_progress']).count()
    monthly_payroll = Payroll.objects.filter(
        period_start__year=timezone.now().year,
        period_start__month=timezone.now().month
    ).aggregate(total=Sum('net_salary'))['total'] or 0

    # Attendance rate (last 30 days)
    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    attendance_records = Attendance.objects.filter(date__gte=thirty_days_ago)
    total_days = attendance_records.count()
    present_days = attendance_records.filter(status='present').count()
    attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0

    # Recent activities
    recent_payrolls = Payroll.objects.filter(status='processed').order_by('-processed_date')[:3]
    recent_candidates = Candidate.objects.filter(status='applied').order_by('-applied_date')[:3]

    activities = []
    for payroll in recent_payrolls:
        activities.append({
            'type': 'success',
            'message': f'Payroll processed for {payroll.employee.user.get_full_name()}',
            'time': payroll.processed_date.strftime('%Y-%m-%d %H:%M') if payroll.processed_date else 'Recently'
        })

    for candidate in recent_candidates:
        activities.append({
            'type': 'info',
            'message': f'New candidate applied for {candidate.job_posting.title}',
            'time': candidate.applied_date.strftime('%Y-%m-%d')
        })

    return Response({
        'stats': {
            'total_employees': total_employees,
            'active_projects': active_projects,
            'pending_tasks': pending_tasks,
            'monthly_payroll': monthly_payroll,
            'attendance_rate': round(attendance_rate, 1)
        },
        'activities': activities[:5]  # Last 5 activities
    })

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]

class BenefitViewSet(viewsets.ModelViewSet):
    queryset = Benefit.objects.all()
    serializer_class = BenefitSerializer
    permission_classes = [IsAuthenticated]

class EmployeeBenefitViewSet(viewsets.ModelViewSet):
    queryset = EmployeeBenefit.objects.all()
    serializer_class = EmployeeBenefitSerializer
    permission_classes = [IsAuthenticated]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

class TaxRecordViewSet(viewsets.ModelViewSet):
    queryset = TaxRecord.objects.all()
    serializer_class = TaxRecordSerializer
    permission_classes = [IsAuthenticated]

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see/modify their own profile
        return User.objects.filter(id=self.request.user.id)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password changed successfully'})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
