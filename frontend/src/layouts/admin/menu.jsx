import { ConfigProvider, Menu } from 'antd';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { adminMenu } from '~/app/config/menu.jsx';

const MenuCustom = ({ isMobile, onClose, theme = 'light', ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const findItemByPath = useCallback((items, path) => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const child = findItemByPath(item.children, path);
        if (child) return child;
      }
    }
  }, []);

  const findPathByKey = useCallback((items, key) => {
    for (const item of items) {
      if (item.key === key) return item.path;
      if (item.children) {
        const path = findPathByKey(item.children, key);
        if (path) return path;
      }
    }
    return null;
  }, []);

  const selectedKeys = useMemo(() => {
    let path = location.pathname.replace(/\/$/, '');
    let item = findItemByPath(adminMenu, path);
    while (!item && path.includes('/')) {
      path = path.slice(0, path.lastIndexOf('/'));
      item = findItemByPath(adminMenu, path);
    }
    return item ? [item.key] : [];
  }, [location.pathname, findItemByPath]);

  const handleMenuClick = useCallback(
    (e) => {
      if (isMobile) {
        onClose();
      }
      const path = findPathByKey(adminMenu, e.key);
      if (path) {
        navigate(path);
      }
    },
    [findPathByKey, isMobile, onClose, navigate],
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          controlHeight: 32,
        },
      }}
    >
      <SimpleBar style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <Menu
          mode="vertical"
          theme={theme}
          selectedKeys={selectedKeys}
          items={adminMenu}
          rootClassName="!border-none"
          onClick={handleMenuClick}
          {...props}
        ></Menu>
      </SimpleBar>
    </ConfigProvider>
  );
};

export default MenuCustom;
