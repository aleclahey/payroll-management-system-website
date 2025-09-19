from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from payroll.models import *
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create Departments
        dept1 = Department.objects.create(
            department_name='Human Resources',
            department_desc='Manages employee relations and policies'
        )
        dept2 = Department.objects.create(
            department_name='Information Technology',
            department_desc='Manages technology infrastructure'
        )
        dept3 = Department.objects.create(
            department_name='Finance',
            department_desc='Handles financial operations'
        )

        # Create Employee Positions
        pos1 = EmployeePosition.objects.create(
            title='HR Manager',
            from_date=date(2023, 1, 1)
        )
        pos2 = EmployeePosition.objects.create(
            title='Software Developer',
            from_date=date(2023, 1, 1)
        )
        pos3 = EmployeePosition.objects.create(
            title='Financial Analyst',
            from_date=date(2023, 1, 1)
        )

        # Create Address Types
        addr_type1 = AddressType.objects.create(
            type_name='Home',
            type_description='Primary residence address'
        )
        addr_type2 = AddressType.objects.create(
            type_name='Work',
            type_description='Business office address'
        )

        # Create Address Info
        addr1 = AddressInfo.objects.create(
            street='123 Main Street',
            city='Toronto',
            province='Ontario',
            postal_code='M5V 3A8',
            country='Canada',
            address_type=addr_type1
        )
        addr2 = AddressInfo.objects.create(
            street='456 Business Ave',
            city='Toronto',
            province='Ontario',
            postal_code='M4B 1B3',
            country='Canada',
            address_type=addr_type1
        )

        # Create Employees
        emp1 = Employee.objects.create(
            first_name='John',
            last_name='Smith',
            gender='M',
            hire_date=date(2023, 1, 15),
            department=dept1,
            employee_position=pos1,
            address_info=addr1,
            last_updated=timezone.now().date()
        )
        emp2 = Employee.objects.create(
            first_name='Jane',
            last_name='Doe',
            gender='F',
            hire_date=date(2023, 2, 1),
            department=dept2,
            employee_position=pos2,
            address_info=addr2,
            manager_employee=emp1,
            last_updated=timezone.now().date()
        )
        emp3 = Employee.objects.create(
            first_name='Mike',
            last_name='Johnson',
            gender='M',
            hire_date=date(2023, 3, 1),
            department=dept3,
            employee_position=pos3,
            address_info=addr1,
            manager_employee=emp1,
            last_updated=timezone.now().date()
        )

        # Create Payroll Months
        payroll1 = PayrollMonth.objects.create(payroll_month='January 2024')
        payroll2 = PayrollMonth.objects.create(payroll_month='February 2024')

        # Create Deductions
        deduction1 = Deductions.objects.create(
            deduction_type='Income Tax',
            deduction_amount=Decimal('500.00')
        )
        deduction2 = Deductions.objects.create(
            deduction_type='Health Insurance',
            deduction_amount=Decimal('150.00')
        )

        # Create Salaried Employee
        sal_emp1 = SalariedEmployee.objects.create(
            employee=emp1,
            start_date=date(2023, 1, 15),
            salary_amount=Decimal('75000.00'),
            bonus_amount=Decimal('5000.00'),
            deduction=deduction1
        )

        # Create Hourly Employees
        hourly_emp1 = HourlyEmployee.objects.create(
            employee=emp2,
            payroll_month=payroll1,
            start_date=date(2023, 2, 1),
            hourly_rate=25.00,
            deduction=deduction2
        )

        # Create Benefits
        Benefits.objects.create(
            employee=emp1,
            benefit_plan='Premium Health Plan'
        )
        Benefits.objects.create(
            employee=emp2,
            benefit_plan='Basic Health Plan'
        )

        # Create Bank Information
        BankInformation.objects.create(
            employee=emp1,
            bank_institution='Royal Bank of Canada',
            institution_number='003',
            account_number='1234567890',
            transit_number='12345'
        )

        # Create Time Sheets
        from datetime import time
        TimeSheet.objects.create(
            employee=emp2,
            clock_in=time(9, 0),
            clock_out=time(17, 0)
        )

        # Create Personal Days
        PersonalDays.objects.create(
            employee=emp1,
            pd_type='Vacation',
            paid=True,
            days_off=5.0
        )

        # Create Hours Worked
        HoursWorked.objects.create(
            payroll_month=payroll1,
            days_worked=22,
            hours_worked=176.0,
            overtime_hours=8.0
        )

        # Create Payments
        Payments.objects.create(
            employee=emp1,
            payroll_month=payroll1,
            overtime_pay=Decimal('200.00'),
            deductions=deduction1,
            salaried_employee=sal_emp1
        )
        Payments.objects.create(
            employee=emp2,
            payroll_month=payroll1,
            overtime_pay=Decimal('150.00'),
            deductions=deduction2,
            hourly_employee=hourly_emp1
        )

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )