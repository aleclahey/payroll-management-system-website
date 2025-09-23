import React from "react";
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  Statistic,
  Badge,
  Progress,
  Typography,
  Tag,
} from "antd";
import { TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { paymentColumns } from "../TableColumns";

const { Title, Text } = Typography;

export const Dashboard = ({
  totalEmployees,
  totalPayroll,
  pendingPayments,
  pendingTimesheets,
  timesheets,
  hoursWorked,
  payments,
  departments,
}) => (
  <div>
    <Title level={2}>Dashboard</Title>

    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total Employees"
            value={totalEmployees}
            prefix={<TeamOutlined />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Monthly Payroll"
            value={totalPayroll}
            prefix="$"
            precision={2}
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Pending Payments"
            value={pendingPayments}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Pending Timesheets"
            value={pendingTimesheets}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>
    </Row>

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card
          title="Recent Timesheets"
          extra={<Button type="primary">View All</Button>}
        >
          <Table
            dataSource={timesheets.slice(0, 5)}
            columns={[
              {
                title: "Employee",
                dataIndex: "employeeName",
                key: "employeeName",
              },
              {
                title: "Date",
                dataIndex: "date",
                key: "date",
              },
              {
                title: "Hours",
                dataIndex: "totalHours",
                key: "totalHours",
                render: (hours) => `${hours}h`,
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status) => {
                  const normalizedStatus = (status || "").toLowerCase();
                  const badgeColor =
                    {
                      completed: "success",
                      pending: "processing",
                      rejected: "error",
                    }[normalizedStatus] || "default";

                  return (
                    <Badge
                      status={badgeColor}
                      text={status ? status.toUpperCase() : "UNKNOWN"}
                    />
                  );
                },
              },
            ]}
            pagination={false}
            size="small"
            rowKey="id"
          />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Weekly Hours Summary">
          <Table
            dataSource={hoursWorked.slice(0, 6)}
            columns={[
              {
                title: "Employee",
                dataIndex: "employeeName",
                key: "employeeName",
              },
              {
                title: "Hours",
                dataIndex: "weeklyHours",
                key: "weeklyHours",
                render: (hours) => `${hours}h`,
              },
              {
                title: "Overtime",
                dataIndex: "overtimeHours",
                key: "overtimeHours",
                render: (hours) =>
                  hours > 0 ? <Tag color="orange">{hours}h</Tag> : "-",
              },
            ]}
            pagination={false}
            size="small"
            rowKey="employeeId"
          />
        </Card>
      </Col>
    </Row>

    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      <Col xs={24} lg={16}>
        <Card
          title="Recent Payments"
          extra={<Button type="primary">View All</Button>}
        >
          <Table
            dataSource={payments.slice(0, 5)}
            columns={paymentColumns}
            pagination={false}
            size="small"
            rowKey="id"
          />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title="Department Overview">
          {departments.map((dept) => (
            <div key={dept.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>{dept.name}</Text>
                <Text>{dept.employeeCount} employees</Text>
              </div>
              <Progress
                percent={
                  totalEmployees > 0
                    ? (dept.employeeCount / totalEmployees) * 100
                    : 0
                }
                size="small"
                showInfo={false}
              />
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  </div>
);

export default Dashboard;
