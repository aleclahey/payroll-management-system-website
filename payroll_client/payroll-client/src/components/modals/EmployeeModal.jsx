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
import daysjs from "dayjs";

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
    if (visible) {
      if (editingEmployee) {
        form.setFieldsValue({
          firstName: editingEmployee.firstName,
          lastName: editingEmployee.lastName,
          gender: editingEmployee.gender,
          hireDate: editingEmployee.hireDate
            ? daysjs(editingEmployee.hireDate)
            : null,
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
      setCustomPosition("");
    }
  }, [editingEmployee, form, visible]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // fix hireDate formatting
      if (values.hireDate?.format) {
        values.hireDate = values.hireDate.format("YYYY-MM-DD");
      } else {
        values.hireDate = new Date().toISOString().split("T")[0];
      }

      // Create custom position
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
          notification.error({
            message: "Error",
            description: "Could not create the custom position.",
          });
          console.log(err);
          setLoading(false);
          return;
        }
      }

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, values);

        // update salary info
        if (employeeType === "salaried" && values.salary) {
          try {
            await api.updateOrCreateSalary({
              firstName: values.firstName,
              lastName: values.lastName,
              hireDate: values.hireDate,
              id: editingEmployee.id,
              salaryAmount: values.salary,
            });
          } catch (err) {
            notification.warning({
              message: "Partial Success",
              description: "Employee updated but salary failed to update",
            });
            console.log(err);
          }
        }

        // update hourly info
        if (employeeType === "hourly" && values.hourlyRate) {
          try {
            await api.updateOrCreateHourlyEmployee({
              firstName: values.firstName,
              lastName: values.lastName,
              hireDate: values.hireDate,
              id: editingEmployee.id,
              hourlyRate: values.hourlyRate,
            });
          } catch (err) {
            notification.warning({
              message: "Partial Success",
              description: "Employee updated but hourly rate failed to update",
            });
            console.log(err);
          }
        }

        notification.success({
          message: "Success",
          description: "Employee updated successfully",
        });
      } else {
        const newEmployee = await api.createEmployee(values);

        if (employeeType === "salaried" && values.salary) {
          try {
            await api.createSalary({
              ...values,
              id: newEmployee.id,
              salaryAmount: values.salary,
            });
          } catch (err) {
            notification.warning({
              message: "Partial Success",
              description: "Employee created but salary failed to save",
            });
            console.log(err);
          }
        }

        if (employeeType === "hourly" && values.hourlyRate) {
          try {
            await api.createHourlyEmployee({
              ...values,
              id: newEmployee.id,
              hourlyRate: values.hourlyRate,
            });
          } catch (err) {
            notification.warning({
              message: "Partial Success",
              description: "Employee created but hourly rate failed to save",
            });
            console.log(err);
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
            <Form.Item name="hireDate" label="Hire Date">
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
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
              <Select onChange={setEmployeeType} placeholder="Select type">
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
                  const exists = positions?.find(
                    (pos) => pos.title.toLowerCase() === value.toLowerCase()
                  );
                  if (exists) setCustomPosition("");
                }}
                onSelect={(value) => {
                  setCustomPosition("");
                  form.setFieldsValue({ positionId: value });
                }}
                onClear={() => setCustomPosition("")}
                notFoundContent={
                  customPosition ? (
                    <div style={{ padding: 8, color: "#1890ff" }}>
                      Press Enter to create "{customPosition}"
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
            </Form.Item>

            {/* FIXED: now outside Form.Item */}
            {customPosition && (
              <div style={{ fontSize: 12, marginTop: 4, color: "#1890ff" }}>
                Will create new position: "{customPosition}"
              </div>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="salary"
              label="Annual Salary"
              hidden={employeeType !== "salaried"}
              rules={[
                {
                  required: employeeType === "salaried",
                  message: "Please enter salary",
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
                placeholder="Enter annual salary"
                min={0}
                precision={2}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              name="hourlyRate"
              label="Hourly Rate"
              hidden={employeeType !== "hourly"}
              rules={[
                {
                  required: employeeType === "hourly",
                  message: "Please enter hourly rate",
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
                placeholder="Enter hourly rate"
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
                      {emp.firstName} {emp.lastName}
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
