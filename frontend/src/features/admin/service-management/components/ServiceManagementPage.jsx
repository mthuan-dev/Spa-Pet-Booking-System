import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined, ToolOutlined } from '@ant-design/icons';
import { App, Button, Flex, Input, Modal, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROW_PER_PAGE } from '~/app/config/constants.js';
import PageHeader from '~/components/ui/page-header.jsx';
import { useSaveCatalogItem, useServiceCatalog } from '../api/catalog.js';
import ServiceForm from './ServiceForm.jsx';
import { CatalogState, errorMessage, matchesKeyword, ServiceImage, ServiceStatus } from './catalogShared.jsx';

const ServiceManagementPage = ({ category }) => {
  const isCombo = category === 'COMBO';
  const title = isCombo ? 'Combo dịch vụ' : 'Dịch vụ lẻ';
  const query = useServiceCatalog();
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState(null);
  const [formPending, setFormPending] = useState(false);
  const [statusService, setStatusService] = useState(null);
  const statusMutation = useSaveCatalogItem('services', () => {
    message.success('Cập nhật trạng thái thành công!');
    setStatusService(null);
  });
  const catalog = query.data;
  const services = catalog?.dichvu ?? [];
  const rows = services.filter((service) => service.loaidichvu === category
    && matchesKeyword(`${service.madichvu} ${service.ten} ${service.mota || ''}`, keyword));
  const toggleStatus = async () => {
    if (!statusService || statusMutation.isPending) return;
    try { await statusMutation.mutateAsync({ id: statusService.madichvu, data: { trangthai: statusService.trangthai === 1 ? 0 : 1 } }); }
    catch (error) { message.error(errorMessage(error)); }
  };
  const columns = [
    { title: '#', dataIndex: 'madichvu', width: 64 },
    { title: 'Ảnh', key: 'hinhanh', width: 80, render: (_, service) => <ServiceImage service={service} /> },
    { title: isCombo ? 'Tên combo' : 'Tên dịch vụ', dataIndex: 'ten', width: 210 },
    ...(isCombo ? [{ title: 'Dịch vụ thành phần', key: 'chitietcombo', width: 260, render: (_, service) => (
      <Flex vertical align="start" gap={4}>{catalog.chitietcombo.filter((item) => item.macombo === service.madichvu)
        .map((item) => <Tag key={item.madichvucon} style={{ whiteSpace: 'normal', marginInlineEnd: 0 }}>
          {services.find((child) => child.madichvu === item.madichvucon)?.ten}
        </Tag>)}
      </Flex>
    ) }] : []),
    { title: 'Thời lượng (phút)', dataIndex: 'thoiluongphut', width: 145, align: 'center' },
    ...(!isCombo ? [{ title: 'Mô tả', dataIndex: 'mota', width: 250, ellipsis: true, render: (value) => value || '—' }] : []),
    { title: 'Trạng thái', dataIndex: 'trangthai', width: 125, render: (value) => <ServiceStatus value={value} /> },
    { title: 'Thao tác', key: 'action', width: isCombo ? 145 : 105, align: 'center', render: (_, service) => (
      <Space>
        {isCombo
          ? <Link to={`${service.madichvu}/edit`}><Button icon={<EditOutlined />} title="Chỉnh sửa" /></Link>
          : <Button icon={<EditOutlined />} title="Chỉnh sửa" onClick={() => setEditing(service)} />}
        {isCombo && <Link to={`${service.madichvu}`}><Button icon={<QuestionCircleOutlined />} title="Chi tiết" /></Link>}
        <Button disabled={statusMutation.isPending} onClick={() => setStatusService(service)}
          icon={service.trangthai === 1 ? <DeleteOutlined /> : <ToolOutlined />}
          title={service.trangthai === 1 ? 'Vô hiệu hóa' : 'Khôi phục'} />
      </Space>
    ) },
  ];
  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2" gap={12}>
        <PageHeader heading={`Quản lý ${title.toLowerCase()}`}
          links={[{ title: 'Trang chủ', href: '/admin' }, { title }]} />
        {isCombo
          ? <Link to="create"><Button type="primary" icon={<PlusOutlined />}>Thêm mới</Button></Link>
          : <Button type="primary" icon={<PlusOutlined />} disabled={!catalog} onClick={() => setEditing({})}>Thêm mới</Button>}
      </Flex>
      {query.isError ? <CatalogState query={query} /> : (
        <Table columns={columns} dataSource={rows} rowKey="madichvu" size="medium" loading={query.isPending}
          scroll={{ x: 1120 }} pagination={{ current: page, pageSize: ROW_PER_PAGE, total: rows.length,
            showSizeChanger: false, onChange: setPage }}
          title={() => <Input.Search placeholder="Tìm kiếm dịch vụ..." className="w-[250px]" allowClear
            onSearch={(value) => { setKeyword(value); setPage(1); }} />} />
      )}
      {editing && catalog && (
        <Modal open title={editing.madichvu ? 'Chỉnh sửa dịch vụ lẻ' : 'Thêm dịch vụ lẻ'} footer={null}
          maskClosable={!formPending} onCancel={() => { if (!formPending) setEditing(null); }}>
          <div className="pt-4">
            <ServiceForm category="SINGLE" service={editing.madichvu ? editing : null} catalog={catalog}
              onPendingChange={setFormPending} onSuccess={() => setEditing(null)} onCancel={() => setEditing(null)} />
          </div>
        </Modal>
      )}
      <Modal
        title={statusService?.trangthai === 0 ? 'Khôi phục dịch vụ' : 'Vô hiệu hóa dịch vụ'}
        open={Boolean(statusService)}
        onOk={toggleStatus}
        onCancel={() => { if (!statusMutation.isPending) setStatusService(null); }}
        confirmLoading={statusMutation.isPending}
        okText={statusService?.trangthai === 0 ? 'Khôi phục' : 'Vô hiệu hóa'}
        cancelText="Hủy"
        okButtonProps={{ danger: statusService?.trangthai === 1 }}
        cancelButtonProps={{ disabled: statusMutation.isPending }}
        centered
      >
        <p>Bạn chắc chắn muốn {statusService?.trangthai === 0 ? 'khôi phục' : 'vô hiệu hóa'} dịch vụ{' '}
          <strong>{statusService?.ten}</strong>?
        </p>
      </Modal>
    </>
  );
};

export default ServiceManagementPage;
