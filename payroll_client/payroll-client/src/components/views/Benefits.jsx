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
  Alert, 
  Progress, 
  Divider, 
  Typography 
} from 'antd';
import { BankOutlined, PlusOutlined } from '@ant-design/icons';
import { benefitPlansColumns } from '../TableColumns';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

export const Benefits = ({
  activeBenefits,
  totalBenefitCost,
  benefitPlans,
  totalEmployees,
  benefits,
  benefitsColumns,
  loading,
  onAddBenefit
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
      <Title level={2}>Benefits Management</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAddBenefit}
      >
        Enroll Employee
      </Button>
    </div>

    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Active Benefits"
            value={activeBenefits}
            prefix={<BankOutlined />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Monthly Benefit Cost"
            value={totalBenefitCost}
            prefix="$"
            precision={2}
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Available Plans"
            value={benefitPlans.length}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Enrollment Rate"
            value={totalEmployees > 0 ? (activeBenefits / totalEmployees) * 100 : 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: "#722ed1" }}
          />
        </Card>
      </Col>
    </Row>

    <Card>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Employee Benefits" key="1">
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              <Select
                placeholder="Filter by benefit plan"
                style={{ width: 200 }}
                allowClear
              >
                {benefitPlans.map((plan) => (
                  <Option key={plan.id} value={plan.name}>
                    {plan.name}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by status"
                style={{ width: 150 }}
                allowClear
              >
                <Option value="active">Active</Option>
                <Option value="pending">Pending</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Space>
          </div>
          <Table
            dataSource={benefits}
            columns={benefitsColumns}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} benefit enrollments`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="Available Plans" key="2">
          <Alert
            message="Benefit Plans Overview"
            description="Manage available benefit plans and view enrollment statistics"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={benefitPlans}
            columns={benefitPlansColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="Cost Analysis" key="3">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Benefits by Category">
                {benefitPlans.map((plan) => {
                  const enrolledCount = benefits.filter(
                    (b) =>
                      b.benefitplan === plan.name && b.status === "active"
                  ).length;
                  const totalCost = enrolledCount * plan.monthlyCost;
                  return (
                    <div key={plan.id} style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text strong>{plan.name}</Text>
                        <Text>${totalCost.toFixed(2)}/month</Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text type="secondary">
                          {enrolledCount} employees enrolled
                        </Text>
                        <Text type="secondary">
                          Avg: $
                          {(totalCost / (enrolledCount || 1)).toFixed(2)}
                          /employee
                        </Text>
                      </div>
                      <Progress
                        percent={
                          totalBenefitCost > 0
                            ? (totalCost / totalBenefitCost) * 100
                            : 0
                        }
                        size="small"
                        showInfo={false}
                      />
                    </div>
                  );
                })}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Cost Breakdown">
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Total Monthly Benefits Cost</Text>
                  <Title
                    level={3}
                    style={{ color: "#cf1322", margin: "8px 0" }}
                  >
                    ${totalBenefitCost.toFixed(2)}
                  </Title>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Employee Contributions:</Text>
                    <Text strong>
                      $
                      {benefits
                        .filter((b) => b.status === "active")
                        .reduce((sum, b) => {
                          const plan = benefitPlans.find(
                            (p) => p.name === b.benefitplan
                          );
                          return sum + (plan?.employeeContribution || 0);
                        }, 0)
                        .toFixed(2)}
                    </Text>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Employer Contributions:</Text>
                    <Text strong>
                      $
                      {benefits
                        .filter((b) => b.status === "active")
                        .reduce((sum, b) => {
                          const plan = benefitPlans.find(
                            (p) => p.name === b.benefitplan
                          );
                          return sum + (plan?.employerContribution || 0);
                        }, 0)
                        .toFixed(2)}
                    </Text>
                  </div>
                </div>
                <Divider />
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Annual Benefits Cost:</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      ${(totalBenefitCost * 12).toFixed(2)}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Enrollment Reports" key="4">
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Text type="secondary">
              Benefit enrollment reports and analytics will be available here
            </Text>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </div>
);

export default Benefits;