import { App, Button, Flex, Form, Input, Modal } from 'antd';
import { useRef } from 'react';
import { USER_ROLES } from '~/app/config/constants.js';
import RULES from '~/app/config/rule.js';
import { useCreateEmployee } from '../api/create-employee.jsx';

const CreateEmployeeModal = ({ open, handleCancel }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const submitting = useRef(false);

  const mutation = useCreateEmployee({
    mutationConfig: {
      onSuccess: () => {
        message.success('Tạo nhân viên thành công!');
        form.resetFields();
        handleCancel();
      },
      onError: (error) => {
        message.error(error?.response?.data?.detail || 'Chưa tạo được nhân viên. Vui lòng thử lại.');
      },
      onSettled: () => { submitting.current = false; },
    },
  });

  const onFinish = (values) => {
    if (submitting.current || mutation.isPending) return;
    submitting.current = true;
    mutation.mutate({ data: { ...values, userRole: USER_ROLES.ADMIN } });
  };
  const onCancel = () => {
    if (!submitting.current && !mutation.isPending) handleCancel();
  };
  return (
    <Modal title="Thêm nhân viên mới" open={open} onCancel={onCancel} footer={null} centered
      closable={!mutation.isPending} keyboard={!mutation.isPending} mask={{ closable: !mutation.isPending }}>
      <Form name="employee-create-form" form={form} className="pt-4" onFinish={onFinish} layout="vertical"
        disabled={mutation.isPending}>
        <Flex vertical>
          <Form.Item label="Tên nhân viên" name="name" rules={RULES.createEmployee.name} validateTrigger="onBlur">
            <Input placeholder="Nhập tên nhân viên..." />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={RULES.createEmployee.email} validateTrigger="onBlur">
            <Input placeholder="Nhập địa chỉ email..." />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone" rules={RULES.createEmployee.phone} validateTrigger="onBlur">
            <Input placeholder="Nhập số điện thoại..." />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={RULES.createEmployee.password} validateTrigger="onBlur">
            <Input.Password placeholder="Nhập mật khẩu..." />
          </Form.Item>
        </Flex>
        <Form.Item className="pt-4 m-0">
          <Flex justify="end" className="gap-3">
            <Button disabled={mutation.isPending} type="default" htmlType="reset">
              Hoàn tác
            </Button>
            <Button loading={mutation?.isPending} type="primary" htmlType="submit">
              Tạo mới
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateEmployeeModal;
