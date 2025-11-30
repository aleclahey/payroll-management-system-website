from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


class Department(models.Model):
    departmentname = models.CharField(max_length=50)
    departmentdesc = models.CharField(
        max_length=150, 
        default='Dept. Desc to be determined'
    )
    
    class Meta:
        db_table = 'Department'
    
    def __str__(self):
        return self.departmentname


class EmployeePosition(models.Model):
    title = models.CharField(max_length=60, null=True, blank=True)
    fromdate = models.DateField(null=True, blank=True)
    todate = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'EmployeePosition'
    
    def __str__(self):
        return self.title or f"Position {self.id}"


class AddressType(models.Model):
    typename = models.CharField(max_length=50)
    typedescription = models.CharField(max_length=150)
    
    class Meta:
        db_table = 'AddressType'
    
    def __str__(self):
        return self.typename


class AddressInfo(models.Model):
    street = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    province = models.CharField(max_length=50)
    postalcode = models.CharField(max_length=20)
    country = models.CharField(max_length=50)
    addresstype = models.ForeignKey(
        AddressType, 
        on_delete=models.CASCADE,
        db_column='AddressTypeID'
    )
    
    class Meta:
        db_table = 'AddressInfo'
    
    def __str__(self):
        return f"{self.street}, {self.city}, {self.province}"


class Employee(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('X', 'Other'),
    ]
    
    firstname = models.CharField(max_length=60)
    lastname = models.CharField(max_length=70)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    hiredate = models.DateField(null=True, blank=True)
    manageremployee = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='ManagerEmployeeID'
    )
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='DepartmentID'
    )
    employeeposition = models.ForeignKey(
        EmployeePosition, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='EmployeePositionID'
    )
    addressinfo = models.ForeignKey(
        AddressInfo, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='AddressInfoID'
    )
    lastupdated = models.DateField()
    
    class Meta:
        db_table = 'Employee'
    
    def __str__(self):
        return f"{self.firstname} {self.lastname}"
    
    @property
    def fullname(self):
        return f"{self.firstname} {self.lastname}"


class EmployeeAddress(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    addressinfo = models.ForeignKey(
        AddressInfo, 
        on_delete=models.CASCADE,
        db_column='AddressInfoID'
    )
    
    class Meta:
        db_table = 'EmployeeAddress'
    
    def __str__(self):
        return f"{self.employee} - {self.addressinfo}"


class PayrollMonth(models.Model):
    payrollmonth = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        db_table = 'PayrollMonth'
    
    def __str__(self):
        return self.payrollmonth or f"Payroll {self.id}"


class Deductions(models.Model):
    deductiontype = models.CharField(max_length=60)
    deductionamount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    class Meta:
        db_table = 'Deductions'
    
    def __str__(self):
        return self.deductiontype


class HourlyEmployee(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    payrollmonth = models.ForeignKey(
        PayrollMonth, 
        on_delete=models.CASCADE,
        db_column='PayrollMonthID'
    )
    startdate = models.DateField()
    enddate = models.DateField(null=True, blank=True)
    hourlyrate = models.FloatField()
    deduction = models.ForeignKey(
        Deductions, 
        on_delete=models.CASCADE,
        db_column='DeductionID'
    )
    
    class Meta:
        db_table = 'HourlyEmployee'
    
    def __str__(self):
        return f"{self.employee} - Hourly (${self.hourlyrate}/hr)"


class SalariedEmployee(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    startdate = models.DateField()
    enddate = models.DateField(null=True, blank=True)
    salaryamount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    bonusamount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    deduction = models.ForeignKey(
        Deductions, 
        on_delete=models.CASCADE,
        db_column='DeductionID'
    )
    
    class Meta:
        db_table = 'SalariedEmployee'
    
    def __str__(self):
        return f"{self.employee} - Salaried (${self.salaryamount})"


class Benefits(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('inactive', 'Inactive'),
    ]
    
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    benefitplan = models.CharField(max_length=60)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    class Meta:
        db_table = 'Benefits'
    
    def __str__(self):
        return f"{self.employee} - {self.benefitplan} ({self.status})"


class TimeSheet(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    clockin = models.TimeField(null=True, blank=True)
    clockout = models.TimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'TimeSheet'
    
    def __str__(self):
        return f"{self.employee} - {self.clockin} to {self.clockout}"


class PersonalDays(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    pdtype = models.CharField(max_length=60)
    paid = models.BooleanField()
    daysoff = models.FloatField()
    
    class Meta:
        db_table = 'PersonalDays'
    
    def __str__(self):
        return f"{self.employee} - {self.pdtype} ({self.daysoff} days)"


class BankInformation(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    bankinstitution = models.CharField(max_length=100)
    institutionnumber = models.CharField(max_length=3)
    accountnumber = models.CharField(max_length=10)
    transitnumber = models.CharField(max_length=5)
    
    class Meta:
        db_table = 'BankInformation'
    
    def __str__(self):
        return f"{self.employee} - {self.bankinstitution}"


class HoursWorked(models.Model):
    payrollmonth = models.ForeignKey(
        PayrollMonth, 
        on_delete=models.CASCADE,
        db_column='PayrollMonthID'
    )
    daysworked = models.IntegerField(null=True, blank=True)
    hoursworked = models.FloatField(null=True, blank=True)
    overtimehours = models.FloatField(null=True, blank=True)
    
    class Meta:
        db_table = 'HoursWorked'
    
    def __str__(self):
        return f"{self.payrollmonth} - {self.hoursworked} hours"


class Payments(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        db_column='EmployeeID'
    )
    payrollmonth = models.ForeignKey(
        PayrollMonth, 
        on_delete=models.CASCADE,
        db_column='PayrollMonthID'
    )
    overtimepay = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    deductions = models.ForeignKey(
        Deductions, 
        on_delete=models.CASCADE,
        db_column='DeductionsID'
    )
    hourlyemployee = models.ForeignKey(
        HourlyEmployee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='HourlyEmployeeID'
    )
    salariedemployee = models.ForeignKey(
        SalariedEmployee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='SalariedEmployeeID'
    )
    
    class Meta:
        db_table = 'Payments'
    
    def __str__(self):
        return f"{self.employee} - {self.payrollmonth}"