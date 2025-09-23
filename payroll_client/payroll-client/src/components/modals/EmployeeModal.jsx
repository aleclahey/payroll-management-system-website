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
  const [customPosition, setCustomPosition] = useState("");

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
    setCustomPosition(""); // Reset custom position when modal opens/closes
  }, [editingEmployee, form, visible]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Convert hireDate to 'YYYY-MM-DD' format if it exists
      if (values.hireDate) {
        // If it's a moment object (from DatePicker), format it
        if (values.hireDate.format) {
          values.hireDate = values.hireDate.format("YYYY-MM-DD");
        } else {
          // Fallback to current date
          values.hireDate = new Date().toISOString().split("T")[0];
        }
      } else {
        // Default to current date if no hire date provided
        values.hireDate = new Date().toISOString().split("T")[0];
      }

      // Handle custom position creation
      if (customPosition && !values.positionId) {
        try {
          const newPosition = await api.createPosition({
            title: customPosition,
            fromDate: new Date().toISOString().split("T")[0],
            toDate: null,
          });
          values.positionId = newPosition.id;

          notification.success({
            message: "Position Created",
            description: `New position "${customPosition}" has been created.`,
          });
        } catch (err) {
          console.error("Failed to create custom position:", err);
          notification.error({
            message: "Error",
            description:
              "Could not create the custom position. Please try again.",
          });
          setLoading(false);
          return;
        }
      }

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, values);

        // Update salary/hourly rate information when editing
        if (employeeType === "salaried" && values.salary) {
          try {
            await api.updateOrCreateSalary({
              firstName: values.firstName,
              lastName: values.lastName,
              hireDate: values.hireDate,
              id: editingEmployee.id,
              salaryAmount: values.salary,
            });
            console.log("Salary record updated successfully");
          } catch (salaryError) {
            console.error("Failed to update salary record:", salaryError);
            notification.warning({
              message: "Partial Success",
              description:
                "Employee updated but salary record failed to update",
            });
          }
        }

        if (employeeType === "hourly" && values.hourlyRate) {
          try {
            await api.updateOrCreateHourlyEmployee({
              firstName: values.firstName,
              lastName: values.lastName,
              hireDate: values.hireDate,
              id: editingEmployee.id,
              hourlyRate: values.hourlyRate,
            });
            console.log("Hourly employee record updated successfully");
          } catch (hourlyError) {
            console.error(
              "Failed to update hourly employee record:",
              hourlyError
            );
            notification.warning({
              message: "Partial Success",
              description:
                "Employee updated but hourly rate record failed to update",
            });
          }
        }

        notification.success({
          message: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Create the employee first
        const newEmployee = await api.createEmployee(values);

        // If it's a salaried employee, create salary record
        if (employeeType === "salaried" && values.salary) {
          try {
            await api.createSalary({
              ...values,
              id: newEmployee.id, // Use the newly created employee ID
              salaryAmount: values.salary,
            });
            console.log("Salary record created successfully");
          } catch (salaryError) {
            console.error("Failed to create salary record:", salaryError);
            notification.warning({
              message: "Partial Success",
              description: "Employee created but salary record failed to save",
            });
          }
        }

        // If it's an hourly employee, create hourly employee record
        if (employeeType === "hourly" && values.hourlyRate) {
          try {
            await api.createHourlyEmployee({
              ...values,
              id: newEmployee.id, // Use the newly created employee ID
              hourlyRate: values.hourlyRate,
            });
            console.log("Hourly employee record created successfully");
          } catch (hourlyError) {
            console.error(
              "Failed to create hourly employee record:",
              hourlyError
            );
            notification.warning({
              message: "Partial Success",
              description:
                "Employee created but hourly rate record failed to save",
            });
          }
        }

        notification.success({
          message: "Success",
          description: "Employee added successfully",
        });
      }

      form.resetFields();
      setCustomPosition("");
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

  const handleCancel = () => {
    form.resetFields();
    setCustomPosition("");
    onCancel && onCancel();
  };

  return (
    <Modal
      title={editingEmployee ? "Edit Employee" : "Add Employee"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
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
              // rules={[{ required: true, message: "Please select hire date" }]}
            >
              {/* <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" /> */}
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
              <Select
                placeholder="Select or type to add position"
                showSearch
                allowClear
                filterOption={false}
                onSearch={(value) => {
                  setCustomPosition(value);
                  // If the value matches an existing position, clear custom position
                  const existingPosition = positions?.find(
                    (pos) => pos.title.toLowerCase() === value.toLowerCase()
                  );
                  if (existingPosition) {
                    setCustomPosition("");
                  }
                }}
                onSelect={(value) => {
                  setCustomPosition("");
                  form.setFieldsValue({ positionId: value });
                }}
                onClear={() => {
                  setCustomPosition("");
                }}
                notFoundContent={
                  customPosition ? (
                    <div style={{ padding: "8px", color: "#1890ff" }}>
                      Press Enter to create: "{customPosition}"
                    </div>
                  ) : null
                }
              >
                {positions?.map((pos) => (
                  <Option key={pos.id} value={pos.id}>
                    {pos.title}
                  </Option>
                ))}
              </Select>
              {customPosition && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#1890ff" }}>
                  Will create new position: "{customPosition}"
                </div>
              )}
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
