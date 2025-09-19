// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Generic API helper functions
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      mode: 'cors', // Enable CORS
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorData}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
    
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API functions matching your database endpoints
export const api = {
  // Department APIs
  async fetchDepartments() {
    const data = await apiCall('/departments/');
    return data.map(dept => ({
      id: dept.id,
      name: dept.departmentname,
      description: dept.departmentdesc,
      employeeCount: 0 // This would need to be calculated or included in the API response
    }));
  },

  async createDepartment(departmentData) {
    return apiCall('/departments/', {
      method: 'POST',
      body: JSON.stringify({
        departmentname: departmentData.name,
        departmentdesc: departmentData.description
      }),
    });
  },

  async updateDepartment(id, departmentData) {
    return apiCall(`/departments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({
        departmentname: departmentData.name,
        departmentdesc: departmentData.description
      }),
    });
  },

  // Employee Position APIs
  async fetchPositions() {
    const data = await apiCall('/employee-positions/');
    return data.map(pos => ({
      id: pos.id,
      title: pos.title,
      fromDate: pos.fromdate,
      toDate: pos.todate
    }));
  },

  async createPosition(positionData) {
    return apiCall('/employee-positions/', {
      method: 'POST',
      body: JSON.stringify({
        title: positionData.title,
        fromdate: positionData.fromDate,
        todate: positionData.toDate
      }),
    });
  },

  // Address Type APIs
  async fetchAddressTypes() {
    const data = await apiCall('/address-types/');
    return data.map(type => ({
      id: type.id,
      name: type.typename,
      description: type.typedescription
    }));
  },

  // Address APIs
  async fetchAddresses() {
    const data = await apiCall('/addresses/');
    return data.map(addr => ({
      id: addr.id,
      street: addr.street,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalcode,
      country: addr.country,
      addressTypeId: addr.addresstypeid
    }));
  },

  async createAddress(addressData) {
    return apiCall('/addresses/', {
      method: 'POST',
      body: JSON.stringify({
        street: addressData.street,
        city: addressData.city,
        province: addressData.province,
        postalcode: addressData.postalCode,
        country: addressData.country,
        addresstypeid: addressData.addressTypeId
      }),
    });
  },

  // Employee APIs
  async fetchEmployees() {
    const [employees, departments, positions, hourlyEmployees, salariedEmployees] = await Promise.all([
      apiCall('/employees/'),
      apiCall('/departments/'),
      apiCall('/employee-positions/'),
      apiCall('/hourly-employees/'),
      apiCall('/salaried-employees/')
    ]);

    return employees.map(emp => {
      const department = departments.find(d => d.id === emp.departmentid);
      const position = positions.find(p => p.id === emp.positionid);
      const hourlyEmp = hourlyEmployees.find(h => h.employeeid === emp.id);
      const salariedEmp = salariedEmployees.find(s => s.employeeid === emp.id);

      return {
        id: emp.id,
        firstName: emp.firstname,
        lastName: emp.lastname,
        gender: emp.gender,
        hireDate: emp.hiredate,
        managerEmployeeId: emp.manageremployeeid,
        departmentId: emp.departmentid,
        positionId: emp.positionid,
        addressInfoId: emp.addressinfoid,
        lastUpdated: emp.lastupdated,
        department: department?.departmentname || '',
        position: position?.title || '',
        type: hourlyEmp ? 'hourly' : 'salaried',
        salary: salariedEmp?.salaryamount || null,
        hourlyRate: hourlyEmp?.hourlyrate || null
      };
    });
  },

  async createEmployee(employeeData) {
    return apiCall('/employees/', {
      method: 'POST',
      body: JSON.stringify({
        firstname: employeeData.firstName,
        lastname: employeeData.lastName,
        gender: employeeData.gender,
        hiredate: employeeData.hireDate,
        manageremployeeid: employeeData.managerEmployeeId,
        departmentid: employeeData.departmentId,
        positionid: employeeData.positionId,
        addressinfoid: employeeData.addressInfoId,
        lastupdated: new Date().toISOString().split('T')[0]
      }),
    });
  },

  async updateEmployee(id, employeeData) {
    return apiCall(`/employees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({
        firstname: employeeData.firstName,
        lastname: employeeData.lastName,
        gender: employeeData.gender,
        hiredate: employeeData.hireDate,
        manageremployeeid: employeeData.managerEmployeeId,
        departmentid: employeeData.departmentId,
        positionid: employeeData.positionId,
        addressinfoid: employeeData.addressInfoId,
        lastupdated: new Date().toISOString().split('T')[0]
      }),
    });
  },

  // Payroll Month APIs
  async fetchPayrollMonths() {
    const data = await apiCall('/payroll-months/');
    return data.map(pm => ({
      id: pm.id,
      payrollMonth: pm.payrollmonth
    }));
  },

  // Deductions APIs
  async fetchDeductions() {
    const data = await apiCall('/deductions/');
    return data.map(ded => ({
      id: ded.id,
      deductionType: ded.deductiontype,
      deductionAmount: ded.deductionamount
    }));
  },

  // Hourly Employee APIs
  async fetchHourlyEmployees() {
    const data = await apiCall('/hourly-employees/');
    return data.map(he => ({
      id: he.id,
      employeeId: he.employeeid,
      payrollMonthId: he.payrollmonthid,
      startDate: he.startdate,
      endDate: he.enddate,
      hourlyRate: he.hourlyrate,
      deductionId: he.deductionid
    }));
  },

  // Salaried Employee APIs
  async fetchSalariedEmployees() {
    const data = await apiCall('/salaried-employees/');
    return data.map(se => ({
      id: se.id,
      employeeId: se.employeeid,
      startDate: se.startdate,
      endDate: se.enddate,
      salaryAmount: se.salaryamount,
      bonusAmount: se.bonusamount,
      deductionId: se.deductionid
    }));
  },

  // Benefits APIs
  async fetchBenefits() {
    const [benefits, employees] = await Promise.all([
      apiCall('/benefits/'),
      apiCall('/employees/')
    ]);

    return benefits.map(benefit => {
      const employee = employees.find(e => e.id === benefit.employeeid);
      return {
        id: benefit.id,
        employeeId: benefit.employeeid,
        employeename: employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown',
        benefitplan: benefit.benefitplan,
        status: 'active', // You might need to add this field to your database
        enrollmentDate: '2023-01-15', // You might need to add this field
        cost: 450.0 // You might need to calculate this or add it to your database
      };
    });
  },

  async createBenefit(benefitData) {
    return apiCall('/benefits/', {
      method: 'POST',
      body: JSON.stringify({
        employeeid: benefitData.employeeId,
        benefitplan: benefitData.benefitPlan
      }),
    });
  },

  // Timesheets APIs
  async fetchTimesheets() {
    const [timesheets, employees, departments] = await Promise.all([
      apiCall('/timesheets/'),
      apiCall('/employees/'),
      apiCall('/departments/')
    ]);

    return timesheets.map(ts => {
      const employee = employees.find(e => e.id === ts.employeeid);
      const department = employee ? departments.find(d => d.id === employee.departmentid) : null;
      
      return {
        id: ts.id,
        employeeId: ts.employeeid,
        employeeName: employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown',
        date: new Date().toISOString().split('T')[0], // You might need to add date field
        clockIn: ts.clockin,
        clockOut: ts.clockout,
        breakTime: 30, // You might need to add this field
        totalHours: 8.0, // Calculate from clockin/clockout
        overtimeHours: 0, // Calculate based on total hours
        status: 'pending', // You might need to add this field
        department: department?.departmentname || ''
      };
    });
  },

  async createTimesheet(timesheetData) {
    return apiCall('/timesheets/', {
      method: 'POST',
      body: JSON.stringify({
        employeeid: timesheetData.employeeId,
        clockin: timesheetData.clockIn,
        clockout: timesheetData.clockOut
      }),
    });
  },

  // Personal Days APIs
  async fetchPersonalDays() {
    const data = await apiCall('/personal-days/');
    return data.map(pd => ({
      id: pd.id,
      employeeId: pd.employeeid,
      pdType: pd.pdtype,
      paid: pd.paid,
      daysOff: pd.daysoff
    }));
  },

  // Bank Information APIs
  async fetchBankInformation() {
    const data = await apiCall('/bank-information/');
    return data.map(bi => ({
      id: bi.id,
      employeeId: bi.employeeid,
      bankInstitution: bi.bankinstitution,
      institutionNumber: bi.institutionnumber,
      accountNumber: bi.accountnumber,
      transitNumber: bi.transitnumber
    }));
  },

  // Hours Worked APIs
  async fetchHoursWorked() {
    const [hoursWorked, employees, departments] = await Promise.all([
      apiCall('/hours-worked/'),
      apiCall('/employees/'),
      apiCall('/departments/')
    ]);

    // Group hours by employee (this is a simplified approach)
    const employeeHours = {};
    hoursWorked.forEach(hw => {
      if (!employeeHours[hw.payrollmonthid]) {
        employeeHours[hw.payrollmonthid] = hw;
      }
    });

    return employees.map(emp => {
      const department = departments.find(d => d.id === emp.departmentid);
      const hours = Object.values(employeeHours)[0] || { hoursworked: 40, overtimehours: 0 };
      
      return {
        employeeId: emp.id,
        employeeName: `${emp.firstname} ${emp.lastname}`,
        weeklyHours: hours.hoursworked || 40,
        overtimeHours: hours.overtimehours || 0,
        department: department?.departmentname || ''
      };
    });
  },

  // Payments APIs
  async fetchPayments() {
    const [payments, employees, deductions] = await Promise.all([
      apiCall('/payments/'),
      apiCall('/employees/'),
      apiCall('/deductions/')
    ]);

    return payments.map(payment => {
      const employee = employees.find(e => e.id === payment.employeeid);
      const deduction = deductions.find(d => d.id === payment.deductionsid);
      
      return {
        id: payment.id,
        employeeId: payment.employeeid,
        employeeName: employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown',
        grossPay: 5000, // You'll need to calculate this
        deductions: deduction?.deductionamount || 0,
        netPay: 4500, // You'll need to calculate this
        payPeriod: '2024-01', // You'll need to get this from payroll month
        status: 'pending', // You might need to add this field
        overtimePay: payment.overtimepay || 0
      };
    });
  },

  async createPayment(paymentData) {
    return apiCall('/payments/', {
      method: 'POST',
      body: JSON.stringify({
        employeeid: paymentData.employeeId,
        payrollmonthid: paymentData.payrollMonthId,
        overtimepay: paymentData.overtimePay,
        deductionsid: paymentData.deductionsId,
        hourlyemployeeid: paymentData.hourlyEmployeeId,
        salariedemployeeid: paymentData.salariedEmployeeId
      }),
    });
  },

  // Benefit Plans (you might need to create this endpoint or use a static list)
  async fetchBenefitPlans() {
    // Since this doesn't exist in your API, return static data
    // You might want to create a separate table/endpoint for benefit plans
    return [
      {
        id: 1,
        name: "Health Insurance",
        description: "Comprehensive medical coverage including doctor visits, hospital stays, and prescription drugs",
        provider: "BlueCross BlueShield",
        monthlyCost: 450.0,
        employeeContribution: 150.0,
        employerContribution: 300.0,
        category: "Medical",
      },
      {
        id: 2,
        name: "Dental Insurance",
        description: "Dental coverage including cleanings, fillings, and major dental work",
        provider: "Delta Dental",
        monthlyCost: 125.0,
        employeeContribution: 25.0,
        employerContribution: 100.0,
        category: "Dental",
      },
      {
        id: 3,
        name: "Vision Insurance",
        description: "Eye care coverage including exams, glasses, and contact lenses",
        provider: "VSP Vision",
        monthlyCost: 75.0,
        employeeContribution: 15.0,
        employerContribution: 60.0,
        category: "Vision",
      }
    ];
  }
};

export { apiCall };