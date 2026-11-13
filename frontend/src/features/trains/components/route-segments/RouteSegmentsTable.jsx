import { Button, Popconfirm, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined, PlusSquareOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useContext, useMemo } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { move } from '@dnd-kit/helpers';

const RowContext = React.createContext({});
const verticalModifiers = [RestrictToVerticalAxis];
const DragHandle = () => {
  const { handleRef } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{
        cursor: 'move',
      }}
      ref={handleRef}
      aria-label="Đổi thứ tự điểm dừng"
    />
  );
};

const Row = ({ sortableIndex, ...props }) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: props['data-row-key'],
    index: sortableIndex,
  });

  const style = {
    ...props.style,
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 99,
        }
      : {}),
  };
  const contextValue = useMemo(
    () => ({
      handleRef,
    }),
    [handleRef],
  );
  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={ref} style={style} />
    </RowContext.Provider>
  );
};

const RouteSegmentsTable = ({
  dataSource,
  setDataSource,
  openAddModal,
  openUpdateModal,
  setSelectedRow,
  handleDelete,
}) => {
  const columns = [
    {
      key: 'sort',
      align: 'center',
      width: 80,
      render: () => <DragHandle />,
    },
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
            onClick={() => {
              setSelectedRow(record);
              openUpdateModal();
            }}
          />
          <PopconfirmDelete onConfirm={() => handleDelete(index)} />
        </Space>
      ),
    },
  ];

  const handleDragEnd = (event) => {
    if (event.canceled) return;
    setDataSource((records) =>
      move(records.map((record) => ({ id: record.station.id, record })), event).map((item) => item.record),
    );
  };

  return (
    <DragDropProvider modifiers={verticalModifiers} onDragEnd={handleDragEnd}>
        <Table
          dataSource={dataSource}
          columns={columns}
          size="small"
          footer={() => (
            <Button icon={<PlusSquareOutlined />} onClick={openAddModal}>
              Thêm điểm dừng
            </Button>
          )}
          rowKey={(record) => record.station.id}
          onRow={(_, index) => ({ sortableIndex: index })}
          pagination={false}
          components={{
            body: {
              row: Row,
            },
          }}
        />
    </DragDropProvider>
  );
};

const PopconfirmDelete = ({ onConfirm }) => {
  return (
    <Popconfirm
      title="Bạn có chắc chắn muốn xóa điểm dừng?"
      onConfirm={onConfirm}
      okText="Có"
      cancelText="Không"
      placement="topRight"
    >
      <Button icon={<DeleteOutlined />} size="small" danger />
    </Popconfirm>
  );
};

export default RouteSegmentsTable;
