import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Form,
  notification,
} from "antd";
import { api } from "../../api/api";

const { Option } = Select;

export const EmployeeModal = ({
  visible,
  editingEmployee,
  departments,
  employees,
  positions,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [employeeType, setEmployeeType] = useState("hourly");
  const [loading, setLoading] = useState(false);

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
      setEmployeeType(editingEmployee.type || "hourly");
    } else {
      form.resetFields();
      setEmployeeType("hourly");
    }
  }, [editingEmployee, form, visible]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Convert hireDate to 'YYYY-MM-DD' format
      if (values.hireDate) {
        values.hireDate = values.hireDate.format("YYYY-MM-DD");
      }

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, values);
        notification.success({
          message: "Success",
          description: "Employee updated successfully",
        });
      } else {
        await api.createEmployee(values);
        notification.success({
          message: "Success",
          description: "Employee added successfully",
        });
      }

      form.resetFields();
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Operation failed:", error);
      notification.error({
        message: "Error",
        description: `Operation failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
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
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: "hourly", gender: "M" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
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
              rules={[{ required: true, message: "Please select gender" }]}
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
              rules={[{ required: true, message: "Please select hire date" }]}
            >
              <DatePicker />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Employee Type"
              rules={[
                { required: true, message: "Please select employee type" },
              ]}
            >
              <Select placeholder="Select type" onChange={setEmployeeType}>
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
              rules={[{ required: true, message: "Please select department" }]}
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
            <Form.Item name="positionId" label="Position">
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
              name={employeeType === "salaried" ? "salary" : "hourlyRate"}
              label={
                employeeType === "salaried" ? "Annual Salary" : "Hourly Rate"
              }
              rules={[
                {
                  required: true,
                  message: `Please enter ${
                    employeeType === "salaried" ? "salary" : "hourly rate"
                  }`,
                },
                {
                  type: "number",
                  min: 0,
                  message: "Must be a positive number",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder={`Enter ${
                  employeeType === "salaried" ? "annual salary" : "hourly rate"
                }`}
                min={0}
                precision={2}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="managerEmployeeId" label="Manager">
              <Select placeholder="Select manager" allowClear>
                {employees
                  .filter((emp) => emp.id !== editingEmployee?.id)
                  .map((emp) => (
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
