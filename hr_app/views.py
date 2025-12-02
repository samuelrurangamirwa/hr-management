from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate
from django.db import models
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    User, Employee, Attendance, Payroll, Deduction, PaySlip, JobPosting, Candidate,
    Benefit, EmployeeBenefit, Expense, Project, Task,
    PerformanceReview, Course, Enrollment, TaxRecord, Budget, LeaveRequest
)
from .serializers import (
    UserSerializer, LoginSerializer, EmployeeSerializer, AttendanceSerializer,
    PayrollSerializer, DeductionSerializer, PaySlipSerializer, JobPostingSerializer, CandidateSerializer,
    BenefitSerializer, EmployeeBenefitSerializer, ExpenseSerializer,
    ProjectSerializer, TaskSerializer, PerformanceReviewSerializer,
    CourseSerializer, EnrollmentSerializer, TaxRecordSerializer, BudgetSerializer,
    LeaveRequestSerializer
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

class DeductionViewSet(viewsets.ModelViewSet):
    queryset = Deduction.objects.all()
    serializer_class = DeductionSerializer
    permission_classes = [IsAuthenticated]

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        payroll = serializer.save()

        try:
            # Calculate salary components when creating payroll
            payroll.calculate_gross_salary()
            payroll.calculate_deductions()
            payroll.calculate_net_salary()
            payroll.save()
        except Exception as e:
            # If calculation fails, still save the payroll with default values
            print(f"Warning: Failed to calculate payroll components: {e}")
            payroll.gross_salary = payroll.base_salary  # At least set gross to base
            payroll.total_deductions = 0
            payroll.net_salary = payroll.base_salary
            payroll.save()

class PaySlipViewSet(viewsets.ModelViewSet):
    queryset = PaySlip.objects.all()
    serializer_class = PaySlipSerializer
    permission_classes = [IsAuthenticated]

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

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

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'manager']:
            return Expense.objects.all()
        else:
            # Employees can only see their own expenses
            try:
                employee = user.employee_profile
                return Expense.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return Expense.objects.none()

    def perform_create(self, serializer):
        try:
            employee = self.request.user.employee_profile
            serializer.save(employee=employee)
        except Employee.DoesNotExist:
            # If user doesn't have an employee profile, they can't create expenses
            raise serializers.ValidationError("Employee profile not found. Contact administrator.")

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        # Only allow status updates for managers and admins
        if 'status' in self.request.data:
            if user.role not in ['admin', 'manager']:
                raise serializers.ValidationError("Only managers and admins can approve/reject expense claims.")

            # Set approved_by when status is changed to approved or rejected
            if self.request.data['status'] in ['approved', 'rejected']:
                serializer.save(approved_by=user, approved_date=timezone.now())
            else:
                serializer.save()
        else:
            # Regular updates (only by the employee who created it)
            if user.role == 'employee':
                try:
                    if instance.employee.user != user:
                        raise serializers.ValidationError("You can only update your own expense claims.")
                except Employee.DoesNotExist:
                    raise serializers.ValidationError("Employee profile not found.")
            serializer.save()

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # All authenticated users can see all projects
        return Project.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['admin', 'manager']:
            raise serializers.ValidationError("Only managers and admins can create projects.")
        serializer.save(manager=user)

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

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'manager']:
            return LeaveRequest.objects.all()
        else:
            # Employees can only see their own leave requests
            try:
                employee = user.employee_profile
                return LeaveRequest.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return LeaveRequest.objects.none()

    def perform_create(self, serializer):
        try:
            employee = self.request.user.employee_profile
            serializer.save(employee=employee)
        except Employee.DoesNotExist:
            # If user doesn't have an employee profile, they can't create leave requests
            raise serializers.ValidationError("Employee profile not found. Contact administrator.")

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        # Only allow status updates for managers and admins
        if 'status' in self.request.data:
            if user.role not in ['admin', 'manager']:
                raise serializers.ValidationError("Only managers and admins can approve/reject leave requests.")

            # Set approved_by when status is changed to approved or rejected
            if self.request.data['status'] in ['approved', 'rejected']:
                serializer.save(approved_by=user, approved_date=timezone.now())
            else:
                serializer.save()
        else:
            # Regular updates (only by the employee who created it)
            if user.role == 'employee':
                try:
                    if instance.employee.user != user:
                        raise serializers.ValidationError("You can only update your own leave requests.")
                except Employee.DoesNotExist:
                    raise serializers.ValidationError("Employee profile not found.")
            serializer.save()

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_employee_salary(request, employee_id):
    """Calculate salary for a specific employee"""
    try:
        from decimal import Decimal

        employee = Employee.objects.get(id=employee_id)

        # Get salary calculation parameters from request and convert to Decimal
        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        overtime_hours = Decimal(str(request.data.get('overtime_hours', 0)))
        overtime_rate = Decimal(str(request.data.get('overtime_rate', 0)))
        bonus = Decimal(str(request.data.get('bonus', 0)))
        allowances = Decimal(str(request.data.get('allowances', 0)))

        # Calculate overtime pay
        overtime_pay = overtime_hours * overtime_rate

        # Calculate gross salary
        gross_salary = employee.salary + overtime_pay + bonus + allowances

        # Calculate deductions for this employee
        current_date = timezone.now().date()
        active_deductions = Deduction.objects.filter(
            employee=employee,
            effective_date__lte=current_date,
            is_recurring=True
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=current_date)
        )

        # Calculate monthly deductions and convert to bi-weekly
        monthly_deductions = sum(Decimal(str(deduction.amount)) for deduction in active_deductions)
        total_deductions = monthly_deductions / Decimal('2')  # Assuming bi-weekly payroll

        # Calculate net salary
        net_salary = gross_salary - total_deductions

        return Response({
            'employee_name': employee.user.get_full_name(),
            'base_salary': float(employee.salary),
            'overtime_pay': float(overtime_pay),
            'bonus': float(bonus),
            'allowances': float(allowances),
            'gross_salary': float(gross_salary),
            'total_deductions': float(total_deductions),
            'net_salary': float(net_salary),
            'calculation_date': timezone.now().isoformat()
        })

    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_pay_slip_pdf(request, payroll_id):
    """Generate PDF pay slip for a payroll record"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from io import BytesIO
        import os

        payroll = Payroll.objects.get(id=payroll_id)

        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        story.append(Paragraph("PAY SLIP", title_style))
        story.append(Spacer(1, 12))

        # Company and Employee Info
        company_info = [
            ["Company: Advanced HR System", ""],
            ["Pay Period:", f"{payroll.period_start} to {payroll.period_end}"],
            ["Employee:", payroll.employee.user.get_full_name()],
            ["Position:", payroll.employee.position],
            ["Department:", payroll.employee.user.department],
            ["Employee ID:", str(payroll.employee.id)],
        ]

        company_table = Table(company_info, colWidths=[2*inch, 3*inch])
        company_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(company_table)
        story.append(Spacer(1, 20))

        # Salary Breakdown
        salary_data = [
            ["Earnings", "", ""],
            ["Basic Salary", f"${payroll.base_salary}", ""],
        ]

        if payroll.overtime_hours > 0:
            salary_data.append(["Overtime", f"${payroll.overtime_hours * payroll.overtime_rate}", f"{payroll.overtime_hours} hours"])

        if payroll.bonus > 0:
            salary_data.append(["Bonus", f"${payroll.bonus}", ""])

        if payroll.allowances > 0:
            salary_data.append(["Allowances", f"${payroll.allowances}", ""])

        salary_data.append(["", "", ""])
        salary_data.append(["Gross Salary", f"${payroll.gross_salary}", ""])

        # Deductions
        salary_data.append(["", "", ""])
        salary_data.append(["Deductions", "", ""])

        # Get deductions breakdown
        deductions = Deduction.objects.filter(
            employee=payroll.employee,
            effective_date__lte=payroll.period_end,
            is_recurring=True
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=payroll.period_start)
        )

        for deduction in deductions:
            # Calculate prorated deduction for the period
            deduction_amount = deduction.amount / 2  # Assuming bi-weekly payroll
            salary_data.append([deduction.name, f"-${deduction_amount}", deduction.get_type_display()])

        salary_data.append(["Total Deductions", f"-${payroll.total_deductions}", ""])
        salary_data.append(["", "", ""])
        salary_data.append(["Net Salary", f"${payroll.net_salary}", ""])

        salary_table = Table(salary_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
        salary_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ]))
        story.append(salary_table)
        story.append(Spacer(1, 20))

        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=1
        )
        story.append(Paragraph("This is a computer-generated pay slip. Generated on " + timezone.now().strftime("%Y-%m-%d %H:%M:%S"), footer_style))

        # Build PDF
        doc.build(story)

        # Save PDF to file
        pdf_content = buffer.getvalue()
        buffer.close()

        # Create PaySlip record
        pay_slip = PaySlip.objects.create(payroll=payroll)

        # Save PDF file
        filename = f"pay_slip_{payroll.employee.id}_{payroll.period_start}_{payroll.period_end}.pdf"
        pay_slip.pdf_file.save(filename, BytesIO(pdf_content))

        return Response({
            'message': 'Pay slip generated successfully',
            'pay_slip_id': pay_slip.id,
            'download_url': pay_slip.pdf_file.url
        })

    except Payroll.DoesNotExist:
        return Response({'error': 'Payroll record not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
