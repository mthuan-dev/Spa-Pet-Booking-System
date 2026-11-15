import { App, Button, Col, Flex, Form, InputNumber, Row, Select } from 'antd';
import { useSaveCatalogItem } from '../api/catalog.js';
import { errorMessage, PET_TYPES } from './catalogShared.jsx';

const PriceForm = ({ price, catalog, petType, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const mutation = useSaveCatalogItem('service-prices', (savedPrice) => {
    message.success(price ? 'Cập nhật giá dịch vụ thành công!' : 'Thêm giá dịch vụ thành công!');
    onSuccess(savedPrice);
  });
  const handleSubmit = async (values) => {
    if (mutation.isPending) return;
    try { await mutation.mutateAsync({ id: price?.magiadichvu, data: values }); }
    catch (error) { message.error(errorMessage(error)); }
  };
  return (
    <Form name="price-form" form={form} layout="vertical" disabled={mutation.isPending}
      initialValues={{ loaithucung: petType, ...initialValues, ...price }} onFinish={handleSubmit}>
      <Form.Item label="Dịch vụ" name="madichvu" rules={[{ required: true, message: 'Vui lòng chọn dịch vụ.' }]}>
        <Select disabled={Boolean(price) || mutation.isPending} showSearch optionFilterProp="label" placeholder="Chọn dịch vụ lẻ hoặc combo..."
          options={catalog.dichvu.map((service) => ({
            value: service.madichvu,
            label: `${service.ten}${service.loaidichvu === 'COMBO' ? ' (Combo)' : ''}`,
          }))} />
      </Form.Item>
      <Form.Item label="Loại thú cưng" name="loaithucung" rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng.' }]}>
        <Select disabled={Boolean(price) || mutation.isPending} options={PET_TYPES} />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Cân nặng từ (kg)" name="cannangtu"
            rules={[{ required: true, message: 'Vui lòng nhập cân nặng từ.' },
              { type: 'number', min: 0, max: 999.99, message: 'Cân nặng từ 0 đến 999,99 kg.' }]}>
            <InputNumber min={0} max={999.99} precision={2} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Cân nặng đến (kg)" name="cannangden" dependencies={['cannangtu', 'madichvu', 'loaithucung']}
            rules={[{ required: true, message: 'Vui lòng nhập cân nặng đến.' },
              { type: 'number', min: 0, max: 999.99, message: 'Cân nặng tối đa 999,99 kg.' },
              ({ getFieldValue }) => ({ validator(_, value) {
                const start = getFieldValue('cannangtu');
                if (value == null || start == null) return Promise.resolve();
                if (value <= start) return Promise.reject(new Error('Cân nặng đến phải lớn hơn cân nặng từ.'));
                const overlaps = catalog.giadichvu.some((item) => item.magiadichvu !== price?.magiadichvu
                  && item.madichvu === getFieldValue('madichvu') && item.loaithucung === getFieldValue('loaithucung')
                  && start < item.cannangden && value > item.cannangtu);
                return overlaps
                  ? Promise.reject(new Error('Khoảng cân nặng bị trùng với mức giá khác.')) : Promise.resolve();
              } })]}>
            <InputNumber min={0} max={999.99} precision={2} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Giá tiền (VNĐ)" name="gia"
        rules={[{ required: true, message: 'Vui lòng nhập giá tiền.' },
          { type: 'number', min: 0, max: 9999999999.99, message: 'Giá tiền phải từ 0 đến 9.999.999.999,99 đồng.' }]}>
        <InputNumber min={0} max={9999999999.99} precision={2} step={1000} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item className="mb-0 pt-2">
        <Flex justify="end" gap={12}>
          <Button onClick={onCancel} disabled={mutation.isPending}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            {price ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
};

export default PriceForm;
