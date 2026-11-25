import { Drawer, Grid, Layout } from 'antd';
import { Link } from 'react-router-dom';
import MenuCustom from '~/layouts/admin/menu.jsx';
import useMenuStore from '~/stores/menu-store.js';
import adminLogo from '~/assets/brand/logoheader.png';

const { Sider } = Layout;

const SiderResponsive = () => {
  const breakpoint = Grid.useBreakpoint();
  const isMobile = typeof breakpoint.lg === 'undefined' ? false : !breakpoint.lg;

  const { siderVisible, setSiderVisible } = useMenuStore();

  return (
    <>
      {isMobile ? (
        <Drawer
          open={siderVisible}
          onClose={() => setSiderVisible(false)}
          placement="left"
          styles={{ header: { display: 'none' }, body: { padding: '10px' } }}
          size={300}
        >
          <MenuCustom mode="inline" isMobile={isMobile} theme="light" onClose={() => setSiderVisible(false)} />
        </Drawer>
      ) : (
        <Sider
          theme="light"
          trigger={null}
          className="overflow-auto h-screen !sticky top-0 left-0 bottom-0 px-1 border-r-[1px] border-gray-200"
          collapsed={siderVisible}
          width="240"
        >
          <>
            <Link to="/admin">
              <img src={adminLogo} alt="MEOMEO Spa" className="h-16 mx-auto mb-4 object-contain" />
            </Link>
            <MenuCustom mode="inline" theme="light" isMobile={isMobile} onClose={() => setSiderVisible(false)} />
          </>
        </Sider>
      )}
    </>
  );
};

export default SiderResponsive;
