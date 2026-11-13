import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Space } from 'antd';
import { Outlet } from 'react-router-dom';
import FooterAdmin from '~/layouts/admin/footer.jsx';
import SiderResponsive from '~/layouts/admin/sider-responsive.jsx';
import UserDropdown from '~/layouts/admin/user-dropdown.jsx';
import useMenuStore from '~/stores/menu-store.js';
const { Header, Content } = Layout;

const AdminLayout = () => {
  const { siderVisible, setSiderVisible } = useMenuStore();

  return (
    <Layout hasSider>
      <SiderResponsive />
      <Layout>
        <Header className="p-0 bg-white sticky top-0 z-50 shadow-sm flex justify-between items-center px-5">
          <Space>
            <Button
              type="text"
              icon={siderVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSiderVisible(!siderVisible)}
            />
            <Input placeholder="Tìm kiếm..." variant="filled" suffix={<SearchOutlined />} />
          </Space>
          <UserDropdown />
        </Header>
        <Content
          style={{
            margin: '24px 16px 0',
            overflow: 'initial',
          }}
        >
          <Outlet />
        </Content>
        <FooterAdmin />
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
