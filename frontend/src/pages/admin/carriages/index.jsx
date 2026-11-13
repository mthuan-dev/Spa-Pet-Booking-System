import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Space } from 'antd';
import { Link } from 'react-router-dom';
import PageHeader from '~/components/ui/page-header.jsx';
import CarriageLayoutTable from '~/features/carriages/components/CarriageLayoutTable.jsx';

const CarriagesManagement = () => {
  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader heading="Quản lý combo dịch vụ" links={[{ title: 'Trang chủ', href: '/admin' }, { title: 'Combo dịch vụ' }]} />
        <Space>
          <Link to="create">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm mới
            </Button>
          </Link>
        </Space>
      </Flex>
      <CarriageLayoutTable />
    </>
  );
};

export default CarriagesManagement;
