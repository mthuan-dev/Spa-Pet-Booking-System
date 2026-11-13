import { Button, Popconfirm, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const RouteSegmentsTable = ({
  dataSource,
  openUpdateModal,
  setSelectedRow,
  handleDelete,
  isPending,
}) => {
  const columns = [
    {
      title: '#',
      dataIndex: 'stt',
      width: 60,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Ga đi',
      dataIndex: ['station', 'name'],
    },
    {
      title: 'Cự ly (Km)',
      dataIndex: 'distance',
      align: 'center',
    },
    {
      title: 'Ngày thứ',
      dataIndex: 'day_number',
      align: 'center',
    },
    {
      title: 'Giờ đến',
      dataIndex: 'departure_time',
      align: 'center',
      render: (value) => dayjs(value, 'HH:mm:ss').format('HH:mm'),
    },
    {
      title: 'Giờ đi',
      dataIndex: 'arrival_time',
      align: 'center',
      render: (value) => dayjs(value, 'HH:mm:ss').format('HH:mm'),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      align: 'center',
      render: (text, record, index) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            disabled={isPending}
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
            onClick={() => {
              setSelectedRow(record);
              openUpdateModal();
            }}
          />
          <PopconfirmDelete onConfirm={() => handleDelete(index)} disabled={isPending} />
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      size="small"
      rowKey={(record) => record.station.id}
      pagination={false}
      loading={isPending}
    />
  );
};

const PopconfirmDelete = ({ onConfirm, disabled }) => {
  return (
    <Popconfirm
      title="Bạn có chắc chắn muốn xóa điểm dừng?"
      onConfirm={onConfirm}
      disabled={disabled}
      okText="Có"
      cancelText="Không"
      placement="topRight"
    >
      <Button icon={<DeleteOutlined />} size="small" danger disabled={disabled} title="Xóa" aria-label="Xóa" />
    </Popconfirm>
  );
};

export default RouteSegmentsTable;
