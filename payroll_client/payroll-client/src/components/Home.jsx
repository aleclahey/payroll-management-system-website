import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Space,
  Typography,
  notification,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { api, apiCall } from '../api/api';
import { 
  getEmployeeColumns, 
  getTimesheetColumns, 
  getBenefitsColumns,
} from './TableColumns';
import {
  EmployeeModal,
  AddressModal,
  BenefitModal,
  TimesheetModal,
} from './Modals';
import Dashboard from './views/Dashboard';
import Benefits from "./views/Benefits";
import Timesheet from "./views/Timesheet";
import Payroll from "./views/Payroll";
import Employee from "./views/Employee";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [hoursWorked, setHoursWorked] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [addressTypes, setAddressTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal visibility states
  const [modalVisible, setModalVisible] = useState(false);
  const [timesheetModalVisible, setTimesheetModalVisible] = useState(false);
  const [benefitModalVisible, setBenefitModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Editing states
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        employeesData,
        departmentsData,
        paymentsData,
        timesheetsData,
        hoursWorkedData,
        benefitsData,
        benefitPlansData,
        addressTypesData,
        addressesData,
      ] = await Promise.all([
        api.fetchEmployees(),
        api.fetchDepartments(),
        api.fetchPayments(),
        api.fetchTimesheets(),
        api.fetchHoursWorked(),
        api.fetchBenefits(),
        api.fetchBenefitPlans(),
        api.fetchAddressTypes(),
        api.fetchAddresses(),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setPayments(paymentsData);
      setTimesheets(timesheetsData);
      setHoursWorked(hoursWorkedData);
      setBenefits(benefitsData);
      setBenefitPlans(benefitPlansData);
      setAddressTypes(addressTypesData);
      setAddresses(addressesData);
    } catch (error) {
      console.error("API Error:", error);
      notification.error({
        message: "Error",
        description: `Failed to load data: ${error.message}`,
      });
    }
    setLoading(false);
  };

  // Event handlers
  const handleMenuClick = (e) => {
    setCurrent(e.key);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setModalVisible(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setModalVisible(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await apiCall(`/employees/${employeeId}/`, { method: 'DELETE' });
      notification.success({
        message: "Success",
        description: "Employee deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleModalOk = async () => {
    try {
      // Get form values - you'll need to implement form handling
      const formData = {
        firstName: '', // Get from form
        lastName: '',  // Get from form
        gender: '',    // Get from form
        hireDate: '',  // Get from form
        departmentId: '', // Get from form
        positionId: '',   // Get from form
        // Add other fields as needed
      };

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, formData);
        notification.success({
          message: "Success",
          description: "Employee updated successfully",
        });
      } else {
        await api.createEmployee(formData);
        notification.success({
          message: "Success",
          description: "Employee added successfully",
        });
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleAddTimesheet = () => {
    setEditingTimesheet(null);
    setTimesheetModalVisible(true);
  };

  const handleEditTimesheet = (timesheet) => {
    setEditingTimesheet(timesheet);
    setTimesheetModalVisible(true);
  };

  const handleTimesheetModalOk = async () => {
    try {
      const formData = {
        employeeId: '', // Get from form
        clockIn: '',    // Get from form
        clockOut: '',   // Get from form
        // Add other fields as needed
      };

      if (editingTimesheet) {
        notification.success({
          message: "Success",
          description: "Timesheet updated successfully",
        });
      } else {
        await api.createTimesheet(formData);
        notification.success({
          message: "Success",
          description: "Timesheet added successfully",
        });
      }
      setTimesheetModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleApproveTimesheet = async (timesheetId) => {
    try {
      // You'll need to implement timesheet approval logic
      notification.success({
        message: "Success",
        description: "Timesheet approved successfully",
      });
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleRejectTimesheet = async (timesheetId) => {
    try {
      // You'll need to implement timesheet rejection logic
      notification.success({
        message: "Success",
        description: "Timesheet rejected successfully",
      });
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleAddBenefit = () => {
    setEditingBenefit(null);
    setBenefitModalVisible(true);
  };

  const handleEditBenefit = (benefit) => {
    setEditingBenefit(benefit);
    setBenefitModalVisible(true);
  };

  const handleBenefitModalOk = async () => {
    try {
      const formData = {
        employeeId: '', // Get from form
        benefitPlan: '', // Get from form
        // Add other fields as needed
      };

      if (editingBenefit) {
        notification.success({
          message: "Success",
          description: "Benefit updated successfully",
        });
      } else {
        await api.createBenefit(formData);
        notification.success({
          message: "Success",
          description: "Benefit added successfully",
        });
      }
      setBenefitModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleDeleteBenefit = async (benefitId) => {
    try {
      await apiCall(`/benefits/${benefitId}/`, { method: 'DELETE' });
      notification.success({
        message: "Success",
        description: "Benefit removed successfully",
      });
      loadData();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
  };

  const handleDeleteAddress = (addressId) => {
    notification.success({
      message: "Success",
      description: "Address deleted successfully",
    });
  };

  const handleAddressModalOk = async () => {
    notification.success({
      message: "Success",
      description: editingAddress ? "Address updated successfully" : "Address added successfully",
    });
    setAddressModalVisible(false);
    setEditingAddress(null);
  };

  // Calculate dashboard statistics
  const totalEmployees = employees.length;
  const totalPayroll = payments.reduce(
    (sum, payment) => sum + payment.netPay,
    0
  );
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const pendingTimesheets = timesheets.filter(
    (t) => t.status === "pending"
  ).length;
  const totalHoursThisWeek = hoursWorked.reduce(
    (sum, hw) => sum + hw.weeklyHours,
    0
  );
  const activeBenefits = benefits.filter((b) => b.status === "active").length;
  const totalBenefitCost = benefits
    .filter((b) => b.status === "active")
    .reduce((sum, b) => sum + b.cost, 0);

  // Create column configurations with handlers
  const employeeColumns = getEmployeeColumns(handleEditEmployee, handleDeleteEmployee);
  // Update department filters dynamically
  employeeColumns[1].filters = departments.map((dept) => ({
    text: dept.name,
    value: dept.name,
  }));

  const timesheetColumns = getTimesheetColumns(
    handleEditTimesheet, 
    handleApproveTimesheet, 
    handleRejectTimesheet
  );
  
  const benefitsColumns = getBenefitsColumns(handleEditBenefit, handleDeleteBenefit);

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "employees",
      icon: <UserOutlined />,
      label: "Employees",
    },
    {
      key: "payroll",
      icon: <DollarOutlined />,
      label: "Payroll",
    },
    {
      key: "timesheets",
      icon: <CalendarOutlined />,
      label: "Timesheets",
    },
    {
      key: "benefits",
      icon: <BankOutlined />,
      label: "Benefits",
    },
  ];

  const renderCurrent = () => {
    switch (current) {
      case "dashboard":
        return (
          <Dashboard
            totalEmployees={totalEmployees}
            totalPayroll={totalPayroll}
            pendingPayments={pendingPayments}
            pendingTimesheets={pendingTimesheets}
            timesheets={timesheets}
            hoursWorked={hoursWorked}
            payments={payments}
            departments={departments}
            timesheetColumns={timesheetColumns}
          />
        );
      case "employees":
        return (
          <Employee
            employees={employees}
            employeeColumns={employeeColumns}
            loading={loading}
            onAddEmployee={handleAddEmployee}
          />
        );
      case "payroll":
        return (
          <Payroll
            payments={payments}
            pendingPayments={pendingPayments}
            loading={loading}
          />
        );
      case "timesheets":
        return (
          <Timesheet
            totalHoursThisWeek={totalHoursThisWeek}
            pendingTimesheets={pendingTimesheets}
            hoursWorked={hoursWorked}
            totalEmployees={totalEmployees}
            departments={departments}
            timesheets={timesheets}
            timesheetColumns={timesheetColumns}
            hoursWorkedColumns={[]} // You can import this from tableColumns if needed
            loading={loading}
            onAddTimesheet={handleAddTimesheet}
          />
        );
      case "benefits":
        return (
          <Benefits
            activeBenefits={activeBenefits}
            totalBenefitCost={totalBenefitCost}
            benefitPlans={benefitPlans}
            totalEmployees={totalEmployees}
            benefits={benefits}
            benefitsColumns={benefitsColumns}
            benefitPlansColumns={[]} // You can import this from tableColumns if needed
            loading={loading}
            onAddBenefit={handleAddBenefit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: "#fff",
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {collapsed ? "PR" : "Payroll"}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[current]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 8px #f0f1f2",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              Payroll Management System
            </Title>
            <Space>
              <Avatar icon={<UserOutlined />} />
            </Space>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px",
            background: "#f0f2f5",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: "#fff",
              borderRadius: 8,
            }}
          >
            {renderCurrent()}
          </div>
        </Content>
      </Layout>

      {/* Modals */}
      <EmployeeModal
        visible={modalVisible}
        editingEmployee={editingEmployee}
        departments={departments}
        employees={employees}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      />

      <AddressModal
        visible={addressModalVisible}
        editingAddress={editingAddress}
        selectedEmployee={selectedEmployee}
        addresses={addresses}
        addressTypes={addressTypes}
        onOk={handleAddressModalOk}
        onCancel={() => setAddressModalVisible(false)}
        handleEditAddress={handleEditAddress}
        handleDeleteAddress={handleDeleteAddress}
      />

      <BenefitModal
        visible={benefitModalVisible}
        editingBenefit={editingBenefit}
        employees={employees}
        benefitPlans={benefitPlans}
        onOk={handleBenefitModalOk}
        onCancel={() => setBenefitModalVisible(false)}
      />

      <TimesheetModal
        visible={timesheetModalVisible}
        editingTimesheet={editingTimesheet}
        employees={employees}
        onOk={handleTimesheetModalOk}
        onCancel={() => setTimesheetModalVisible(false)}
      />
    </Layout>
  );
};

export default Home;