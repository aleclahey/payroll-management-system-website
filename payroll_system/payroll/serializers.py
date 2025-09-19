from rest_framework import serializers
from .models import *


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class EmployeePositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeePosition
        fields = '__all__'


class AddressTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddressType
        fields = '__all__'


class AddressInfoSerializer(serializers.ModelSerializer):
    addresstypename = serializers.CharField(source='addresstype.typename', read_only=True)
    
    class Meta:
        model = AddressInfo
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    fullname = serializers.SerializerMethodField()
    departmentname = serializers.CharField(source='department.departmentname', read_only=True)
    positiontitle = serializers.CharField(source='employeeposition.title', read_only=True)
    managername = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = '__all__'
    
    def get_fullname(self, obj):
        return f"{obj.firstname} {obj.lastname}"
    
    def get_managername(self, obj):
        if obj.manageremployee:
            return f"{obj.manageremployee.firstname} {obj.manageremployee.lastname}"
        return None


class EmployeeAddressSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    
    class Meta:
        model = EmployeeAddress
        fields = '__all__'


class PayrollMonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollMonth
        fields = '__all__'


class DeductionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deductions
        fields = '__all__'


class HourlyEmployeeSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    payrollmonthname = serializers.CharField(source='payrollmonth.payrollmonth', read_only=True)
    
    class Meta:
        model = HourlyEmployee
        fields = '__all__'


class SalariedEmployeeSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    
    class Meta:
        model = SalariedEmployee
        fields = '__all__'


class BenefitsSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    
    class Meta:
        model = Benefits
        fields = '__all__'


class TimeSheetSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    hoursworked = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeSheet
        fields = '__all__'
    
    def get_hoursworked(self, obj):
        if obj.clockin and obj.clockout:
            from datetime import datetime, timedelta
            clockin = datetime.combine(datetime.min, obj.clockin)
            clockout = datetime.combine(datetime.min, obj.clockout)
            if clockout < clockin:  # Handle overnight shifts
                clockout += timedelta(days=1)
            duration = clockout - clockin
            return round(duration.total_seconds() / 3600, 2)
        return None


class PersonalDaysSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    
    class Meta:
        model = PersonalDays
        fields = '__all__'


class BankInformationSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    
    class Meta:
        model = BankInformation
        fields = '__all__'


class HoursWorkedSerializer(serializers.ModelSerializer):
    payrollmonthname = serializers.CharField(source='payrollmonth.payrollmonth', read_only=True)
    
    class Meta:
        model = HoursWorked
        fields = '__all__'


class PaymentsSerializer(serializers.ModelSerializer):
    employeename = serializers.CharField(source='employee.fullname', read_only=True)
    payrollmonthname = serializers.CharField(source='payrollmonth.payrollmonth', read_only=True)
    deductiontype = serializers.CharField(source='deductions.deductiontype', read_only=True)
    
    class Meta:
        model = Payments
        fields = '__all__'


# Detailed serializers for complex views
class EmployeeDetailSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    employeeposition = EmployeePositionSerializer(read_only=True)
    addressinfo = AddressInfoSerializer(read_only=True)
    manageremployee = serializers.SerializerMethodField()
    benefits = BenefitsSerializer(many=True, read_only=True, source='benefits_set')
    bankinformation = BankInformationSerializer(many=True, read_only=True, source='bankinformation_set')
    
    class Meta:
        model = Employee
        fields = '__all__'
    
    def get_manageremployee(self, obj):
        if obj.manageremployee:
            return EmployeeSerializer(obj.manageremployee).data
        return None


class PayrollSummarySerializer(serializers.Serializer):
    employeeid = serializers.IntegerField()
    employeename = serializers.CharField()
    payrollmonth = serializers.CharField()
    grosspay = serializers.DecimalField(max_digits=10, decimal_places=2)
    deductionstotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    netpay = serializers.DecimalField(max_digits=10, decimal_places=2)
    overtimepay = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)