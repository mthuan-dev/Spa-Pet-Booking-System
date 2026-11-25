import {
  HomeOutlined,
  ScheduleOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  TruckOutlined,
} from '@ant-design/icons';

const adminMenu = Object.freeze([
  {
    key: '1',
    icon: <HomeOutlined />,
    label: 'Trang chủ',
    path: '/admin',
  },
  {
    key: '2',
    icon: <ScheduleOutlined />,
    label: 'Quản lý lịch hẹn',
    children: [
      {
        key: '2-2',
        label: 'Lịch hẹn',
        path: '/admin/booking-schedules',
      },
      {
        key: '3-2',
        label: 'Xử lý đặt lịch',
        path: '/admin/orders',
      },
    ],
  },
  {
    key: '4',
    icon: <UserOutlined />,
    label: 'Quản lý khách hàng',
    path: '/admin/customers',
  },
  {
    key: '6',
    icon: <TeamOutlined />,
    label: 'Quản lý nhân viên',
    path: '/admin/employees',
  },
  {
    key: '7',
    icon: <TruckOutlined />,
    label: 'Quản lý dịch vụ',
    children: [
      {
        key: '7-1',
        label: 'Dịch vụ lẻ',
        path: '/admin/services',
      },
      {
        key: '7-2',
        label: 'Combo dịch vụ',
        path: '/admin/combos',
      },
      {
        key: '7-3',
        label: 'Giá theo cân nặng',
        path: '/admin/weight-prices',
      },
    ],
  },
  {
    key: '8',
    icon: <BarChartOutlined />,
    label: 'Báo cáo & Thống kê',
    path: '/admin/reports',
  },
]);

export { adminMenu };
