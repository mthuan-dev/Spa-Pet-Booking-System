import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Flex, Image, Popconfirm, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '~/components/ui/page-header.jsx';
import { customerPetsQuery, useCustomerPets, useSaveCustomerPet } from '~/features/admin/pets/api/customer-pets.js';
import PetFormModal from '~/features/admin/pets/components/PetFormModal.jsx';
import { PET_TYPES } from '~/features/profile/mappers/customerMapper.js';

export const CustomerPetsLoader = (queryClient) => async ({ params }) =>
  queryClient.ensureQueryData(customerPetsQuery(params.customerId));

export default function CustomerPetsPage() {
  const { customerId } = useParams();
  const { data, isLoading } = useCustomerPets(customerId);
  const { message } = App.useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const mutation = useSaveCustomerPet(customerId, {
    onSuccess: (_, { remove }) => {
      setFormOpen(false);
      setSelectedPet(null);
      message.success(remove ? 'Đã vô hiệu hóa thú cưng!' : 'Đã lưu thú cưng!');
    },
    onError: (error) => {
      message.error(error?.response?.data?.detail || 'Chưa lưu được thay đổi. Vui lòng thử lại.');
    },
  });
  const customer = data?.customer;
  const columns = [
    { title: 'Tên thú cưng', dataIndex: 'tenThuCung', width: 150 },
    { title: 'Loại', dataIndex: 'loaiThuCung', width: 90, render: (value) => PET_TYPES[value] ?? value },
    { title: 'Giống', dataIndex: 'giong', width: 140, render: (value) => value || '—' },
    { title: 'Cân nặng (kg)', dataIndex: 'canNang', width: 120, align: 'center' },
    {
      title: 'Ảnh', dataIndex: 'hinhAnh', width: 70, align: 'center',
      render: (value, pet) => value
        ? <Image src={value} alt={pet.tenThuCung} width={48} height={48} style={{ objectFit: 'cover' }} />
        : '—',
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', width: 120, align: 'center',
      render: (value) => <Tag color={value === 1 ? 'success' : 'red'}>{value === 1 ? 'Hoạt động' : 'Vô hiệu hóa'}</Tag>,
    },
    {
      title: 'Hành động', key: 'action', width: 110, align: 'center',
      render: (_, pet) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            disabled={mutation.isPending}
            title="Chỉnh sửa thú cưng"
            aria-label="Chỉnh sửa thú cưng"
            onClick={() => { setSelectedPet(pet); setFormOpen(true); }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn vô hiệu hóa thú cưng?"
            onConfirm={() => mutation.mutate({ pet, remove: true })}
            disabled={mutation.isPending || pet.trangThai === 0}
            okText="Có"
            cancelText="Không"
            placement="topRight"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              disabled={mutation.isPending || pet.trangThai === 0}
              title="Vô hiệu hóa thú cưng"
              aria-label="Vô hiệu hóa thú cưng"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-4">
        <PageHeader heading="Quản lý thú cưng" links={[
          { title: 'Trang chủ', href: '/admin' },
          { title: 'Khách hàng', href: '/admin/customers' },
          { title: 'Thú cưng' },
        ]} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setSelectedPet(null); setFormOpen(true); }}
          disabled={mutation.isPending || !customer}
        >
          Thêm mới
        </Button>
      </Flex>
      <Card title="Khách hàng" className="mb-3">
        <Descriptions items={[
          { key: 'id', label: 'Mã khách hàng', children: customer?.id },
          { key: 'name', label: 'Họ tên', children: customer?.name },
          { key: 'email', label: 'Email', children: customer?.email },
          { key: 'phone', label: 'Số điện thoại', children: customer?.phone || '—' },
          { key: 'status', label: 'Trạng thái', children: customer ? (customer.is_deleted ? 'Vô hiệu hóa' : 'Hoạt động') : '—' },
        ]} />
      </Card>
      <Table
        dataSource={data?.pets || []}
        columns={columns}
        size="small"
        rowKey="maThuCung"
        pagination={false}
        loading={isLoading || mutation.isPending}
        scroll={{ x: 800 }}
      />
      {formOpen && (
        <PetFormModal
          pet={selectedPet}
          onCancel={() => setFormOpen(false)}
          onSave={(pet, imageFile) => mutation.mutate({ pet, imageFile })}
          isPending={mutation.isPending}
        />
      )}
    </>
  );
}
