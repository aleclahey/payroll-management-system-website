// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000/api";

// Utility function to format payroll month
const formatPayrollMonth = (dateString) => {
  if(!dateString.includes("-")) return dateString; // already formatted
  const [year, month] = dateString.split('-');
  const date = new Date(year, month - 1); // month - 1 because Date months are 0-indexed
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName} ${year}`;
};

// Generic API helper functions
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      mode: "cors", // Enable CORS
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `API call failed: ${response.status} ${response.statusText} - ${errorData}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// API functions matching your database endpoints
export const api = {
  // Department APIs
  async fetchDepartments() {
    const data = await apiCall("/departments/");
    return data.map((dept) => ({
      id: dept.id,
      name: dept.departmentname,
      description: dept.departmentdesc,
      employeeCount: 0, // This would need to be calculated or included in the API response
    }));
  },

  async createDepartment(departmentData) {
    return apiCall("/departments/", {
      method: "POST",
      body: JSON.stringify({
        departmentname: departmentData.name,
        departmentdesc: departmentData.description,
      }),
    });
  },

  async updateDepartment(id, departmentData) {
    return apiCall(`/departments/${id}/`, {
      method: "PUT",
      body: JSON.stringify({
        departmentname: departmentData.name,
        departmentdesc: departmentData.description,
      }),
    });
  },

  // Employee Position APIs
  async fetchPositions() {
    const data = await apiCall("/employee-positions/");
    return data.map((pos) => ({
      id: pos.id,
      title: pos.title,
      fromDate: pos.fromdate,
      toDate: pos.todate,
    }));
  },

  async createPosition(positionData) {
    const response = await apiCall("/employee-positions/", {
      method: "POST",
      body: JSON.stringify({
        title: positionData.title,
        fromdate:
          positionData.fromDate || new Date().toISOString().split("T")[0],
        todate: positionData.toDate || null,
      }),
    });
    return response;
  },

  // Address Type APIs
  async fetchAddressTypes() {
    const data = await apiCall("/address-types/");
    return data.map((type) => ({
      id: type.id,
      name: type.typename,
      description: type.typedescription,
    }));
  },

  // Address APIs
  async fetchAddresses() {
    const data = await apiCall("/addresses/");
    return data.map((addr) => ({
      id: addr.id,
      street: addr.street,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalcode,
      country: addr.country,
      addressTypeId: addr.addresstypeid,
    }));
  },

  async createAddress(addressData) {
    return apiCall("/addresses/", {
      method: "POST",
      body: JSON.stringify({
        street: addressData.street,
        city: addressData.city,
        province: addressData.province,
        postalcode: addressData.postalCode,
        country: addressData.country,
        addresstypeid: addressData.addressTypeId,
      }),
    });
  },

  // Employee APIs
  async fetchEmployees() {
    const [
      employees,
      departments,
      positions,
      hourlyEmployees,
      salariedEmployees,
    ] = await Promise.all([
      apiCall("/employees/"),
      apiCall("/departments/"),
      apiCall("/employee-positions/"),
      apiCall("/hourly-employees/"),
      apiCall("/salaried-employees/"),
    ]);

    return employees.map((emp) => {
      const department = departments.find((d) => d.id === emp.department);
      const position = positions.find((p) => p.id === emp.employeeposition);
      const hourlyEmp = hourlyEmployees.find((h) => h.employee === emp.id);
      const salariedEmp = salariedEmployees.find((s) => s.employee === emp.id);

      return {
        id: emp.id,
        firstName: emp.firstname,
        lastName: emp.lastname,
        gender: emp.gender,
        hireDate: emp.hiredate,
        managerEmployeeId: emp.manageremployee,
        departmentId: emp.department,
        positionId: emp.employeeposition,
        addressInfoId: emp.addressinfo,
        lastUpdated: emp.lastupdated,
        department: department?.departmentname || "",
        position: position?.title || "",
        type: hourlyEmp ? "hourly" : salariedEmp ? "salaried" : "hourly",
        salary: salariedEmp?.salaryamount || null,
        hourlyRate: hourlyEmp?.hourlyrate || null,
      };
    });
  },

  async createEmployee(employeeData) {
    const response = await apiCall("/employees/", {
      method: "POST",
      body: JSON.stringify({
        firstname: employeeData.firstName,
        lastname: employeeData.lastName,
        gender: employeeData.gender,
        hiredate: employeeData.hireDate,
        manageremployee: employeeData.managerEmployeeId,
        department: employeeData.departmentId,
        employeeposition: employeeData.positionId,
        addressinfo: employeeData.addressInfoId,
        lastupdated: new Date().toISOString().split("T")[0],
      }),
    });

    console.log("Create employee response:", response);
    return response;
  },

  async updateEmployee(id, employeeData) {
    return apiCall(`/employees/${id}/`, {
      method: "PUT",
      body: JSON.stringify({
        firstname: employeeData.firstName,
        lastname: employeeData.lastName,
        gender: employeeData.gender,
        hiredate: employeeData.hireDate,
        manageremployee: employeeData.managerEmployeeId,
        department: employeeData.departmentId,
        employeeposition: employeeData.positionId,
        addressinfo: employeeData.addressInfoId,
        lastupdated: new Date().toISOString().split("T")[0],
      }),
    });
  },

  // Payroll Month APIs
  async fetchPayrollMonths() {
    const data = await apiCall("/payroll-months/");
    return data.map((pm) => ({
      id: pm.id,
      payrollMonth: formatPayrollMonth(pm.payrollmonth), // Format to readable month name
      rawPayrollMonth: pm.payrollmonth, // Keep original format for API calls if needed
    }));
  },

  // Helper function to get or create default payroll month
  async getOrCreateDefaultPayrollMonth() {
    try {
      const payrollMonths = await apiCall("/payroll-months/");

      // Get current month/year for default
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;

      // Find existing payroll month for current period
      let existingMonth = payrollMonths.find(
        (pm) => pm.payrollmonth === currentMonthYear
      );

      if (existingMonth) {
        return existingMonth.id;
      }

      // If no current month exists, create it
      const newPayrollMonth = await apiCall("/payroll-months/", {
        method: "POST",
        body: JSON.stringify({
          payrollmonth: currentMonthYear,
        }),
      });

      return newPayrollMonth.id;
    } catch (error) {
      console.error("Error in getOrCreateDefaultPayrollMonth:", error);
      // If we can't create/get payroll month, try to use the first available one
      try {
        const payrollMonths = await apiCall("/payroll-months/");
        return payrollMonths.length > 0 ? payrollMonths[0].id : null;
      } catch (fallbackError) {
        console.error(
          "Fallback payroll month retrieval failed:",
          fallbackError
        );
        return null;
      }
    }
  },

  // Deductions APIs
  async fetchDeductions() {
    const data = await apiCall("/deductions/");
    return data.map((ded) => ({
      id: ded.id,
      deductionType: ded.deductiontype,
      deductionAmount: ded.deductionamount,
    }));
  },

  // Create a standard deduction - simplified approach
  async createDeduction(deductionType, deductionAmount) {
    try {
      const newDeduction = await apiCall("/deductions/", {
        method: "POST",
        body: JSON.stringify({
          deductiontype: deductionType,
          deductionamount: deductionAmount,
        }),
      });
      return newDeduction.id;
    } catch (error) {
      console.error("Error creating deduction:", error);
      throw error;
    }
  },

  // Hourly Employee APIs
  async fetchHourlyEmployees() {
    const data = await apiCall("/hourly-employees/");
    return data.map((he) => ({
      id: he.id,
      employeeId: he.employee,
      payrollMonthId: he.payrollmonth,
      startDate: he.startdate,
      endDate: he.enddate,
      hourlyRate: he.hourlyrate,
      deductionId: he.deduction,
    }));
  },

  async createHourlyEmployee(employeeData) {
    try {
      // Create a standard deduction for hourly employees
      const estimatedMonthlyEarnings = employeeData.hourlyRate * 160; // 40 hours/week * 4 weeks
      const deductionAmount = estimatedMonthlyEarnings * 0.1; // 10% deduction
      const deductionId = await this.createDeduction(
        "Standard Hourly",
        deductionAmount
      );

      // Get or create a default payroll month
      const payrollMonthId = await this.getOrCreateDefaultPayrollMonth();

      return apiCall("/hourly-employees/", {
        method: "POST",
        body: JSON.stringify({
          employeename: `${employeeData.firstName} ${employeeData.lastName}`,
          startdate: employeeData.hireDate,
          enddate: null,
          hourlyrate: employeeData.hourlyRate,
          employee: employeeData.id,
          deduction: deductionId,
          payrollmonth: payrollMonthId,
        }),
      });
    } catch (error) {
      console.error("Error in createHourlyEmployee:", error);
      throw error;
    }
  },

  async updateOrCreateHourlyEmployee(employeeData) {
    try {
      const hourlyEmployees = await apiCall("/hourly-employees/");
      const existingHourly = hourlyEmployees.find(
        (he) => he.employee === employeeData.id
      );

      if (existingHourly) {
        // Update existing hourly employee record
        const estimatedMonthlyEarnings = employeeData.hourlyRate * 160;
        const deductionAmount = estimatedMonthlyEarnings * 0.1;

        // Update the existing deduction
        if (existingHourly.deduction) {
          await apiCall(`/deductions/${existingHourly.deduction}/`, {
            method: "PUT",
            body: JSON.stringify({
              deductiontype: "Standard Hourly",
              deductionamount: deductionAmount,
            }),
          });
        }

        // Get payroll month ID - use existing or get default
        const payrollMonthId =
          existingHourly.payrollmonth ||
          (await this.getOrCreateDefaultPayrollMonth());

        return apiCall(`/hourly-employees/${existingHourly.id}/`, {
          method: "PUT",
          body: JSON.stringify({
            employeename: `${employeeData.firstName} ${employeeData.lastName}`,
            startdate: employeeData.hireDate,
            enddate: existingHourly.enddate,
            hourlyrate: employeeData.hourlyRate,
            employee: employeeData.id,
            deduction: existingHourly.deduction,
            payrollmonth: payrollMonthId,
          }),
        });
      } else {
        return this.createHourlyEmployee(employeeData);
      }
    } catch (error) {
      console.error("Error in updateOrCreateHourlyEmployee:", error);
      throw error;
    }
  },

  // Salaried Employee APIs
  async fetchSalariedEmployees() {
    const data = await apiCall("/salaried-employees/");
    return data.map((se) => ({
      id: se.id,
      employeeId: se.employee,
      startDate: se.startdate,
      endDate: se.enddate,
      salaryAmount: se.salaryamount,
      bonusAmount: se.bonusamount,
      deductionId: se.deduction,
    }));
  },

  async createSalary(employeeData) {
    try {
      // Create a standard deduction for salaried employees
      const deductionAmount = employeeData.salaryAmount * 0.1; // 10% deduction
      const deductionId = await this.createDeduction(
        "Standard Salary",
        deductionAmount
      );

      return apiCall("/salaried-employees/", {
        method: "POST",
        body: JSON.stringify({
          employeename: `${employeeData.firstName} ${employeeData.lastName}`,
          startdate: employeeData.hireDate,
          enddate: null,
          salaryamount: employeeData.salaryAmount,
          bonusamount: null,
          employee: employeeData.id,
          deduction: deductionId,
        }),
      });
    } catch (error) {
      console.error("Error in createSalary:", error);
      throw error;
    }
  },

  async updateOrCreateSalary(employeeData) {
    try {
      const salariedEmployees = await apiCall("/salaried-employees/");
      const existingSalary = salariedEmployees.find(
        (se) => se.employee === employeeData.id
      );

      if (existingSalary) {
        // Update existing salary record
        const deductionAmount = employeeData.salaryAmount * 0.1;

        // Update the existing deduction
        if (existingSalary.deduction) {
          await apiCall(`/deductions/${existingSalary.deduction}/`, {
            method: "PUT",
            body: JSON.stringify({
              deductiontype: "Standard Salary",
              deductionamount: deductionAmount,
            }),
          });
        }

        return apiCall(`/salaried-employees/${existingSalary.id}/`, {
          method: "PUT",
          body: JSON.stringify({
            employeename: `${employeeData.firstName} ${employeeData.lastName}`,
            startdate: employeeData.hireDate,
            enddate: existingSalary.enddate,
            salaryamount: employeeData.salaryAmount,
            bonusamount: existingSalary.bonusamount,
            employee: employeeData.id,
            deduction: existingSalary.deduction,
          }),
        });
      } else {
        return this.createSalary(employeeData);
      }
    } catch (error) {
      console.error("Error in updateOrCreateSalary:", error);
      throw error;
    }
  },

  // Benefits APIs
  async fetchBenefits() {
    const [benefits, employees, benefitPlans] = await Promise.all([
      apiCall("/benefits/"),
      apiCall("/employees/"),
      this.fetchBenefitPlans(), // Corrected this line
    ]);

    return benefits.map((benefit) => {
      const employee = employees.find((e) => e.id === benefit.employee);
      const benefitPlan = benefitPlans.find(
        (bp) => bp.name === benefit.benefitplan
      );

      return {
        id: benefit.id,
        employeeId: benefit.employee,
        employeename: employee
          ? `${employee.firstname} ${employee.lastname}`
          : "Unknown",
        benefitplan: benefit.benefitplan,
        status: "active",
        cost: benefitPlan?.monthlyCost || 0, // fallback in case not found
      };
    });
  },

  async createBenefit(benefitData) {
    return apiCall("/benefits/", {
      method: "POST",
      body: JSON.stringify({
        employee: benefitData.employeeId,
        benefitplan: benefitData.benefitPlan,
      }),
    });
  },

  // Timesheets APIs - Updated to match actual API structure
  async fetchTimesheets() {
    const [timesheets, employees, departments] = await Promise.all([
      apiCall("/timesheets/"),
      apiCall("/employees/"),
      apiCall("/departments/"),
    ]);

    return timesheets.map((ts) => {
      const employee = employees.find((e) => e.id === ts.employee);
      const department = employee
        ? departments.find((d) => d.id === employee.department)
        : null;

      // Calculate total hours from clock in/out times
      let totalHours = ts.hoursworked || 0;
      let overtimeHours = 0;
      let breakTime = 30; // Default 30 minutes

      // If hours worked is more than 8, calculate overtime
      if (totalHours > 8) {
        overtimeHours = totalHours - 8;
      }

      return {
        id: ts.id,
        employeeId: ts.employee,
        employeeName:
          ts.employeename ||
          (employee ? `${employee.firstname} ${employee.lastname}` : "Unknown"),
        date: new Date().toISOString().split("T")[0], // Current date as default
        clockIn: ts.clockin,
        clockOut: ts.clockout,
        hoursWorked: ts.hoursworked,
        breakTime: breakTime,
        totalHours: totalHours,
        overtimeHours: overtimeHours,
        status: totalHours > 0 ? "completed" : "pending",
        department: department?.departmentname || "",
      };
    });
  },

  async createTimesheet(timesheetData) {
    return apiCall("/timesheets/", {
      method: "POST",
      body: JSON.stringify({
        employee: timesheetData.employeeId || timesheetData.employee,
        clockin: timesheetData.clockIn,
        clockout: timesheetData.clockOut,
        // Note: hoursworked and employeename might be calculated/set by the backend
      }),
    });
  },

  async updateTimesheet(id, timesheetData) {
    return apiCall(`/timesheets/${id}/`, {
      method: "PUT",
      body: JSON.stringify({
        employee: timesheetData.employeeId || timesheetData.employee,
        clockin: timesheetData.clockIn,
        clockout: timesheetData.clockOut,
      }),
    });
  },

  async deleteTimesheet(id) {
    return apiCall(`/timesheets/${id}/`, {
      method: "DELETE",
    });
  },

  // Personal Days APIs
  async fetchPersonalDays() {
    const data = await apiCall("/personal-days/");
    return data.map((pd) => ({
      id: pd.id,
      employeeId: pd.employee,
      pdType: pd.pdtype,
      paid: pd.paid,
      daysOff: pd.daysoff,
    }));
  },

  // Bank Information APIs
  async fetchBankInformation() {
    const data = await apiCall("/bank-information/");
    return data.map((bi) => ({
      id: bi.id,
      employeeId: bi.employee,
      bankInstitution: bi.bankinstitution,
      institutionNumber: bi.institutionnumber,
      accountNumber: bi.accountnumber,
      transitNumber: bi.transitnumber,
    }));
  },

  // Hours Worked APIs
  async fetchHoursWorked() {
    const [hoursWorked, employees, departments] = await Promise.all([
      apiCall("/hours-worked/"),
      apiCall("/employees/"),
      apiCall("/departments/"),
    ]);

    const employeeHours = {};
    hoursWorked.forEach((hw) => {
      if (!employeeHours[hw.payrollmonth]) {
        employeeHours[hw.payrollmonth] = hw;
      }
    });

    return employees.map((emp) => {
      const department = departments.find((d) => d.id === emp.department);
      const hours = Object.values(employeeHours)[0] || {
        hoursworked: 40,
        overtimehours: 0,
      };

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstname} ${emp.lastname}`,
        weeklyHours: hours.hoursworked || 40,
        overtimeHours: hours.overtimehours || 0,
        department: department?.departmentname || "",
      };
    });
  },

  // Payments APIs
  async fetchPayments() {
    const [
      payments,
      employees,
      deductions,
      timesheets,
      hourlyEmployees,
      salariedEmployees,
      payrollMonths,
    ] = await Promise.all([
      apiCall("/payments/"),
      apiCall("/employees/"),
      apiCall("/deductions/"),
      apiCall("/timesheets/"),
      apiCall("/hourly-employees/"),
      apiCall("/salaried-employees/"),
      apiCall("/payroll-months/"),
    ]);

    return payments
      .map((payment) => {
        const employee = employees.find((e) => e.id === payment.employee);

        if (!employee) {
          // Skip calculation for unknown employee
          return null;
        }

        const hourly = hourlyEmployees.find(
          (h) => h.employee === payment.employee
        );
        const salaried = salariedEmployees.find(
          (s) => s.employee === payment.employee
        );
        const deduction = deductions.find((d) => d.id === payment.deductions);
        
        // Find the payroll month and format it
        const payrollMonth = payrollMonths.find((pm) => pm.id === payment.payrollmonth);
        const formattedPayPeriod = payrollMonth 
          ? formatPayrollMonth(payrollMonth.payrollmonth)
          : payment.payrollmonthname || "Unknown Period";

        const employeeName = `${employee.firstname} ${employee.lastname}`;

        let grossPay = 0;
        let overtimePay = 0;
        let totalHoursWorked = 0;
        let totalOvertime = 0;

        if (hourly) {
          const employeeTimesheets = timesheets.filter(
            (ts) => ts.employee === payment.employee
          );

          totalHoursWorked = employeeTimesheets.reduce(
            (sum, ts) => sum + (ts.hoursworked || 0),
            0
          );

          totalOvertime = employeeTimesheets.reduce(
            (sum, ts) => sum + (ts.overtimehours || 0),
            0
          );

          const regularHours = totalHoursWorked - totalOvertime;
          const regularPay = hourly.hourlyrate * regularHours;
          overtimePay = hourly.hourlyrate * 1.5 * totalOvertime;

          grossPay = regularPay + overtimePay;
        } else if (salaried) {
          const period = payment.payrollperiod || "monthly";

          if (period === "monthly") {
            grossPay = salaried.salaryamount / 12;
          } else if (period === "biweekly") {
            grossPay = salaried.salaryamount / 26;
          } else {
            grossPay = salaried.salaryamount;
          }

          grossPay = Math.round(grossPay * 100) / 100;
        }

        const deductionAmount = deduction?.deductionamount || 0;
        const netPay = grossPay - deductionAmount;

        return {
          id: payment.id,
          employeeId: payment.employee,
          employeeName: employeeName,
          grossPay: Math.round(grossPay * 100) / 100,
          deductions: deductionAmount,
          netPay: Math.round(netPay * 100) / 100,
          payPeriod: formattedPayPeriod, // Now formatted as "September 2025"
          overtimePay: Math.round(overtimePay * 100) / 100,
          totalHoursWorked,
          totalOvertimeHours: totalOvertime,
        };
      })
      .filter((payment) => payment !== null); // Remove entries with unknown employee
  },
  
  async createPayment(paymentData) {
    return apiCall("/payments/", {
      method: "POST",
      body: JSON.stringify({
        employee: paymentData.employeeId,
        payrollmonth: paymentData.payrollMonthId,
        overtimepay: paymentData.overtimePay,
        deductions: paymentData.deductionsId,
        hourlyemployee: paymentData.hourlyEmployeeId,
        salariedemployee: paymentData.salariedEmployeeId,
      }),
    });
  },

  // Benefit Plans (static data)
  async fetchBenefitPlans() {
    return [
      {
        id: 1,
        name: "Health Insurance",
        description:
          "Comprehensive medical coverage including doctor visits, hospital stays, and prescription drugs",
        provider: "BlueCross BlueShield",
        monthlyCost: 150.0,
        employeeContribution: 150.0,
        employerContribution: 300.0,
        category: "Medical",
      },
      {
        id: 2,
        name: "Dental Insurance",
        description:
          "Dental coverage including cleanings, fillings, and major dental work",
        provider: "Delta Dental",
        monthlyCost: 75.0,
        employeeContribution: 25.0,
        employerContribution: 100.0,
        category: "Dental",
      },
      {
        id: 3,
        name: "Vision Insurance",
        description:
          "Vision coverage including eye exams, glasses, and contact lenses",
        provider: "EverBlue Vision",
        monthlyCost: 50.0,
        employeeContribution: 25.0,
        employerContribution: 100.0,
        category: "Vision",
      },
    ];
  },
};

export { apiCall, formatPayrollMonth };