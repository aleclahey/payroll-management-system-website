from django.contrib import admin
from .models import *

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'departmentname', 'departmentdesc')
    search_fields = ('departmentname',)


@admin.register(EmployeePosition)
class EmployeePositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'fromdate', 'todate')
    list_filter = ('fromdate', 'todate')


@admin.register(AddressType)
class AddressTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'typename', 'typedescription')
    search_fields = ('typename',)


@admin.register(AddressInfo)
class AddressInfoAdmin(admin.ModelAdmin):
    list_display = ('id', 'street', 'city', 'province', 'postalcode', 'country', 'addresstype')
    list_filter = ('province', 'country', 'addresstype')
    search_fields = ('street', 'city', 'postalcode')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'firstname', 'lastname', 'gender', 'hiredate', 'department')
    list_filter = ('gender', 'hiredate', 'department')
    search_fields = ('firstname', 'lastname')
    raw_id_fields = ('manageremployee', 'addressinfo')


@admin.register(EmployeeAddress)
class EmployeeAddressAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'addressinfo')
    raw_id_fields = ('employee', 'addressinfo')


@admin.register(PayrollMonth)
class PayrollMonthAdmin(admin.ModelAdmin):
    list_display = ('id', 'payrollmonth')
    search_fields = ('payrollmonth',)


@admin.register(Deductions)
class DeductionsAdmin(admin.ModelAdmin):
    list_display = ('id', 'deductiontype', 'deductionamount')
    search_fields = ('deductiontype',)


@admin.register(HourlyEmployee)
class HourlyEmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'hourlyrate', 'startdate', 'enddate')
    list_filter = ('startdate', 'enddate')
    raw_id_fields = ('employee', 'payrollmonth', 'deduction')


@admin.register(SalariedEmployee)
class SalariedEmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'salaryamount', 'bonusamount', 'startdate', 'enddate')
    list_filter = ('startdate', 'enddate')
    raw_id_fields = ('employee', 'deduction')


@admin.register(Benefits)
class BenefitsAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'benefitplan')
    list_filter = ('benefitplan',)
    raw_id_fields = ('employee',)


@admin.register(TimeSheet)
class TimeSheetAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'clockin', 'clockout')
    list_filter = ('clockin', 'clockout')
    raw_id_fields = ('employee',)


@admin.register(PersonalDays)
class PersonalDaysAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'pdtype', 'paid', 'daysoff')
    list_filter = ('pdtype', 'paid')
    raw_id_fields = ('employee',)


@admin.register(BankInformation)
class BankInformationAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'bankinstitution', 'institutionnumber')
    search_fields = ('bankinstitution', 'institutionnumber')
    raw_id_fields = ('employee',)


@admin.register(HoursWorked)
class HoursWorkedAdmin(admin.ModelAdmin):
    list_display = ('id', 'payrollmonth', 'daysworked', 'hoursworked', 'overtimehours')
    raw_id_fields = ('payrollmonth',)


@admin.register(Payments)
class PaymentsAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'payrollmonth', 'overtimepay')
    list_filter = ('payrollmonth',)
    raw_id_fields = ('employee', 'payrollmonth', 'deductions', 'hourlyemployee', 'salariedemployee')