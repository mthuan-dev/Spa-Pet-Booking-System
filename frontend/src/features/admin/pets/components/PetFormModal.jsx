import { Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { useState } from 'react';
import { PET_TYPES } from '~/app/config/constants.js';
import ServiceImageInput from '~/features/admin/service-management/components/ServiceImageInput.jsx';
import { petImageUrl } from '../utils/petImages.js';

export default function PetFormModal({ pet, onCancel, onSave, isPending }) {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imageBusy, setImageBusy] = useState(false);
  const busy = isPending || imageBusy;
  return (
    <Modal
      title={pet ? 'Cập nhật thú cưng' : 'Thêm thú cưng'}
      open
      onOk={() => { if (!busy) form.submit(); }}
      onCancel={() => { if (!busy) onCancel(); }}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={isPending}
      cancelButtonProps={{ disabled: busy }}
      closable={!busy}
      keyboard={!busy}
      mask={{ closable: false }}
    >
      <Form
        form={form}
        layout="vertical"
        variant="filled"
        initialValues={pet || { loaiThuCung: 'DOG', trangThai: 1 }}
        onFinish={(values) => onSave({ ...values, ...(pet ? { maThuCung: pet.maThuCung } : {}) }, imageFile)}
        disabled={busy}
      >
        <Form.Item label="Tên thú cưng" name="tenThuCung" rules={[
          { required: true, whitespace: true, message: 'Vui lòng nhập tên thú cưng.' },
          { max: 100, message: 'Tên thú cưng tối đa 100 ký tự.' },
        ]}>
          <Input maxLength={100} placeholder="Nhập tên thú cưng" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Loại thú cưng" name="loaiThuCung" rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng.' }]}>
              <Select options={Object.entries(PET_TYPES).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Cân nặng (kg)" name="canNang" rules={[{ required: true, message: 'Vui lòng nhập cân nặng.' }]}>
              <InputNumber min={0.01} max={999.99} precision={2} step={0.01} className="w-full" placeholder="Nhập cân nặng" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Giống" name="giong" rules={[{ max: 100, message: 'Giống thú cưng tối đa 100 ký tự.' }]}>
          <Input maxLength={100} placeholder="Nhập giống thú cưng" />
        </Form.Item>
        <Form.Item label="Hình ảnh" name="hinhAnh" rules={[{ max: 255, message: 'Đường dẫn hình ảnh tối đa 255 ký tự.' }]}>
          <ServiceImageInput
            file={imageFile}
            onFileChange={setImageFile}
            imageUrl={petImageUrl(pet?.hinhAnh)}
            disabled={busy}
            onBusyChange={setImageBusy}
            entityLabel="thú cưng"
          />
        </Form.Item>
        <Form.Item label="Trạng thái" name="trangThai" rules={[{ required: true, message: 'Vui lòng chọn trạng thái.' }]}>
          <Select options={[{ value: 1, label: 'Hoạt động' }, { value: 0, label: 'Vô hiệu hóa' }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
