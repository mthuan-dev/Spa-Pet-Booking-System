import { Button, Flex, Form, Input, Modal } from 'antd';
import RULES from '~/app/config/rule.js';

const UpdateEmployeeModal = ({ mutation, open, handleCancel, selectedEmployee }) => {
  const [form] = Form.useForm();

  const onFinish = () => {
    mutation.mutate({ data: form.getFieldsValue() }, { onSuccess: handleCancel });
  };

  return (
    <Modal title="Cập nhật nhân viên" open={open} onCancel={handleCancel} footer={null} centered>
      <Form
        name="employee-update-form"
        form={form}
        className="pt-4"
        onFinish={onFinish}
        layout="vertical"
        disabled={mutation.isPending}
        initialValues={{
          ...selectedEmployee,
        }}
      >
        <Flex vertical>
          <Form.Item label="ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Tên nhân viên" name="name" rules={RULES.createEmployee.name}>
            <Input placeholder="Nhập tên nhân viên..." />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone" rules={RULES.createEmployee.phone}>
            <Input placeholder="Nhập số điện thoại..." />
          </Form.Item>
        </Flex>
        <Form.Item className="pt-4 m-0">
          <Flex justify="end" className="gap-3">
            <Button loading={mutation?.isPending} type="default" htmlType="reset">
              Hoàn tác
            </Button>
            <Button loading={mutation?.isPending} type="primary" htmlType="submit">
              Lưu
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateEmployeeModal;
