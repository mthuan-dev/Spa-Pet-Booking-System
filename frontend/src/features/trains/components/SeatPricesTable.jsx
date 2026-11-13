import { useMemo } from 'react';
import { Table } from 'antd';

const SeatPricesTable = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: 'Loại ghế',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Mã ghế',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: 'Giá vé / km',
        dataIndex: 'price',
        key: 'price',
      },
    ],
    [],
  );
  return <Table columns={columns} dataSource={data} size="medium" pagination={false} />;
};


export default SeatPricesTable;
