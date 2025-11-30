
from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date, time
from decimal import Decimal
from payroll.models import (
    Department, EmployeePosition, AddressType, AddressInfo, Employee,
    EmployeeAddress, PayrollMonth, Deductions, HourlyEmployee, 
    SalariedEmployee, Benefits, TimeSheet, PersonalDays, 
    BankInformation, HoursWorked, Payments
)


class Command(BaseCommand):
    help = 'Populates the payroll database with initial data'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data population...')
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        self.stdout.write('Clearing existing data...')
        Payments.objects.all().delete()
        HoursWorked.objects.all().delete()
        BankInformation.objects.all().delete()
        PersonalDays.objects.all().delete()
        TimeSheet.objects.all().delete()
        Benefits.objects.all().delete()
        SalariedEmployee.objects.all().delete()
        HourlyEmployee.objects.all().delete()
        Deductions.objects.all().delete()
        PayrollMonth.objects.all().delete()
        EmployeeAddress.objects.all().delete()
        Employee.objects.all().delete()
        AddressInfo.objects.all().delete()
        AddressType.objects.all().delete()
        EmployeePosition.objects.all().delete()
        Department.objects.all().delete()
        
        # Insert Departments
        self.stdout.write('Inserting Departments...')
        departments_data = [
            ('HR', 'Human Resources Department'),
            ('IT', 'Information Technology Department'),
            ('FIN', 'Finance Department'),
            ('MKT', 'Marketing Department'),
            ('OPS', 'Operations Department'),
            ('SALES', 'Sales Department'),
            ('DEV', 'Development Department'),
            ('SUP', 'Support Department'),
            ('PRD', 'Production Department'),
            ('ACC', 'Accounting Department'),
            ('QA', 'Quality Assurance Department'),
            ('CS', 'Customer Service Department'),
            ('ENG', 'Engineering Department'),
            ('LOG', 'Logistics Department'),
            ('PUR', 'Purchasing Department'),
            ('PR', 'Public Relations Department'),
            ('ADM', 'Administration Department'),
            ('RND', 'Research and Development Department'),
            ('LEGAL', 'Legal Department'),
            ('EDU', 'Education Department'),
        ]
        for name, desc in departments_data:
            Department.objects.create(departmentname=name, departmentdesc=desc)
        
        # Insert Employee Positions
        self.stdout.write('Inserting Employee Positions...')
        positions_data = [
            ('Manager', '2018-03-15', None),
            ('Software Engineer', '2019-07-22', None),
            ('Accountant', '2017-10-05', None),
            ('Sales Representative', '2016-05-18', None),
            ('Marketing Specialist', '2018-12-09', None),
            ('Customer Service Representative', '2019-04-30', None),
            ('Project Manager', '2017-08-25', None),
            ('Quality Assurance Analyst', '2016-11-11', None),
            ('Operations Manager', '2019-02-14', None),
            ('Financial Analyst', '2018-06-28', None),
            ('Human Resources Coordinator', '2017-09-03', None),
            ('Logistics Coordinator', '2016-04-17', None),
            ('IT Specialist', '2019-10-11', None),
            ('Legal Assistant', '2017-12-30', None),
            ('Research Scientist', '2018-08-20', None),
            ('Educational Consultant', '2016-01-25', None),
            ('Administrative Assistant', '2019-05-07', None),
            ('Production Supervisor', '2017-03-12', None),
            ('Purchasing Manager', '2018-09-08', None),
            ('Public Relations Manager', '2019-11-19', None),
        ]
        for title, from_date, to_date in positions_data:
            EmployeePosition.objects.create(
                title=title,
                fromdate=date.fromisoformat(from_date),
                todate=date.fromisoformat(to_date) if to_date else None
            )
        
        # Insert Address Types
        self.stdout.write('Inserting Address Types...')
        address_types_data = [
            ('Home', 'Personal residence address'),
            ('Work', 'Workplace address'),
            ('Billing', 'Billing address for invoices and payments'),
            ('Shipping', 'Shipping address for deliveries'),
            ('Mailing', 'Mailing address for correspondence'),
            ('Primary', 'Primary address'),
            ('Secondary', 'Secondary address'),
            ('Vacation Home', 'Address for vacation or second home'),
            ('Corporate', 'Corporate office address'),
            ('Branch', 'Branch office address'),
            ('Temporary', 'Temporary or interim address'),
        ]
        for name, desc in address_types_data:
            AddressType.objects.create(typename=name, typedescription=desc)
        
        # Insert Address Info
        self.stdout.write('Inserting Address Info...')
        addresses_data = [
            ('123 Maple Ave', 'Toronto', 'ON', 'M1M 1M1', 'Canada', 1),
            ('456 Oak St', 'Vancouver', 'BC', 'V6B 2W6', 'Canada', 2),
            ('789 Cedar Dr', 'Montreal', 'QC', 'H2X 1X9', 'Canada', 3),
            ('321 Birch St', 'Calgary', 'AB', 'T2P 2G8', 'Canada', 4),
            ('654 Elm St', 'Edmonton', 'AB', 'T5J 2R7', 'Canada', 5),
            ('987 Pine Ave', 'Ottawa', 'ON', 'K1P 5M7', 'Canada', 6),
            ('246 Birchwood Dr', 'Quebec City', 'QC', 'G1R 4S9', 'Canada', 7),
            ('135 Maple St', 'Winnipeg', 'MB', 'R3B 0J9', 'Canada', 8),
            ('369 Spruce St', 'Saskatoon', 'SK', 'S7H 0W6', 'Canada', 9),
            ('258 Pine St', 'Halifax', 'NS', 'B3J 3J8', 'Canada', 10),
            ('147 Cedar Dr', 'Victoria', 'BC', 'V8W 1P6', 'Canada', 11),
            ('852 Elm St', 'Regina', 'SK', 'S4P 3N8', 'Canada', 2),
            ('753 Oak St', 'Hamilton', 'ON', 'L8P 4R5', 'Canada', 3),
            ('369 Birchwood Ave', 'London', 'ON', 'N6A 5B6', 'Canada', 4),
            ('456 Pine Ave', 'Halifax', 'NS', 'B3J 3J8', 'Canada', 5),
            ('987 Spruce St', 'Surrey', 'BC', 'V3W 2M6', 'Canada', 6),
            ('123 Cedar St', 'Burnaby', 'BC', 'V5C 2Y6', 'Canada', 7),
            ('456 Maple Ave', 'Mississauga', 'ON', 'L5B 1M2', 'Canada', 8),
            ('789 Oak St', 'Richmond', 'BC', 'V6Y 2C3', 'Canada', 9),
            ('321 Birchwood Ave', 'Saanich', 'BC', 'V8X 1R2', 'Canada', 10),
        ]
        address_objects = []
        for street, city, prov, postal, country, addr_type_id in addresses_data:
            addr_type = AddressType.objects.get(pk=addr_type_id)
            address_objects.append(
                AddressInfo.objects.create(
                    street=street,
                    city=city,
                    province=prov,
                    postalcode=postal,
                    country=country,
                    addresstype=addr_type
                )
            )
        
        # Insert Employees
        self.stdout.write('Inserting Employees...')
        employees_data = [
            ('John', 'Smith', 'M', '2020-01-15', None, 1, 1, 1, '2023-05-20'),
            ('Jane', 'Doe', 'F', '2019-05-20', 1, 2, 2, 2, '2022-09-12'),
            ('Michael', 'Johnson', 'M', '2018-10-10', 1, 1, 3, 3, '2021-11-30'),
            ('Emily', 'Williams', 'F', '2017-03-25', 3, 3, 4, 4, '2020-07-03'),
            ('Christopher', 'Brown', 'M', '2016-09-12', 1, 2, 5, 5, '2019-04-17'),
            ('Amanda', 'Jones', 'F', '2015-11-30', 3, 1, 6, 6, '2023-01-08'),
            ('Matthew', 'Garcia', 'M', '2019-08-05', 2, 2, 7, 7, '2021-10-01'),
            ('Jessica', 'Martinez', 'F', '2018-04-17', 2, 3, 8, 8, '2020-08-15'),
            ('David', 'Robinson', 'M', '2017-01-08', 1, 1, 9, 9, '2023-03-24'),
            ('Sarah', 'Hernandez', 'F', '2016-06-21', 2, 2, 10, 10, '2021-05-07'),
        ]
        
        employee_objects = []
        for fname, lname, gender, hire, mgr_id, dept_id, addr_id, pos_id, updated in employees_data:
            employee_objects.append(
                Employee.objects.create(
                    firstname=fname,
                    lastname=lname,
                    gender=gender,
                    hiredate=date.fromisoformat(hire),
                    manageremployee=Employee.objects.get(pk=mgr_id) if mgr_id else None,
                    department=Department.objects.get(pk=dept_id),
                    addressinfo=address_objects[addr_id - 1],
                    employeeposition=EmployeePosition.objects.get(pk=pos_id),
                    lastupdated=date.fromisoformat(updated)
                )
            )
        
        # Insert Employee Addresses
        self.stdout.write('Inserting Employee Addresses...')
        employee_addresses = [
            (1, 2), (2, 2), (3, 3), (4, 4), (5, 5),
            (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)
        ]
        for emp_id, addr_id in employee_addresses:
            EmployeeAddress.objects.create(
                employee=Employee.objects.get(pk=emp_id),
                addressinfo=address_objects[addr_id - 1]
            )
        
        # Insert Payroll Months
        self.stdout.write('Inserting Payroll Months...')
        months = [
            'January 2023', 'February 2023', 'March 2023', 'April 2023',
            'May 2023', 'June 2023', 'July 2023', 'August 2023',
            'September 2023', 'October 2023', 'November 2023', 'December 2023'
        ]
        payroll_months = []
        for month in months:
            payroll_months.append(PayrollMonth.objects.create(payrollmonth=month))
        
        # Insert Deductions
        self.stdout.write('Inserting Deductions...')
        deductions_data = [
            ('Health Insurance', 100.00),
            ('401(k) Contribution', 150.00),
            ('Life Insurance', 50.00),
            ('Dental Insurance', 75.00),
            ('Vision Insurance', 60.00),
            ('Flexible Spending Account', 80.00),
            ('Employee Stock Purchase Plan', 200.00),
            ('Transportation Benefits', 70.00),
            ('Childcare Expenses', 120.00),
            ('Union Dues', 40.00),
            ('Garnishments', 90.00),
            ('Retirement Plan', 180.00),
            ('Disability Insurance', 80.00),
        ]
        deduction_objects = []
        for ded_type, amount in deductions_data:
            deduction_objects.append(
                Deductions.objects.create(
                    deductiontype=ded_type,
                    deductionamount=Decimal(str(amount))
                )
            )
        
        # Insert Hourly Employees
        self.stdout.write('Inserting Hourly Employees...')
        hourly_data = [
            (1, 1, '2023-01-01', None, 20.50, 1),
            (2, 1, '2023-01-01', None, 18.75, 2),
            (3, 1, '2023-01-01', None, 22.00, 3),
            (4, 1, '2023-01-01', None, 19.25, 4),
            (5, 1, '2023-01-01', None, 21.50, 5),
            (6, 1, '2023-01-01', None, 20.00, 6),
            (7, 1, '2023-01-01', None, 23.75, 7),
            (8, 1, '2023-01-01', None, 17.50, 8),
            (9, 1, '2023-01-01', None, 24.00, 9),
            (1, 1, '2023-01-01', None, 18.25, 10),
        ]
        hourly_objects = []
        for emp_id, pm_id, start, end, rate, ded_id in hourly_data:
            hourly_objects.append(
                HourlyEmployee.objects.create(
                    employee=Employee.objects.get(pk=emp_id),
                    payrollmonth=payroll_months[pm_id - 1],
                    startdate=date.fromisoformat(start),
                    enddate=date.fromisoformat(end) if end else None,
                    hourlyrate=rate,
                    deduction=deduction_objects[ded_id - 1]
                )
            )
        
        # Insert Salaried Employees
        self.stdout.write('Inserting Salaried Employees...')
        salaried_data = [
            (1, '2024-06-13', None, 50000.00, None, 1),
            (2, '2024-06-10', None, 60000.00, 5000.00, 2),
            (3, '2024-05-20', '2024-12-31', 55000.00, None, 3),
            (4, '2024-04-15', None, 48000.00, 2000.00, 4),
            (5, '2024-03-01', None, 52000.00, 3000.00, 5),
            (6, '2024-02-10', None, 47000.00, None, 6),
            (7, '2024-01-15', '2024-07-31', 58000.00, 4000.00, 7),
            (8, '2023-12-20', None, 49000.00, 1500.00, 8),
            (9, '2023-11-05', None, 54000.00, None, 9),
            (10, '2023-10-10', '2024-06-30', 56000.00, 2000.00, 10),
        ]
        salaried_objects = []
        for emp_id, start, end, salary, bonus, ded_id in salaried_data:
            salaried_objects.append(
                SalariedEmployee.objects.create(
                    employee=Employee.objects.get(pk=emp_id),
                    startdate=date.fromisoformat(start),
                    enddate=date.fromisoformat(end) if end else None,
                    salaryamount=Decimal(str(salary)),
                    bonusamount=Decimal(str(bonus)) if bonus else None,
                    deduction=deduction_objects[ded_id - 1]
                )
            )
        
        # Insert Benefits
        self.stdout.write('Inserting Benefits...')
        benefits_data = [
            (1, 'Health Insurance'), (2, 'Dental Insurance'),
            (3, 'Vision Insurance'), (4, 'Health Insurance'),
            (5, 'Dental Insurance'), (6, 'Vision Insurance'),
            (7, 'Health Insurance'), (8, 'Dental Insurance'),
            (9, 'Vision Insurance'), (10, 'Health Insurance'),
        ]
        for emp_id, plan in benefits_data:
            Benefits.objects.create(
                employee=Employee.objects.get(pk=emp_id),
                benefitplan=plan
            )
        
        # Insert TimeSheets
        self.stdout.write('Inserting TimeSheets...')
        timesheets_data = [
            (1, '08:00:00', '17:00:00'), (2, '09:00:00', '18:00:00'),
            (3, '07:30:00', '16:30:00'), (4, '08:30:00', '17:30:00'),
            (5, '08:00:00', '17:00:00'), (6, '09:00:00', '18:00:00'),
            (7, '07:30:00', '16:30:00'), (8, '08:30:00', '17:30:00'),
            (9, '08:00:00', '17:00:00'), (10, '09:00:00', '18:00:00'),
        ]
        for emp_id, clock_in, clock_out in timesheets_data:
            TimeSheet.objects.create(
                employee=Employee.objects.get(pk=emp_id),
                clockin=time.fromisoformat(clock_in),
                clockout=time.fromisoformat(clock_out)
            )
        
        # Insert Personal Days
        self.stdout.write('Inserting Personal Days...')
        personal_days_data = [
            (1, 'Vacation', True, 5), (2, 'Sick Leave', True, 3),
            (3, 'Family Leave', True, 2), (4, 'Vacation', True, 7),
            (5, 'Sick Leave', True, 2), (6, 'Vacation', True, 4),
            (7, 'Family Leave', True, 3), (8, 'Vacation', True, 6),
            (9, 'Sick Leave', False, 1), (10, 'Vacation', True, 5),
        ]
        for emp_id, pd_type, paid, days in personal_days_data:
            PersonalDays.objects.create(
                employee=Employee.objects.get(pk=emp_id),
                pdtype=pd_type,
                paid=paid,
                daysoff=days
            )
        
        # Insert Bank Information
        self.stdout.write('Inserting Bank Information...')
        bank_data = [
            (1, 'Royal Bank of Canada', '003', '1234567', '98765'),
            (2, 'Toronto-Dominion Bank', '004', '2345678', '87654'),
            (3, 'Scotiabank', '002', '3456789', '76543'),
            (4, 'Bank of Montreal', '001', '4567890', '65432'),
            (5, 'Royal Bank of Canada', '003', '5678901', '54321'),
            (6, 'Toronto-Dominion Bank', '004', '6789012', '43210'),
            (7, 'Scotiabank', '002', '7890123', '32109'),
            (8, 'Bank of Montreal', '001', '8901234', '21098'),
            (9, 'Royal Bank of Canada', '003', '9012345', '10987'),
            (10, 'Toronto-Dominion Bank', '004', '0123456', '09876'),
        ]
        for emp_id, bank, inst_num, acct_num, transit in bank_data:
            BankInformation.objects.create(
                employee=Employee.objects.get(pk=emp_id),
                bankinstitution=bank,
                institutionnumber=inst_num,
                accountnumber=acct_num,
                transitnumber=transit
            )
        
        # Insert Hours Worked
        self.stdout.write('Inserting Hours Worked...')
        hours_data = [
            (1, 22, 176, 6), (2, 21, 168, 8), (3, 22, 176, 4),
            (4, 20, 160, 10), (5, 22, 176, 6), (6, 21, 168, 8),
            (7, 22, 176, 4), (8, 20, 160, 10), (9, 22, 176, 6),
            (10, 21, 168, 8),
        ]
        for pm_id, days, hours, overtime in hours_data:
            HoursWorked.objects.create(
                payrollmonth=payroll_months[pm_id - 1],
                daysworked=days,
                hoursworked=hours,
                overtimehours=overtime
            )
        
        # Insert Payments
        self.stdout.write('Inserting Payments...')
        payments_data = [
            (1, 1, 100.00, 1, 1, None),
            (2, 1, 150.00, 2, 2, None),
            (3, 1, None, 3, 3, None),
            (4, 1, 200.00, 4, 4, None),
            (5, 1, None, 5, 5, None),
            (6, 1, None, 6, None, 1),
            (7, 1, None, 7, None, 2),
            (8, 1, None, 8, None, 3),
        ]
        for emp_id, pm_id, overtime, ded_id, hourly_id, salary_id in payments_data:
            Payments.objects.create(
                employee=Employee.objects.get(pk=emp_id),
                payrollmonth=payroll_months[pm_id - 1],
                overtimepay=Decimal(str(overtime)) if overtime else None,
                deductions=deduction_objects[ded_id - 1],
                hourlyemployee=hourly_objects[hourly_id - 1] if hourly_id else None,
                salariedemployee=salaried_objects[salary_id - 1] if salary_id else None
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database!'))
        self.stdout.write(f'Created:')
        self.stdout.write(f'  - {Department.objects.count()} Departments')
        self.stdout.write(f'  - {EmployeePosition.objects.count()} Employee Positions')
        self.stdout.write(f'  - {AddressType.objects.count()} Address Types')
        self.stdout.write(f'  - {AddressInfo.objects.count()} Addresses')
        self.stdout.write(f'  - {Employee.objects.count()} Employees')
        self.stdout.write(f'  - {PayrollMonth.objects.count()} Payroll Months')
        self.stdout.write(f'  - {Deductions.objects.count()} Deductions')
        self.stdout.write(f'  - {HourlyEmployee.objects.count()} Hourly Employees')
        self.stdout.write(f'  - {SalariedEmployee.objects.count()} Salaried Employees')
        self.stdout.write(f'  - {Benefits.objects.count()} Benefits')
        self.stdout.write(f'  - {TimeSheet.objects.count()} TimeSheets')
        self.stdout.write(f'  - {PersonalDays.objects.count()} Personal Days')
        self.stdout.write(f'  - {BankInformation.objects.count()} Bank Information')
        self.stdout.write(f'  - {HoursWorked.objects.count()} Hours Worked')
        self.stdout.write(f'  - {Payments.objects.count()} Payments')