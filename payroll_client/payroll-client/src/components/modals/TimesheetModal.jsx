import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Row, 
  Col, 
  Alert,
  Form,
  notification
} from 'antd';
import { api } from '../../api/api';

const { Option } = Select;
const { TextArea } = Input;

export const TimesheetModal = ({
  visible,
  editingTimesheet,
  employees,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTimesheet) {
      form.setFieldsValue({
        employee: editingTimesheet.employeeId,
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
      setLoading(true);
      const values = await form.validateFields();
      values.totalHours = totalHours;
      
      if (editingTimesheet) {
        await api.updateTimesheet(editingTimesheet.id, values);
        notification.success({
          message: "Success",
          description: "Timesheet updated successfully",
        });
      } else {
        console.log(values);
        await api.createTimesheet(values);
        notification.success({
          message: "Success",
          description: "Timesheet created successfully",
        });
      }
      
      form.resetFields();
      setTotalHours(0);
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Timesheet operation failed:', error);
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
      title={editingTimesheet ? "Edit Timesheet" : "Add Timesheet"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employee"
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