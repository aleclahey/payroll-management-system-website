# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, F, Count
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from .models import *
from .serializers import *


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department operations
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees in this department"""
        department = self.get_object()
        employees = Employee.objects.filter(department=department)
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def employeecount(self, request):
        """Get employee count per department"""
        departments = Department.objects.annotate(
            employeecount=Count('employee')
        ).values('id', 'departmentname', 'employeecount')
        return Response(list(departments))


class EmployeePositionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmployeePosition operations
    """
    queryset = EmployeePosition.objects.all()
    serializer_class = EmployeePositionSerializer
    
    @action(detail=False, methods=['get'])
    def activepositions(self, request):
        """Get positions that are currently active (no end date or future end date)"""
        from django.utils import timezone
        today = timezone.now().date()
        positions = EmployeePosition.objects.filter(
            Q(todate__isnull=True) | Q(todate__gte=today)
        )
        serializer = EmployeePositionSerializer(positions, many=True)
        return Response(serializer.data)


class AddressTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AddressType operations
    """
    queryset = AddressType.objects.all()
    serializer_class = AddressTypeSerializer


class AddressInfoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AddressInfo operations
    """
    queryset = AddressInfo.objects.select_related('addresstype').all()
    serializer_class = AddressInfoSerializer
    
    @action(detail=False, methods=['get'])
    def byprovince(self, request):
        """Get addresses grouped by province"""
        province = request.query_params.get('province')
        if province:
            addresses = AddressInfo.objects.filter(province__icontains=province)
        else:
            addresses = AddressInfo.objects.all()
        serializer = AddressInfoSerializer(addresses, many=True)
        return Response(serializer.data)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee operations with comprehensive functionality
    """
    queryset = Employee.objects.select_related(
        'department', 'employeeposition', 'addressinfo', 'manageremployee'
    ).all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        """Filter employees based on query parameters"""
        queryset = Employee.objects.select_related(
            'department', 'employeeposition', 'addressinfo', 'manageremployee'
        ).all()
        
        # Filter by department
        departmentid = self.request.query_params.get('department')
        if departmentid:
            queryset = queryset.filter(department_id=departmentid)
        
        # Filter by gender
        gender = self.request.query_params.get('gender')
        if gender:
            queryset = queryset.filter(gender=gender)
        
        # Filter by hire date range
        hiredatefrom = self.request.query_params.get('hiredatefrom')
        hiredateto = self.request.query_params.get('hiredateto')
        if hiredatefrom:
            queryset = queryset.filter(hiredate__gte=hiredatefrom)
        if hiredateto:
            queryset = queryset.filter(hiredate__lte=hiredateto)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def managers(self, request):
        """Get all employees who are managers"""
        managers = Employee.objects.filter(
            id__in=Employee.objects.filter(
                manageremployee__isnull=False
            ).values_list('manageremployee_id', flat=True).distinct()
        ).select_related('department', 'employeeposition')
        serializer = EmployeeSerializer(managers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subordinates(self, request, pk=None):
        """Get all employees reporting to this manager"""
        manager = self.get_object()
        subordinates = Employee.objects.filter(
            manageremployee=manager
        ).select_related('department', 'employeeposition')
        serializer = EmployeeSerializer(subordinates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def payrollhistory(self, request, pk=None):
        """Get payroll history for an employee"""
        employee = self.get_object()
        payments = Payments.objects.filter(employee=employee).select_related(
            'payrollmonth', 'deductions', 'hourlyemployee', 'salariedemployee'
        ).order_by('-payrollmonth_id')
        serializer = PaymentsSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search employees by name"""
        query = request.query_params.get('q', '')
        if query:
            employees = Employee.objects.filter(
                Q(firstname__icontains=query) | Q(lastname__icontains=query)
            ).select_related('department', 'employeeposition')[:20]
            serializer = EmployeeSerializer(employees, many=True)
            return Response(serializer.data)
        return Response([])


class EmployeeAddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmployeeAddress operations
    """
    queryset = EmployeeAddress.objects.select_related('employee', 'addressinfo').all()
    serializer_class = EmployeeAddressSerializer


class PayrollMonthViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PayrollMonth operations with summary capabilities
    """
    queryset = PayrollMonth.objects.all()
    serializer_class = PayrollMonthSerializer
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get payroll summary for a specific month"""
        payrollmonth = self.get_object()
        payments = Payments.objects.filter(payrollmonth=payrollmonth).select_related(
            'employee', 'deductions', 'hourlyemployee', 'salariedemployee'
        )
        
        summarydata = []
        totalgross = 0
        totaldeductions = 0
        totalnet = 0
        
        for payment in payments:
            # Calculate gross pay
            grosspay = 0
            employeetype = "Unknown"
            
            if payment.hourlyemployee:
                # For hourly employees, calculate based on hours worked
                hoursworkedrecord = HoursWorked.objects.filter(
                    payrollmonth=payrollmonth
                ).first()
                
                if hoursworkedrecord:
                    regularhours = hoursworkedrecord.hoursworked or 0
                    overtimehours = hoursworkedrecord.overtimehours or 0
                    grosspay = (regularhours * payment.hourlyemployee.hourlyrate) + \
                               (overtimehours * payment.hourlyemployee.hourlyrate * 1.5)
                else:
                    # Default to 40 hours if no record found
                    grosspay = 40 * payment.hourlyemployee.hourlyrate
                employeetype = "Hourly"
                
            elif payment.salariedemployee:
                # Monthly salary calculation (assuming annual salary / 12)
                grosspay = (payment.salariedemployee.salaryamount or 0) / 12
                if payment.salariedemployee.bonusamount:
                    grosspay += payment.salariedemployee.bonusamount
                employeetype = "Salaried"
            
            # Add overtime pay if any
            if payment.overtimepay:
                grosspay += float(payment.overtimepay)
            
            deductionsamount = float(payment.deductions.deductionamount or 0)
            netpay = grosspay - deductionsamount
            
            # Add to totals
            totalgross += grosspay
            totaldeductions += deductionsamount
            totalnet += netpay
            
            summarydata.append({
                'employeeid': payment.employee.id,
                'employeename': f"{payment.employee.firstname} {payment.employee.lastname}",
                'employeetype': employeetype,
                'payrollmonth': payrollmonth.payrollmonth,
                'grosspay': round(grosspay, 2),
                'deductionstotal': deductionsamount,
                'netpay': round(netpay, 2),
                'overtimepay': float(payment.overtimepay or 0)
            })
        
        responsedata = {
            'payrollmonth': payrollmonth.payrollmonth,
            'summarytotals': {
                'totalemployees': len(summarydata),
                'totalgrosspay': round(totalgross, 2),
                'totaldeductions': round(totaldeductions, 2),
                'totalnetpay': round(totalnet, 2)
            },
            'employeedetails': summarydata
        }
        
        return Response(responsedata)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent payroll months"""
        recentmonths = PayrollMonth.objects.all().order_by('-id')[:6]
        serializer = PayrollMonthSerializer(recentmonths, many=True)
        return Response(serializer.data)


class DeductionsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Deductions operations
    """
    queryset = Deductions.objects.all()
    serializer_class = DeductionsSerializer
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get deductions summary by type"""
        deductionssummary = Deductions.objects.values('deductiontype').annotate(
            totalamount=Sum('deductionamount'),
            count=Count('id')
        ).order_by('-totalamount')
        return Response(list(deductionssummary))


class HourlyEmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for HourlyEmployee operations
    """
    queryset = HourlyEmployee.objects.select_related(
        'employee', 'payrollmonth', 'deduction'
    ).all()
    serializer_class = HourlyEmployeeSerializer
    
    @action(detail=False, methods=['get'])
    def byraterange(self, request):
        """Filter hourly employees by rate range"""
        minrate = request.query_params.get('minrate')
        maxrate = request.query_params.get('maxrate')
        
        queryset = self.queryset
        if minrate:
            queryset = queryset.filter(hourlyrate__gte=minrate)
        if maxrate:
            queryset = queryset.filter(hourlyrate__lte=maxrate)
        
        serializer = HourlyEmployeeSerializer(queryset, many=True)
        return Response(serializer.data)


class SalariedEmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SalariedEmployee operations
    """
    queryset = SalariedEmployee.objects.select_related('employee', 'deduction').all()
    serializer_class = SalariedEmployeeSerializer
    
    @action(detail=False, methods=['get'])
    def salarystatistics(self, request):
        """Get salary statistics"""
        from django.db.models import Avg, Min, Max
        
        stats = SalariedEmployee.objects.aggregate(
            avgsalary=Avg('salaryamount'),
            minsalary=Min('salaryamount'),
            maxsalary=Max('salaryamount'),
            totalemployees=Count('id')
        )
        
        return Response(stats)


class BenefitsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Benefits operations
    """
    queryset = Benefits.objects.select_related('employee').all()
    serializer_class = BenefitsSerializer
    
    @action(detail=False, methods=['get'])
    def byplan(self, request):
        """Group benefits by plan type"""
        plantype = request.query_params.get('plantype')
        status = request.query_params.get('status')  # Add status filter
        
        benefits = Benefits.objects.all()
        
        if plantype:
            benefits = benefits.filter(benefitplan__icontains=plantype)
        if status:
            benefits = benefits.filter(status=status)
        
        serializer = BenefitsSerializer(benefits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def plansummary(self, request):
        """Get summary of benefit plans"""
        plansummary = Benefits.objects.values('benefitplan', 'status').annotate(
            employeecount=Count('employee')
        ).order_by('-employeecount')
        return Response(list(plansummary))
    
    @action(detail=False, methods=['get'])
    def bystatus(self, request):
        """Get benefits filtered by status"""
        status = request.query_params.get('status', 'active')
        benefits = Benefits.objects.filter(status=status)
        serializer = BenefitsSerializer(benefits, many=True)
        return Response(serializer.data)


class TimeSheetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TimeSheet operations
    """
    queryset = TimeSheet.objects.select_related('employee').all()
    serializer_class = TimeSheetSerializer
    
    @action(detail=False, methods=['get'])
    def dailysummary(self, request):
        """Get daily time summary for all employees"""
        employeeid = request.query_params.get('employeeid')
        
        timesheets = self.queryset.all()
        if employeeid:
            timesheets = timesheets.filter(employee_id=employeeid)
        
        serializer = TimeSheetSerializer(timesheets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def clockout(self, request, pk=None):
        """Clock out an employee"""
        timesheet = self.get_object()
        if timesheet.clockout:
            return Response(
                {'error': 'Employee already clocked out'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from datetime import datetime
        timesheet.clockout = datetime.now().time()
        timesheet.save()
        
        serializer = TimeSheetSerializer(timesheet)
        return Response(serializer.data)


class PersonalDaysViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PersonalDays operations
    """
    queryset = PersonalDays.objects.select_related('employee').all()
    serializer_class = PersonalDaysSerializer
    
    @action(detail=False, methods=['get'])
    def employeesummary(self, request):
        """Get personal days summary by employee"""
        employeeid = request.query_params.get('employeeid')
        
        if employeeid:
            personaldays = PersonalDays.objects.filter(employee_id=employeeid)
            # Calculate totals
            totaldays = personaldays.aggregate(
                totaldays=Sum('daysoff'),
                paiddays=Sum('daysoff', filter=Q(paid=True)),
                unpaiddays=Sum('daysoff', filter=Q(paid=False))
            )
            return Response({
                'employeeid': employeeid,
                'summary': totaldays,
                'details': PersonalDaysSerializer(personaldays, many=True).data
            })
        
        # Get summary for all employees
        summary = PersonalDays.objects.values('employee__id', 'employee__firstname', 'employee__lastname').annotate(
            totaldays=Sum('daysoff'),
            paiddays=Sum('daysoff', filter=Q(paid=True)),
            unpaiddays=Sum('daysoff', filter=Q(paid=False))
        ).order_by('employee__lastname')
        
        return Response(list(summary))


class BankInformationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BankInformation operations
    """
    queryset = BankInformation.objects.select_related('employee').all()
    serializer_class = BankInformationSerializer
    
    @action(detail=False, methods=['get'])
    def byinstitution(self, request):
        """Group bank information by institution"""
        institutionsummary = BankInformation.objects.values('bankinstitution').annotate(
            employeecount=Count('employee')
        ).order_by('-employeecount')
        return Response(list(institutionsummary))


class HoursWorkedViewSet(viewsets.ModelViewSet):
    """
    ViewSet for HoursWorked operations
    """
    queryset = HoursWorked.objects.select_related('payrollmonth').all()
    serializer_class = HoursWorkedSerializer


class PaymentsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payments operations with comprehensive reporting
    """
    queryset = Payments.objects.select_related(
        'employee', 'payrollmonth', 'deductions', 'hourlyemployee', 'salariedemployee'
    ).all()
    serializer_class = PaymentsSerializer
    
    def get_queryset(self):
        """Filter payments based on query parameters"""
        queryset = self.queryset
        
        employeeid = self.request.query_params.get('employeeid')
        if employeeid:
            queryset = queryset.filter(employee_id=employeeid)
        
        payrollmonthid = self.request.query_params.get('payrollmonthid')
        if payrollmonthid:
            queryset = queryset.filter(payrollmonth_id=payrollmonthid)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def employeepayments(self, request):
        """Get payments for a specific employee"""
        employeeid = request.query_params.get('employeeid')
        if not employeeid:
            return Response(
                {'error': 'employeeid parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payments = Payments.objects.filter(employee_id=employeeid).select_related(
            'payrollmonth', 'deductions', 'hourlyemployee', 'salariedemployee'
        ).order_by('-payrollmonth__id')
        
        serializer = PaymentsSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def payrollreport(self, request):
        """Generate comprehensive payroll report"""
        payrollmonthid = request.query_params.get('payrollmonthid')
        
        if payrollmonthid:
            payments = Payments.objects.filter(payrollmonth_id=payrollmonthid)
        else:
            payments = Payments.objects.all()
        
        payments = payments.select_related(
            'employee', 'payrollmonth', 'deductions', 'hourlyemployee', 'salariedemployee'
        )
        
        # Calculate comprehensive totals
        totalpayments = payments.count()
        totalovertimepay = sum(float(p.overtimepay or 0) for p in payments)
        totaldeductions = sum(float(p.deductions.deductionamount or 0) for p in payments)
        
        # Separate hourly and salaried calculations
        hourlypayments = payments.filter(hourlyemployee__isnull=False)
        salariedpayments = payments.filter(salariedemployee__isnull=False)
        
        hourlygross = sum(
            (p.hourlyemployee.hourlyrate * 40) for p in hourlypayments
        )
        salariedgross = sum(
            float((p.salariedemployee.salaryamount or 0) / 12) for p in salariedpayments
        )
        
        totalgrosspay = hourlygross + salariedgross + totalovertimepay
        totalnetpay = totalgrosspay - totaldeductions
        
        reportdata = {
            'reportgenerated': datetime.now().isoformat(),
            'payrollmonth': payrollmonthid,
            'summary': {
                'totalpayments': totalpayments,
                'totalgrosspay': round(totalgrosspay, 2),
                'totalovertimepay': round(totalovertimepay, 2),
                'totaldeductions': round(totaldeductions, 2),
                'totalnetpay': round(totalnetpay, 2),
                'hourlyemployees': hourlypayments.count(),
                'salariedemployees': salariedpayments.count()
            },
            'payments': PaymentsSerializer(payments, many=True).data
        }
        
        return Response(reportdata)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get payment statistics"""
        from django.db.models import Avg, Sum
        
        stats = Payments.objects.aggregate(
            avgovertimepay=Avg('overtimepay'),
            totalovertimepay=Sum('overtimepay'),
            totalpayments=Count('id')
        )
        
        return Response(stats)