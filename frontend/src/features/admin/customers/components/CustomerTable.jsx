import { DeleteOutlined, EditOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROW_PER_PAGE } from '~/app/config/constants.js';
import { useGetAllTrain } from '~/features/admin/trains/api/get-all-train.jsx';
import { useCustomers } from '../api/get-customers.jsx';

const DogIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m8 5-2-1a1.8 1.8 0 0 0-2.5 1.2L2 11a2 2 0 0 0 2 2h2M16 5l2-1a1.8 1.8 0 0 1 2.5 1.2L22 11a2 2 0 0 1-2 2h-2" />
    <path d="M8 5a8 8 0 0 1 8 0l2 7v3a6 6 0 0 1-12 0v-3Z" />
    <circle cx="9" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <path d="M10 15h4c0 1.3-.8 2-2 2s-2-.7-2-2Z" fill="currentColor" stroke="none" />
    <path d="M12 17v1m-2 0c1.1 1.3 2.9 1.3 4 0" />
  </svg>
);

export const CustomerTable = ({ onEdit, onToggleStatus, isUpdating = false }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const { data: trains } = useGetAllTrain();
  const trainId = trains?.[0]?.id;
  const { data: customers, isLoading } = useCustomers({
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
        render: (customer) => (
          <Space>
            <Button
              onClick={() => onEdit(customer)}
              disabled={isUpdating}
              icon={<EditOutlined />}
              iconPlacement={'end'}
              title="Chỉnh sửa khách hàng"
              aria-label="Chỉnh sửa khách hàng"
            />
            <Button
              onClick={() => onToggleStatus(customer)}
              disabled={isUpdating}
              icon={customer.is_deleted ? <ToolOutlined /> : <DeleteOutlined />}
              iconPlacement={'end'}
              title={customer.is_deleted ? 'Khôi phục khách hàng' : 'Vô hiệu hóa khách hàng'}
              aria-label={customer.is_deleted ? 'Khôi phục khách hàng' : 'Vô hiệu hóa khách hàng'}
            />
            <Button
              size="small"
              icon={<DogIcon />}
              title="Quản lý thú cưng"
              aria-label="Quản lý thú cưng"
              disabled={!trainId}
              onClick={() => navigate(`/admin/trains/${trainId}/route-segments`)}
            />
          </Space>
        ),
      },
    ],
    [navigate, trainId, onEdit, onToggleStatus, isUpdating],
  );

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={customers?.content}
        size="medium"
        pagination={{
          current: page,
          pageSize: customers?.size,
          total: customers?.totalElements,
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
