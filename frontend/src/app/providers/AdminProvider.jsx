import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import { queryClient } from '../../lib/query-client.js';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
dayjs.locale('vi');

const AppProvider = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Be Vietnam Pro',
          borderRadius: 6,
          controlHeight: 34,
          colorPrimary: '#006dae',
          colorLinkHover: '#0050a3',
        },
        hashed: false,
      }}
      locale={viVN}
    >
      <QueryClientProvider client={queryClient}>
        <AntApp>{children}</AntApp>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default AppProvider;
