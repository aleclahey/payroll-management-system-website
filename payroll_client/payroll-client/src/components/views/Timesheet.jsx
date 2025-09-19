import React from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Tabs, 
  Select, 
  DatePicker, 
  Typography 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { hoursWorkedColumns } from '../TableColumns';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

export const Timesheet = ({
  totalHoursThisWeek,
  pendingTimesheets,
  hoursWorked,
  totalEmployees,
  departments,
  timesheets,
  timesheetColumns,
  loading,
  onAddTimesheet
}) => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Title level={2}>Timesheet Management</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAddTimesheet}
      >
        Add Timesheet
      </Button>
    </div>

    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Total Hours This Week"
            value={totalHoursThisWeek}
            suffix="h"
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Pending Approvals"
            value={pendingTimesheets}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Overtime Hours"
            value={hoursWorked.reduce((sum, hw) => sum + hw.overtimeHours, 0)}
            suffix="h"
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Average Hours/Employee"
            value={totalEmployees > 0 ? totalHoursThisWeek / totalEmployees : 0}
            precision={1}
            suffix="h"
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
    </Row>

    <Card>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Daily Timesheets" key="1">
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              <DatePicker.RangePicker />
              <Select
                placeholder="Filter by department"
                style={{ width: 200 }}
                allowClear
              >
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.name}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by status"
                style={{ width: 150 }}
                allowClear
              >
                <Option value="approved">Approved</Option>
                <Option value="pending">Pending</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Space>
          </div>
          <Table
            dataSource={timesheets}
            columns={timesheetColumns}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} timesheets`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="Weekly Summary" key="2">
          <Table
            dataSource={hoursWorked}
            columns={hoursWorkedColumns}
            rowKey="employeeId"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} employees`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="Overtime Report" key="3">
          <Table
            dataSource={hoursWorked.filter((hw) => hw.overtimeHours > 0)}
            columns={hoursWorkedColumns}
            rowKey="employeeId"
            loading={loading}
            locale={{
              emptyText: "No overtime hours recorded this week",
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="Approval Queue" key="4">
          <Table
            dataSource={timesheets.filter((ts) => ts.status === 'pending')}
            columns={timesheetColumns}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: "No timesheets pending approval",
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
      </Tabs>
    </Card>
  </div>
);

export default Timesheet;