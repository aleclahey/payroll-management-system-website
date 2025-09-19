import React from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tabs, 
  Alert, 
  Typography 
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { paymentColumns } from '../TableColumns';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export const Payroll = ({ 
  payments, 
  pendingPayments, 
  loading 
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
      <Title level={2}>Payroll Management</Title>
      <Space>
        <Button type="primary">Process Payroll</Button>
        <Button icon={<DownloadOutlined />}>Export All</Button>
      </Space>
    </div>

    <Card>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Current Period" key="1">
          <Alert
            message="Payroll Status"
            description={`${pendingPayments} payments pending for current period`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={payments}
            columns={paymentColumns}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="Historical" key="2">
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Text type="secondary">
              Historical payroll data will be displayed here
            </Text>
          </div>
        </TabPane>
        <TabPane tab="Reports" key="3">
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Text type="secondary">
              Payroll reports and analytics will be available here
            </Text>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </div>
);

export default Payroll;