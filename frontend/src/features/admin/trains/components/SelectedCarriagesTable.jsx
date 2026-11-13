import { Button, Table } from 'antd';
import { useMemo } from 'react';
import { CloseOutlined } from '@ant-design/icons';

const SelectedCarriagesTable = ({ data, handleRemoveItem, isEdit = false }) => {
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Tên toa tàu',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Kết cấu toa',
        dataIndex: 'structure',
        key: 'structure',
      },
      {
        title: 'Số chỗ',
        dataIndex: 'seats',
        key: 'seats',
      },
    ];
    if (isEdit)
      return [
        ...baseColumns,
        {
          title: '',
          dataIndex: 'index',
          key: 'index',
          render: (index) => (
            <Button
              onClick={() => {
                handleRemoveItem(index);
              }}
              type="text"
              icon={<CloseOutlined />}
              size="small"
            />
          ),
        },
      ];
    return baseColumns;
  }, [handleRemoveItem, isEdit]);

  return <Table columns={columns} dataSource={data} size="medium" pagination={false} />;
};


export default SelectedCarriagesTable;
