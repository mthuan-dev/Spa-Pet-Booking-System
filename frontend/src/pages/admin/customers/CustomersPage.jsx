import { PlusSquareOutlined } from '@ant-design/icons';
import { App, Button, Flex, Modal, Space } from 'antd';
import { useState } from 'react';
import PageHeader from '~/components/ui/page-header.jsx';
import { useUpdateCustomer } from '~/features/admin/customers/api/save-customer.js';
import CustomerFormModal from '~/features/admin/customers/components/CustomerFormModal.jsx';
import { CustomerTable } from '~/features/admin/customers/components/CustomerTable.jsx';

const CustomersPage = () => {
  const { message } = App.useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [statusCustomer, setStatusCustomer] = useState(null);
  const statusMutation = useUpdateCustomer({
    mutationConfig: {
      onSuccess: () => {
        message.success(statusCustomer?.is_deleted ? 'Đã khôi phục khách hàng!' : 'Đã vô hiệu hóa khách hàng!');
        setStatusCustomer(null);
      },
      onError: (error) => {
        message.error(error?.response?.data?.detail || 'Chưa đổi được trạng thái. Vui lòng thử lại.');
      },
    },
  });

  const handleCreate = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleChangeStatus = () => {
    if (!statusCustomer || statusMutation.isPending) return;
    statusMutation.mutate({
      data: { id: statusCustomer.id, is_deleted: !statusCustomer.is_deleted },
    });
  };

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader heading="Quản lý khách hàng" links={[{ title: 'Trang chủ', href: '/' }, { title: 'Khách hàng' }]} />
        <Space>
          <Button onClick={handleCreate} type="primary" icon={<PlusSquareOutlined />}>
            Thêm mới
          </Button>
        </Space>
      </Flex>
      <div style={{ paddingTop: 20 }}>
        <CustomerTable
          onEdit={handleEdit}
          onToggleStatus={setStatusCustomer}
          isUpdating={statusMutation.isPending}
        />
      </div>
      {formOpen && (
        <CustomerFormModal
          customer={selectedCustomer}
          onCancel={() => setFormOpen(false)}
        />
      )}
      <Modal
        title={statusCustomer?.is_deleted ? 'Khôi phục khách hàng' : 'Vô hiệu hóa khách hàng'}
        open={Boolean(statusCustomer)}
        onOk={handleChangeStatus}
        onCancel={() => { if (!statusMutation.isPending) setStatusCustomer(null); }}
        confirmLoading={statusMutation.isPending}
        okText={statusCustomer?.is_deleted ? 'Khôi phục' : 'Vô hiệu hóa'}
        cancelText="Hủy"
        okButtonProps={{ danger: !statusCustomer?.is_deleted }}
        cancelButtonProps={{ disabled: statusMutation.isPending }}
        centered
      >
        <p>
          Bạn chắc chắn muốn {statusCustomer?.is_deleted ? 'khôi phục' : 'vô hiệu hóa'} khách hàng{' '}
          <strong>{statusCustomer?.name}</strong>?
        </p>
      </Modal>
    </>
  );
};
export default CustomersPage;
