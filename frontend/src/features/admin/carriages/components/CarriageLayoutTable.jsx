import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { ROW_PER_PAGE } from '~/app/config/constants.js';
import { Link } from 'react-router-dom';
import { useCarriageLayouts } from '../api/get-layouts.jsx';

const CarriageLayoutTable = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const { data: carriageLayouts, isLoading } = useCarriageLayouts({ page: page, size: ROW_PER_PAGE, keyword });

  const columns = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Tên toa tàu',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Kết cấu toa',
        key: 'floors',
        render: (value) => `${value.floors} tầng, ${value.row_count} hàng`,
      },
      {
        title: 'Số chỗ',
        dataIndex: 'seats',
        key: 'seats',
        render: (seats) => `${seats?.length} chỗ`,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'active',
        key: 'active',
        align: 'center',
        render: (value) => (value ? <Tag color="success">Hoạt động</Tag> : <Tag color="default">Vô hiệu</Tag>),
      },
      {
        title: 'Hành động',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        render: (value) => (
          <Space>
            <Link to={`${value}/edit`} type="default">
              <Button size="small" icon={<EditOutlined />} iconPlacement={'end'} title="Chỉnh sửa" />
            </Link>
            <Link to={`${value}`} type="default">
              <Button
                size="small"
                onClick={null}
                icon={<QuestionCircleOutlined />}
                iconPlacement={'end'}
                title="Chi tiết"
              />
            </Link>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={carriageLayouts?.items}
        size="medium"
        pagination={{
          current: page,
          pageSize: carriageLayouts?.meta?.per_page,
          total: carriageLayouts?.totalElements?.total_elements,
        }}
        loading={isLoading}
        onChange={(e) => {
          setPage(e?.current);
        }}
        title={() => (
          <Flex justify="space-between">
            <Input.Search
              placeholder="Tìm kiếm..."
              className="w-[250px]"
              allowClear
              onSearch={(value) => {
                console.log(value);
                setKeyword(value);
                setPage(1);
              }}
            />
          </Flex>
        )}
      />
    </>
  );
};

export default CarriageLayoutTable;
