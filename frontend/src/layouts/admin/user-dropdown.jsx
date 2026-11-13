import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

const UserDropdown = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = [
    {
      key: '1',
      label: 'Account info',
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    {
      key: '3',
      label: 'Logout',
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
      placement="bottomLeft"
      arrow
    >
      <Avatar size="medium" src={'https://avatars.githubusercontent.com/u/45101901?v=4'} className="cursor-pointer" />
    </Dropdown>
  );
};

export default UserDropdown;
