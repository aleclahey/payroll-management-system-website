import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Space, Typography, notification } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { api, apiCall } from "../api/api";
import {
  getEmployeeColumns,
  getTimesheetColumns,
  getBenefitsColumns,
} from "./TableColumns";
import { EmployeeModal } from "./modals/EmployeeModal";
import { AddressModal } from "./modals/AddressModal";
import { BenefitModal } from "./modals/BenefitsModal";
import { TimesheetModal } from "./modals/TimesheetModal";
import Dashboard from "./views/Dashboard";
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
  const [positions, setPositions] = useState([]); // Add positions state
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
        // Add positions loading if available
        // positionsData,
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
        // api.fetchPositions(), // Add this if you have positions endpoint
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
      // setPositions(positionsData); // Set positions if available
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

  // Employee handlers
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
      await apiCall(`/employees/${employeeId}/`, { method: "DELETE" });
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

  // Timesheet handlers
  const handleAddTimesheet = () => {
    setEditingTimesheet(null);
    setTimesheetModalVisible(true);
  };

  const handleEditTimesheet = (timesheet) => {
    setEditingTimesheet(timesheet);
    setTimesheetModalVisible(true);
  };

  const handleApproveTimesheet = async (timesheetId) => {
    try {
      await api.updateTimesheet(timesheetId, { status: "approved" });
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
      await api.updateTimesheet(timesheetId, { status: "rejected" });
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

  // Benefit handlers
  const handleAddBenefit = () => {
    setEditingBenefit(null);
    setBenefitModalVisible(true);
  };

  const handleEditBenefit = (benefit) => {
    setEditingBenefit(benefit);
    setBenefitModalVisible(true);
  };

  const handleDeleteBenefit = async (benefitId) => {
    try {
      await apiCall(`/benefits/${benefitId}/`, { method: "DELETE" });
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

  // Address handlers
  const handleManageAddresses = (employee) => {
    setSelectedEmployee(employee);
    setEditingAddress(null);
    setAddressModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
  };

  const handleAddAddress = (employee) => {
    setEditingAddress({ employeeId: employee.id });
  };

  // const handleDeleteAddress = async (addressId) => {
  //   // This is now handled inside the modal
  // };

  // Modal success handlers (called after successful operations)
  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingEmployee(null);
    loadData();
  };

  const handleTimesheetModalSuccess = () => {
    setTimesheetModalVisible(false);
    setEditingTimesheet(null);
    loadData();
  };

  const handleBenefitModalSuccess = () => {
    setBenefitModalVisible(false);
    setEditingBenefit(null);
    loadData();
  };

  const handleAddressModalSuccess = () => {
    setAddressModalVisible(false);
    setEditingAddress(null);
    setSelectedEmployee(null);
    loadData();
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
  const employeeColumns = getEmployeeColumns(
    handleEditEmployee,
    handleDeleteEmployee,
    handleManageAddresses // Add address management handler
  );

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

  const benefitsColumns = getBenefitsColumns(
    handleEditBenefit,
    handleDeleteBenefit
  );

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
        positions={positions}
        onSuccess={handleModalSuccess}
        onCancel={() => {
          setModalVisible(false);
          setEditingEmployee(null);
        }}
      />

      <AddressModal
        visible={addressModalVisible}
        editingAddress={editingAddress}
        selectedEmployee={selectedEmployee}
        addresses={addresses}
        addressTypes={addressTypes}
        onSuccess={handleAddressModalSuccess}
        onCancel={() => {
          setAddressModalVisible(false);
          setEditingAddress(null);
          setSelectedEmployee(null);
        }}
        onEditAddress={handleEditAddress}
        // onDeleteAddress={handleDeleteAddress}
        onAddAddress={handleAddAddress}
      />

      <BenefitModal
        visible={benefitModalVisible}
        editingBenefit={editingBenefit}
        employees={employees}
        benefitPlans={benefitPlans}
        onSuccess={handleBenefitModalSuccess}
        onCancel={() => {
          setBenefitModalVisible(false);
          setEditingBenefit(null);
        }}
      />

      <TimesheetModal
        visible={timesheetModalVisible}
        editingTimesheet={editingTimesheet}
        employees={employees}
        onSuccess={handleTimesheetModalSuccess}
        onCancel={() => {
          setTimesheetModalVisible(false);
          setEditingTimesheet(null);
        }}
      />
    </Layout>
  );
};

export default Home;
