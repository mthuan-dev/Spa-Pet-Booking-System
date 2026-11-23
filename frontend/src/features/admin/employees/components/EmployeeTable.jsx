import { DeleteOutlined, EditOutlined, ToolOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Input, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useEmployees } from '../api/get-employees.jsx';
import { ROW_PER_PAGE } from '~/app/config/constants.js';

export const EmployeeTable = ({ handleUpdateItem, handleUpdateStatus }) => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const { data: employees, isLoading, isError, error, refetch } = useEmployees({
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
        title: 'Họ tên',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (text) => text || '—',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value) => value && dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—',
      },
      {
        title: 'Trạng thái',
        key: 'is_deleted',
        dataIndex: 'is_deleted',
        render: (_, { is_deleted }) => (
          <>
            <Tag color={is_deleted ? 'red' : 'blue'}>{is_deleted ? 'Vô hiệu hóa' : 'Hoạt động'}</Tag>
          </>
        ),
      },
      {
        title: 'Hành động',
        key: 'action',
        render: (data) => (
          <Space>
            <Button
              onClick={() => {
                handleUpdateItem(data);
              }}
              icon={<EditOutlined />}
              iconPlacement={'end'}
              title="Chỉnh sửa nhân viên"
              aria-label="Chỉnh sửa nhân viên"
            />
            <Button
              onClick={() => handleUpdateStatus(data)}
              icon={data?.is_deleted ? <ToolOutlined /> : <DeleteOutlined />}
              iconPlacement={'end'}
              title={data.is_deleted ? 'Khôi phục nhân viên' : 'Vô hiệu hóa nhân viên'}
              aria-label={data.is_deleted ? 'Khôi phục nhân viên' : 'Vô hiệu hóa nhân viên'}
            />
          </Space>
        ),
      },
    ],
    [handleUpdateItem, handleUpdateStatus],
  );

  return (
    <>
      {isError && <Alert className="mb-3" type="error" showIcon title="Chưa tải được danh sách nhân viên."
        description={error?.message} action={<Button onClick={() => refetch()}>Thử lại</Button>} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={employees?.content}
        size="medium"
        pagination={{
          showSizeChanger: false,
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

