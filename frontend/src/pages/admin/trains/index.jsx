import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Space } from 'antd';
import { Link } from 'react-router-dom';
import PageHeader from '~/components/ui/page-header.jsx';
import TrainsTable from '~/features/trains/components/TrainsTable.jsx';

const TrainsManagement = () => {
  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader heading="Quản lý giá theo cân nặng" links={[{ title: 'Trang chủ', href: '/admin' }, { title: 'Giá theo cân nặng' }]} />
        <Space>
          <Link to="create">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm mới
            </Button>
          </Link>
        </Space>
      </Flex>
      <TrainsTable />
    </>
  );
};

export default TrainsManagement;
