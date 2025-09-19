from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet)
router.register(r'employee-positions', views.EmployeePositionViewSet)
router.register(r'address-types', views.AddressTypeViewSet)
router.register(r'addresses', views.AddressInfoViewSet)
router.register(r'employees', views.EmployeeViewSet)
router.register(r'payroll-months', views.PayrollMonthViewSet)
router.register(r'deductions', views.DeductionsViewSet)
router.register(r'hourly-employees', views.HourlyEmployeeViewSet)
router.register(r'salaried-employees', views.SalariedEmployeeViewSet)
router.register(r'benefits', views.BenefitsViewSet)
router.register(r'timesheets', views.TimeSheetViewSet)
router.register(r'personal-days', views.PersonalDaysViewSet)
router.register(r'bank-information', views.BankInformationViewSet)
router.register(r'hours-worked', views.HoursWorkedViewSet)
router.register(r'payments', views.PaymentsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]