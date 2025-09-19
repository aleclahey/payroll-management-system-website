import React from 'react';
import { Space, Button, Avatar, Tag, Badge } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

// Employee Table Columns
export const getEmployeeColumns = (handleEditEmployee, handleDeleteEmployee) => [
  {
    title: "Name",
    key: "name",
    render: (_, record) => (
      <Space>
        <Avatar icon={<UserOutlined />} />
        <span>{`${record.firstName} ${record.lastName}`}</span>
      </Space>
    ),
  },
  {
    title: "Department",
    dataIndex: "department",
    key: "department",
    filters: [], // Will be populated dynamically with department data
    onFilter: (value, record) => record.department === value,
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <Tag color={type === "salaried" ? "blue" : "green"}>
        {type.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Compensation",
    key: "compensation",
    render: (_, record) => (
      <span>
        {record.type === "salaried"
          ? `${record.salary}/year`
          : `${record.hourlyRate}/hour`}
      </span>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => handleEditEmployee(record)}
        >
          Edit
        </Button>
        <Button 
          icon={<DeleteOutlined />} 
          size="small" 
          danger
          onClick={() => handleDeleteEmployee && handleDeleteEmployee(record.id)}
        >
          Delete
        </Button>
      </Space>
    ),
  },
];

// Payment Table Columns
export const paymentColumns = [
  {
    title: "Employee",
    dataIndex: "employeeName",
    key: "employeeName",
  },
  {
    title: "Pay Period",
    dataIndex: "payPeriod",
    key: "payPeriod",
  },
  {
    title: "Gross Pay",
    dataIndex: "grossPay",
    key: "grossPay",
    render: (amount) => `${amount?.toLocaleString()}`,
  },
  {
    title: "Deductions",
    dataIndex: "deductions",
    key: "deductions",
    render: (amount) => `${amount?.toLocaleString()}`,
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "netPay",
    render: (amount) => `${amount?.toLocaleString()}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Badge
        status={status === "paid" ? "success" : "processing"}
        text={status.toUpperCase()}
      />
    ),
  },
  {
    title: "Actions",
    key: "actions",
    render: () => (
      <Space>
        <Button size="small" icon={<DownloadOutlined />}>
          Export
        </Button>
      </Space>
    ),
  },
];

// Timesheet Table Columns
export const getTimesheetColumns = (handleEditTimesheet, handleApproveTimesheet, handleRejectTimesheet) => [
  {
    title: "Employee",
    dataIndex: "employeeName",
    key: "employeeName",
    render: (name) => (
      <Space>
        <Avatar size="small" icon={<UserOutlined />} />
        {name}
      </Space>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: "Clock In",
    dataIndex: "clockIn",
    key: "clockIn",
  },
  {
    title: "Clock Out",
    dataIndex: "clockOut",
    key: "clockOut",
  },
  {
    title: "Total Hours",
    dataIndex: "totalHours",
    key: "totalHours",
    render: (hours) => `${hours}h`,
    sorter: (a, b) => a.totalHours - b.totalHours,
  },
  {
    title: "Overtime",
    dataIndex: "overtimeHours",
    key: "overtimeHours",
    render: (hours) => (hours > 0 ? <Tag color="orange">{hours}h</Tag> : "-"),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const colors = {
        approved: "success",
        pending: "processing",
        rejected: "error",
      };
      return <Badge status={colors[status]} text={status.toUpperCase()} />;
    },
    filters: [
      { text: "Approved", value: "approved" },
      { text: "Pending", value: "pending" },
      { text: "Rejected", value: "rejected" },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditTimesheet(record)}
        >
          Edit
        </Button>
        {record.status === "pending" && (
          <>
            <Button
              size="small"
              type="primary"
              onClick={() => handleApproveTimesheet(record.id)}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              onClick={() => handleRejectTimesheet(record.id)}
            >
              Reject
            </Button>
          </>
        )}
      </Space>
    ),
  },
];

// Hours Worked Summary Columns
export const hoursWorkedColumns = [
  {
    title: "Employee",
    dataIndex: "employeeName",
    key: "employeeName",
  },
  {
    title: "Department",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "Weekly Hours",
    dataIndex: "weeklyHours",
    key: "weeklyHours",
    render: (hours) => `${hours}h`,
  },
  {
    title: "Overtime Hours",
    dataIndex: "overtimeHours",
    key: "overtimeHours",
    render: (hours) => (hours > 0 ? <Tag color="orange">{hours}h</Tag> : "-"),
  },
  {
    title: "Status",
    key: "status",
    render: (_, record) => {
      if (record.weeklyHours > 40) {
        return <Tag color="orange">Overtime</Tag>;
      } else if (record.weeklyHours < 40) {
        return <Tag color="blue">Part-time</Tag>;
      }
      return <Tag color="green">Full-time</Tag>;
    },
  },
];

// Benefits Table Columns
export const getBenefitsColumns = (handleEditBenefit, handleDeleteBenefit) => [
  {
    title: "Employee",
    dataIndex: "employeename",
    key: "employeename",
  },
  {
    title: "Benefit Plan",
    dataIndex: "benefitplan",
    key: "benefitplan",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const colors = {
        active: "success",
        pending: "processing",
        inactive: "default",
      };
      return <Badge status={colors[status]} text={status.charAt(0).toUpperCase() + status.slice(1)} />;
    },
    filters: [
      { text: "Active", value: "active" },
      { text: "Pending", value: "pending" },
      { text: "Inactive", value: "inactive" },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: "Enrollment Date",
    dataIndex: "enrollmentDate",
    key: "enrollmentDate",
  },
  {
    title: "Monthly Cost",
    dataIndex: "cost",
    key: "cost",
    render: (cost) => `${cost.toFixed(2)}`,
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => handleEditBenefit(record)}
        >
          Edit
        </Button>
        <Button
          icon={<DeleteOutlined />}
          size="small"
          danger
          onClick={() => handleDeleteBenefit(record.id)}
        >
          Delete
        </Button>
      </Space>
    ),
  },
];

// Benefit Plans Table Columns
export const benefitPlansColumns = [
  {
    title: "Plan Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Provider",
    dataIndex: "provider",
    key: "provider",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Monthly Cost",
    dataIndex: "monthlyCost",
    key: "monthlyCost",
    render: (cost) => `${cost.toFixed(2)}`,
  },
  {
    title: "Employee Contribution",
    dataIndex: "employeeContribution",
    key: "employeeContribution",
    render: (amount) => `${amount.toFixed(2)}`,
  },
  {
    title: "Employer Contribution",
    dataIndex: "employerContribution",
    key: "employerContribution",
    render: (amount) => `${amount.toFixed(2)}`,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
  },
];