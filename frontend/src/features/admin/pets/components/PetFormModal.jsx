import { Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { PET_TYPES } from '~/features/profile/mappers/customerMapper.js';

export default function PetFormModal({ pet, onCancel, onSave, isPending }) {
  const [form] = Form.useForm();
  return (
    <Modal
      title={pet ? 'Cập nhật thú cưng' : 'Thêm thú cưng'}
      open
      onOk={form.submit}
      onCancel={() => { if (!isPending) onCancel(); }}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={isPending}
      cancelButtonProps={{ disabled: isPending }}
      closable={!isPending}
      keyboard={!isPending}
      mask={{ closable: false }}
    >
      <Form
        form={form}
        layout="vertical"
        variant="filled"
        initialValues={pet || { loaithucung: 'DOG', trangthai: 1 }}
        onFinish={(values) => onSave({ ...values, ...(pet ? { mathucung: pet.mathucung } : {}) })}
        disabled={isPending}
      >
        <Form.Item label="Tên thú cưng" name="tenthucung" rules={[
          { required: true, whitespace: true, message: 'Vui lòng nhập tên thú cưng.' },
          { max: 100, message: 'Tên thú cưng tối đa 100 ký tự.' },
        ]}>
          <Input maxLength={100} placeholder="Nhập tên thú cưng" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Loại thú cưng" name="loaithucung" rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng.' }]}>
              <Select options={Object.entries(PET_TYPES).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Cân nặng (kg)" name="cannang" rules={[{ required: true, message: 'Vui lòng nhập cân nặng.' }]}>
              <InputNumber min={0.01} max={999.99} precision={2} step={0.01} className="w-full" placeholder="Nhập cân nặng" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Giống" name="giong" rules={[{ max: 100, message: 'Giống thú cưng tối đa 100 ký tự.' }]}>
          <Input maxLength={100} placeholder="Nhập giống thú cưng" />
        </Form.Item>
        <Form.Item label="Hình ảnh" name="hinhanh" rules={[
          { max: 255, message: 'Đường dẫn hình ảnh tối đa 255 ký tự.' },
        ]}>
          <Input maxLength={255} placeholder="https://..." />
        </Form.Item>
        <Form.Item label="Trạng thái" name="trangthai" rules={[{ required: true, message: 'Vui lòng chọn trạng thái.' }]}>
          <Select options={[{ value: 1, label: 'Hoạt động' }, { value: 0, label: 'Vô hiệu hóa' }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
