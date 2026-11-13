import { App, Button, Col, Flex, Form, Input, InputNumber, Row, Select } from 'antd';
import { useEffect } from 'react';
import { useSaveCatalogItem } from '../api/catalog.js';
import { errorMessage } from './catalogShared.jsx';

const ServiceForm = ({ category, service, catalog, onSuccess, onCancel, onPendingChange }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const isCombo = category === 'COMBO';
  const mutation = useSaveCatalogItem('services', () => {
    message.success(service ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ thành công!');
    onSuccess();
  });
  useEffect(() => { onPendingChange?.(mutation.isPending); }, [mutation.isPending, onPendingChange]);
  const children = catalog.chitietcombo.filter((item) => item.macombo === service?.madichvu)
    .map((item) => item.madichvucon);

  const handleSubmit = async ({ madichvucon, ...values }) => {
    try {
      await mutation.mutateAsync({
        id: service?.madichvu,
        data: {
          ...values,
          ten: values.ten.trim(),
          loaidichvu: category,
          ...(isCombo ? { chitietcombo: madichvucon.map((id) => ({ madichvucon: id })) } : {}),
        },
      });
    } catch (error) { message.error(errorMessage(error)); }
  };

  return (
    <Form name="service-form" form={form} layout="vertical" disabled={mutation.isPending}
      initialValues={{ trangthai: 1, ...service, madichvucon: children }} onFinish={handleSubmit}>
      <Form.Item label={isCombo ? 'Tên combo' : 'Tên dịch vụ'} name="ten"
        rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tên dịch vụ.' },
          { max: 150, message: 'Tên dịch vụ tối đa 150 ký tự.' }]}>
        <Input maxLength={150} placeholder={isCombo ? 'Nhập tên combo...' : 'Nhập tên dịch vụ...'} />
      </Form.Item>
      {isCombo && (
        <Form.Item label="Dịch vụ thành phần" name="madichvucon"
          rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn ít nhất một dịch vụ lẻ.' }]}>
          <Select mode="multiple" placeholder="Chọn các dịch vụ lẻ..." optionFilterProp="label"
            options={catalog.dichvu.filter((item) => item.loaidichvu === 'SINGLE')
              .map((item) => ({ value: item.madichvu, label: item.ten }))} />
        </Form.Item>
      )}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Thời lượng (phút)" name="thoiluongphut"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng.' },
              { type: 'integer', min: 1, max: 2147483647, message: 'Nhập số phút nguyên lớn hơn 0.' }]}>
            <InputNumber min={1} max={2147483647} precision={0} style={{ width: '100%' }} placeholder="Ví dụ: 60" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Trạng thái" name="trangthai" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: 'Hoạt động' }, { value: 0, label: 'Vô hiệu' }]} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Hình ảnh" name="hinhanh" rules={[{ max: 255, message: 'Đường dẫn ảnh tối đa 255 ký tự.' }]}>
        <Input maxLength={255} placeholder="Nhập đường dẫn hình ảnh..." />
      </Form.Item>
      <Form.Item label="Mô tả" name="mota">
        <Input.TextArea rows={3} placeholder="Nhập mô tả dịch vụ..." />
      </Form.Item>
      <Form.Item className="mb-0 pt-2">
        <Flex justify="end" gap={12}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            {service ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
};

export default ServiceForm;
