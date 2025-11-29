import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Alert,
  Form,
  notification
} from 'antd';
import { api } from '../../api/api';

const { Option } = Select;
const { TextArea } = Input;

export const BenefitModal = ({
  visible,
  editingBenefit,
  employees,
  benefitPlans,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
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
    }
  }, [editingBenefit, form, visible]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (editingBenefit) {
        await api.updateBenefit(editingBenefit.id, values);
        notification.success({
          message: "Success",
          description: "Benefit enrollment updated successfully",
        });
      } else {
        await api.createBenefit(values);
        notification.success({
          message: "Success",
          description: "Benefit enrollment created successfully",
        });
      }
      
      form.resetFields();
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Benefit operation failed:', error);
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
      title={editingBenefit ? "Edit Benefit Enrollment" : "Enroll Employee in Benefits"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnHidden
      confirmLoading={loading}
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