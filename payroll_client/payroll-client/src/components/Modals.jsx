import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Row, 
  Col, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Alert,
  Form,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

// Employee Modal
export const EmployeeModal = ({
  visible,
  editingEmployee,
  departments,
  employees,
  positions,
  onOk,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [employeeType, setEmployeeType] = useState('hourly');

  useEffect(() => {
    if (editingEmployee) {
      form.setFieldsValue({
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        gender: editingEmployee.gender,
        hireDate: editingEmployee.hireDate,
        departmentId: editingEmployee.departmentId,
        positionId: editingEmployee.positionId,
        managerEmployeeId: editingEmployee.managerEmployeeId,
        type: editingEmployee.type,
        salary: editingEmployee.salary,
        hourlyRate: editingEmployee.hourlyRate,
      });
      setEmployeeType(editingEmployee.type || 'hourly');
    } else {
      form.resetFields();
      setEmployeeType('hourly');
    }
  }, [editingEmployee, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editingEmployee ? "Edit Employee" : "Add Employee"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={800}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: 'hourly', gender: 'M' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select placeholder="Select gender">
                <Option value="M">Male</Option>
                <Option value="F">Female</Option>
                <Option value="X">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hireDate"
              label="Hire Date"
              rules={[{ required: true, message: 'Please select hire date' }]}
            >
              {/* <DatePicker/> */}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Employee Type"
              rules={[{ required: true, message: 'Please select employee type' }]}
            >
              <Select 
                placeholder="Select type" 
                onChange={setEmployeeType}
              >
                <Option value="hourly">Hourly</Option>
                <Option value="salaried">Salaried</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="departmentId"
              label="Department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="positionId"
              label="Position"
            >
              <Select placeholder="Select position" allowClear>
                {positions?.map((pos) => (
                  <Option key={pos.id} value={pos.id}>
                    {pos.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={employeeType === 'salaried' ? 'salary' : 'hourlyRate'}
              label={employeeType === 'salaried' ? 'Annual Salary' : 'Hourly Rate'}
              rules={[
                { required: true, message: `Please enter ${employeeType === 'salaried' ? 'salary' : 'hourly rate'}` },
                { type: 'number', min: 0, message: 'Must be a positive number' }
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder={`Enter ${employeeType === 'salaried' ? 'annual salary' : 'hourly rate'}`}
                min={0}
                precision={2}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="managerEmployeeId"
              label="Manager"
            >
              <Select
                placeholder="Select manager"
                allowClear
              >
                {employees.filter(emp => emp.id !== editingEmployee?.id).map((emp) => (
                  <Option key={emp.id} value={emp.id}>
                    {`${emp.firstName} ${emp.lastName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// Address Management Modal
export const AddressModal = ({
  visible,
  editingAddress,
  selectedEmployee,
  addresses,
  addressTypes,
  onOk,
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
      onOk(values);
      form.resetFields();
    } catch (error) {
      console.log('Validation failed:', error);
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
                      onClick={() => onDeleteAddress(record.id)}
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

// Benefits Modal
export const BenefitModal = ({
  visible,
  editingBenefit,
  employees,
  benefitPlans,
  onOk,
  onCancel
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingBenefit) {
      form.setFieldsValue({
        employeeId: editingBenefit.employeeId,
        benefitPlan: editingBenefit.benefitplan,
        enrollmentDate: editingBenefit.enrollmentDate,
        status: editingBenefit.status,
        notes: editingBenefit.notes,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'active' });
    }
  }, [editingBenefit, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editingBenefit ? "Edit Benefit Enrollment" : "Enroll Employee in Benefits"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employeeId"
              label="Employee"
              rules={[{ required: true, message: 'Please select employee' }]}
            >
              <Select 
                placeholder="Select employee" 
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {employees.map((emp) => (
                  <Option key={emp.id} value={emp.id}>
                    {`${emp.firstName} ${emp.lastName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="benefitPlan"
              label="Benefit Plan"
              rules={[{ required: true, message: 'Please select benefit plan' }]}
            >
              <Select placeholder="Select benefit plan">
                {benefitPlans.map((plan) => (
                  <Option key={plan.id} value={plan.name}>
                    {plan.name} - ${plan.monthlyCost}/month
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="enrollmentDate"
              label="Enrollment Date"
              rules={[{ required: true, message: 'Please select enrollment date' }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="pending">Pending</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea rows={3} placeholder="Add enrollment notes..." />
        </Form.Item>

        <Alert
          message="Benefit Cost Information"
          description="Employee and employer contribution amounts will be automatically calculated based on the selected plan."
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
};

// Timesheet Modal
export const TimesheetModal = ({
  visible,
  editingTimesheet,
  employees,
  onOk,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (editingTimesheet) {
      form.setFieldsValue({
        employeeId: editingTimesheet.employeeId,
        date: editingTimesheet.date,
        clockIn: editingTimesheet.clockIn,
        clockOut: editingTimesheet.clockOut,
        breakTime: editingTimesheet.breakTime || 30,
        notes: editingTimesheet.notes,
      });
      setTotalHours(editingTimesheet.totalHours || 0);
    } else {
      form.resetFields();
      form.setFieldsValue({ breakTime: 30 });
      setTotalHours(0);
    }
  }, [editingTimesheet, form, visible]);

  const calculateHours = () => {
    const clockIn = form.getFieldValue('clockIn');
    const clockOut = form.getFieldValue('clockOut');
    const breakTime = form.getFieldValue('breakTime') || 0;

    if (clockIn && clockOut) {
      const start = new Date(`2000-01-01 ${clockIn}`);
      const end = new Date(`2000-01-01 ${clockOut}`);
      
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }
      
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      const breakHours = breakTime / 60;
      const calculatedHours = Math.max(0, diffHours - breakHours);
      
      setTotalHours(parseFloat(calculatedHours.toFixed(2)));
      form.setFieldsValue({ totalHours: parseFloat(calculatedHours.toFixed(2)) });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.totalHours = totalHours;
      onOk(values);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editingTimesheet ? "Edit Timesheet" : "Add Timesheet"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employeeId"
              label="Employee"
              rules={[{ required: true, message: 'Please select employee' }]}
            >
              <Select 
                placeholder="Select employee"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {employees.map((emp) => (
                  <Option key={emp.id} value={emp.id}>
                    {`${emp.firstName} ${emp.lastName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="clockIn"
              label="Clock In"
              rules={[{ required: true, message: 'Please enter clock in time' }]}
            >
              <Input 
                type="time" 
                placeholder="09:00" 
                onBlur={calculateHours}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="clockOut"
              label="Clock Out"
              rules={[{ required: true, message: 'Please enter clock out time' }]}
            >
              <Input 
                type="time" 
                placeholder="17:00" 
                onBlur={calculateHours}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="breakTime"
              label="Break Time (minutes)"
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="30"
                min={0}
                max={480}
                onBlur={calculateHours}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="totalHours"
              label="Total Hours"
            >
              <InputNumber
                style={{ width: "100%" }}
                value={totalHours}
                min={0}
                max={24}
                precision={2}
                disabled
                formatter={value => `${value} hours`}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea
            rows={3}
            placeholder="Add any additional notes..."
          />
        </Form.Item>

        <Alert
          message="Time Calculation"
          description="Total hours are automatically calculated based on clock in/out times minus break time."
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
};