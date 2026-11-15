import { DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

const UserDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.fullName?.trim() || user?.email || 'Quản trị viên';
  const items = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: async () => {
        await logout();
        navigate('/login', { replace: true });
      },
    },
  ];
  return (
    <Dropdown
      menu={{
        items,
      }}
      trigger={['click']}
      placement="bottomRight"
      popupRender={(menu) => (
        <div className="admin-account-dropdown">
          <div className="admin-account-dropdown__heading">Tuỳ chọn</div>
          {menu}
        </div>
      )}
    >
      <button
        type="button"
        className="admin-account-trigger"
        title={displayName}
        aria-label={`Tài khoản ${displayName}`}
        aria-haspopup="menu"
      >
        <span className="admin-account-trigger__name">{displayName}</span>
        <DownOutlined className="admin-account-trigger__arrow" />
      </button>
    </Dropdown>
  );
};

export default UserDropdown;
