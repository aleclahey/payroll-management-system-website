import React from 'react';
import { Card, Table, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const Employee = ({ 
  employees, 
  employeeColumns, 
  loading, 
  onAddEmployee 
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
      <Title level={2}>Employee Management</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAddEmployee}
      >
        Add Employee
      </Button>
    </div>

    <Card>
      <Table
        dataSource={employees}
        columns={employeeColumns}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} employees`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  </div>
);

export default Employee;