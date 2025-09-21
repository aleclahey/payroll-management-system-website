import React, { useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Select, 
  Row, 
  Col, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Alert,
  Form,
  Checkbox,
  notification
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { api, apiCall } from '../../api/api';

const { Option } = Select;

export const AddressModal = ({
  visible,
  editingAddress,
  selectedEmployee,
  addresses,
  addressTypes,
  onSuccess,
  onCancel,
  onEditAddress,
  onDeleteAddress,
  onAddAddress
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingAddress && editingAddress.id) {
      form.setFieldsValue({
        addressTypeId: editingAddress.addressTypeId,
        street: editingAddress.street,
        city: editingAddress.city,
        province: editingAddress.province,
        postalCode: editingAddress.postalCode,
        country: editingAddress.country,
        isPrimary: editingAddress.isPrimary,
      });
    } else {
      form.resetFields();
    }
  }, [editingAddress, form]);

  const handleSaveAddress = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAddress && editingAddress.id) {
        await api.updateAddress(editingAddress.id, values);
        notification.success({
          message: "Success",
          description: "Address updated successfully",
        });
      } else {
        await api.createAddress({ ...values, employeeId: selectedEmployee.id });
        notification.success({
          message: "Success",
          description: "Address added successfully",
        });
      }
      
      form.resetFields();
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Address operation failed:', error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    }
  };

  const handleDeleteAddressInternal = async (addressId) => {
    try {
      await apiCall(`/addresses/${addressId}/`, { method: 'DELETE' });
      notification.success({
        message: "Success",
        description: "Address deleted successfully",
      });
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Delete operation failed:', error);
      notification.error({
        message: "Error",
        description: `Delete failed: ${error.message}`,
      });
    }
  };

  const employeeAddresses = addresses.filter(
    (addr) => addr.employeeId === selectedEmployee?.id
  );

  return (
    <Modal
      title={
        editingAddress?.id
          ? "Edit Address"
          : selectedEmployee
          ? `Manage Addresses - ${selectedEmployee.firstName} ${selectedEmployee.lastName}`
          : "Manage Addresses"
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={
        editingAddress?.id ? [
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveAddress}>
            Save Changes
          </Button>,
        ] : [
          <Button key="close" onClick={onCancel}>
            Close
          </Button>,
        ]
      }
    >
      {!editingAddress?.id && selectedEmployee && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onAddAddress(selectedEmployee)}
            >
              Add New Address
            </Button>
          </div>

          <Table
            dataSource={employeeAddresses}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: "Type",
                dataIndex: "addressType",
                key: "addressType",
                render: (type, record) => (
                  <Space>
                    <Tag color={record.isPrimary ? "gold" : "blue"}>
                      {type}
                    </Tag>
                    {record.isPrimary && <Tag color="green">Primary</Tag>}
                  </Space>
                ),
              },
              {
                title: "Address",
                key: "fullAddress",
                render: (_, record) => (
                  <div>
                    <div>{record.street}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {record.city}, {record.province} {record.postalCode}
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      {record.country}
                    </div>
                  </div>
                ),
              },
              {
                title: "Actions",
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEditAddress(record)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteAddressInternal(record.id)}
                      disabled={record.isPrimary}
                    >
                      Delete
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </div>
      )}

      {editingAddress?.id && (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="addressTypeId"
                label="Address Type"
                rules={[{ required: true, message: 'Please select address type' }]}
              >
                <Select placeholder="Select address type">
                  {addressTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isPrimary"
                valuePropName="checked"
                label="Primary Address"
              >
                <Checkbox>Set as primary address</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="street"
            label="Street Address"
            rules={[{ required: true, message: 'Please enter street address' }]}
          >
            <Input placeholder="Enter street address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="province"
                label="Province/State"
                rules={[{ required: true, message: 'Please enter province/state' }]}
              >
                <Input placeholder="Enter province/state" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[{ required: true, message: 'Please enter postal code' }]}
              >
                <Input placeholder="Enter postal code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select placeholder="Select country">
                  <Option value="Canada">Canada</Option>
                  <Option value="United States">United States</Option>
                  <Option value="Mexico">Mexico</Option>
                  <Option value="United Kingdom">United Kingdom</Option>
                  <Option value="Australia">Australia</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Address Information"
            description="Setting an address as primary will automatically update payroll and contact records. Only one primary address is allowed per employee."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      )}
    </Modal>
  );
};