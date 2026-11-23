import { PlusSquareOutlined } from '@ant-design/icons';
import { App, Button, Flex, Space } from 'antd';
import { useState } from 'react';
import ConfirmModal from '~/components/ui/modals/ConfirmModal.jsx';
import PageHeader from '~/components/ui/page-header.jsx';
import { useUpdateEmployee } from '~/features/admin/employees/api/update-employee.jsx';
import CreateEmployeeModal from '~/features/admin/employees/components/CreateEmployeeModal.jsx';
import { EmployeeTable } from '~/features/admin/employees/components/EmployeeTable.jsx';
import UpdateEmployeeModal from '~/features/admin/employees/components/UpdateEmployeeModal.jsx';
import { useBoolean } from '~/hooks/useBoolean.jsx';

const EmployeePage = () => {
  const { message } = App.useApp();
  const {
    value: isOpenUpdateStatusModal,
    setFalse: closeUpdateStatusModal,
    setTrue: openUpdateStatusModal,
  } = useBoolean(false);
  const { value: isOpenCreateModal, setFalse: closeCreateModal, setTrue: openCreateModal } = useBoolean(false);
  const { value: isOpenUpdateModal, setFalse: closeUpdateModal, setTrue: openUpdateModal } = useBoolean(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const updateMutation = useUpdateEmployee({
    mutationConfig: {
      onSuccess: () => {
        message.success('Cập nhật thành công!');
      },
      onError: (error) => {
        message.error(error?.response?.data?.detail || 'Chưa cập nhật được nhân viên. Vui lòng thử lại.');
      },
    },
  });

  const handleUpdateStatus = (employee) => {
    setSelectedEmployee(employee);
    openUpdateStatusModal();
  };

  const handleUpdate = (employee) => {
    setSelectedEmployee(employee);
    openUpdateModal();
  };

  const handleChangeStatus = () => {
    if (selectedEmployee) {
      updateMutation.mutate({
        data: {
          ...selectedEmployee,
          is_deleted: !selectedEmployee?.is_deleted,
        },
      });
      closeUpdateStatusModal();
    }
  };

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader heading="Quản lý nhân viên" links={[{ title: 'Trang chủ', href: '/' }, { title: 'Nhân viên' }]} />
        <Space>
          <Button onClick={openCreateModal} type="primary" icon={<PlusSquareOutlined />}>
            Thêm mới
          </Button>
        </Space>
      </Flex>
      <div style={{ paddingTop: 20 }}>
        <EmployeeTable handleUpdateItem={handleUpdate} handleUpdateStatus={handleUpdateStatus} />
      </div>
      <ConfirmModal
        title={
          selectedEmployee?.is_deleted
            ? `Bạn chắc chắn muốn khôi phục nhân viên ${selectedEmployee?.name}?`
            : `Bạn chắc chắn muốn vô hiệu nhân viên ${selectedEmployee?.name}?`
        }
        open={isOpenUpdateStatusModal}
        handleCancel={closeUpdateStatusModal}
        handleOk={handleChangeStatus}
      />
      <CreateEmployeeModal open={isOpenCreateModal} handleCancel={closeCreateModal} />
      {isOpenUpdateModal && (
        <UpdateEmployeeModal
          open={isOpenUpdateModal}
          handleCancel={closeUpdateModal}
          selectedEmployee={selectedEmployee}
          mutation={updateMutation}
        />
      )}
    </>
  );
};
export default EmployeePage;
