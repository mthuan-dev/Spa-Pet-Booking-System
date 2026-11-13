import { DeleteOutlined, EditOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useEmployees } from '../api/get-employees.jsx';
import { ROW_PER_PAGE } from '~/app/config/constants.js';

export const EmployeeTable = ({ handleUpdateItem, handleUpdateStatus }) => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const { data: employees, isLoading } = useEmployees({
    page,
    keyword,
    size: ROW_PER_PAGE,
  });

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
        render: (text) => (text ? text : 'N/A'),
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        key: 'phone',
        render: (text) => (text ? text : 'N/A'),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        render: (text) => (text ? text : 'N/A'),
      },
      {
        title: 'Status',
        key: 'is_deleted',
        dataIndex: 'is_deleted',
        render: (_, { is_deleted }) => (
          <>
            <Tag color={is_deleted ? 'red' : 'blue'}>{is_deleted ? 'DISABLED' : 'ACTIVE'}</Tag>
          </>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: (data) => (
          <Space>
            <Button
              onClick={() => {
                handleUpdateItem(data);
              }}
              icon={<EditOutlined />}
              iconPlacement={'end'}
            />
            <Button
              onClick={() => handleUpdateStatus(data)}
              icon={data?.is_deleted ? <ToolOutlined /> : <DeleteOutlined />}
              iconPlacement={'end'}
            />
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
        dataSource={employees?.content}
        size="medium"
        pagination={{
          current: page,
          pageSize: employees?.size,
          total: employees?.totalElements,
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

