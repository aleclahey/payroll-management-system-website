import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tabs,
  Alert,
  Typography,
  message,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { paymentColumns } from '../TableColumns';
import { api } from '../../api/api'; // adjust the import path if needed

const { Title } = Typography;

export const Payroll = ({
  payments,
  pendingPayments,
  loading,
}) => {
  const [processing, setProcessing] = useState(false);

  const handleProcessPayroll = async () => {
    try {
      setProcessing(true);
      await api.createBiweeklyPayments();
      message.success('Payroll processed successfully.');
    } catch (error) {
      console.error(error);
      message.error('Failed to process payroll.');
    } finally {
      setProcessing(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Current Period',
      children: (
        <>
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
        </>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={2}>Payroll Management</Title>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={processing}
          onClick={handleProcessPayroll}
        >
          Process Payroll
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  );
};

export default Payroll;