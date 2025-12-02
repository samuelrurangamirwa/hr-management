from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'employees', views.EmployeeViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'payroll', views.PayrollViewSet)
router.register(r'deductions', views.DeductionViewSet)
router.register(r'pay-slips', views.PaySlipViewSet)
router.register(r'job-postings', views.JobPostingViewSet)
router.register(r'candidates', views.CandidateViewSet)
router.register(r'benefits', views.BenefitViewSet)
router.register(r'employee-benefits', views.EmployeeBenefitViewSet)
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'performance-reviews', views.PerformanceReviewViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'enrollments', views.EnrollmentViewSet)
router.register(r'tax-records', views.TaxRecordViewSet)
router.register(r'budgets', views.BudgetViewSet)
router.register(r'leave-requests', views.LeaveRequestViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/change-password/', views.change_password, name='change-password'),
    path('auth/update-profile/', views.update_profile, name='update-profile'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('employees/<int:employee_id>/calculate-salary/', views.calculate_employee_salary, name='calculate-employee-salary'),
    path('payroll/<int:payroll_id>/generate-pay-slip/', views.generate_pay_slip_pdf, name='generate-pay-slip-pdf'),
    path('', include(router.urls)),
]