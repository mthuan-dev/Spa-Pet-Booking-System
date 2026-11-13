import { App, Button, Flex, Form, Input, Modal } from 'antd';
import { useCreateCustomer, useUpdateCustomer } from '../api/save-customer.jsx';

const RULES = {
  name: [
    { required: true, whitespace: true, message: 'Vui lòng nhập tên khách hàng.' },
    { min: 3, max: 30, message: 'Tên khách hàng cần từ 3 đến 30 ký tự.' },
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email.' },
    { type: 'email', message: 'Email không hợp lệ.' },
  ],
  phone: [
    { required: true, message: 'Vui lòng nhập số điện thoại.' },
    { pattern: /^\d{9,11}$/, message: 'Số điện thoại cần từ 9 đến 11 chữ số.' },
  ],
  address: [
    { required: true, whitespace: true, message: 'Vui lòng nhập địa chỉ.' },
    { min: 8, max: 150, message: 'Địa chỉ cần từ 8 đến 150 ký tự.' },
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu.' },
    { min: 6, max: 16, message: 'Mật khẩu cần từ 6 đến 16 ký tự.' },
  ],
};

const CustomerFormModal = ({ customer, onCancel }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEditing = Boolean(customer);
  const mutationConfig = {
    onSuccess: () => {
      message.success(isEditing ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!');
      onCancel();
    },
    onError: (error) => {
      message.error(error?.response?.data?.detail || 'Chưa lưu được khách hàng. Vui lòng thử lại.');
    },
  };
  const createMutation = useCreateCustomer({ mutationConfig });
  const updateMutation = useUpdateCustomer({ mutationConfig });
  const mutation = isEditing ? updateMutation : createMutation;

  const handleCancel = () => {
    if (!mutation.isPending) onCancel();
  };

  const handleSubmit = (values) => {
    mutation.mutate({
      data: {
        ...values,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        ...(isEditing ? { id: customer.id } : {}),
      },
    });
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
      open
      onCancel={handleCancel}
      footer={null}
      centered
    >
      <Form
        name="customer-form"
        form={form}
        className="pt-4"
        layout="vertical"
        initialValues={customer || { name: '', email: '', phone: '', address: '', password: '' }}
        onFinish={handleSubmit}
        disabled={mutation.isPending}
      >
        <Form.Item label="Tên khách hàng" name="name" rules={RULES.name}>
          <Input placeholder="Nhập tên khách hàng..." />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={RULES.email}>
          <Input placeholder="Nhập địa chỉ email..." disabled={isEditing || mutation.isPending} />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={RULES.phone}>
          <Input placeholder="Nhập số điện thoại..." inputMode="tel" />
        </Form.Item>
        <Form.Item label="Địa chỉ" name="address" rules={RULES.address}>
          <Input placeholder="Nhập địa chỉ..." />
        </Form.Item>
        {!isEditing && (
          <Form.Item label="Mật khẩu" name="password" rules={RULES.password}>
            <Input.Password placeholder="Nhập mật khẩu..." autoComplete="new-password" />
          </Form.Item>
        )}
        <Form.Item className="pt-4 m-0">
          <Flex justify="end" gap={12}>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button loading={mutation.isPending} type="primary" htmlType="submit">
              {isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerFormModal;
