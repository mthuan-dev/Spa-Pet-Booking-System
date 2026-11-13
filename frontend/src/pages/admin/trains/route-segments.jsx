import { App, Button, Card, Descriptions, Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBoolean } from '~/hooks/useBoolean.jsx';
import dayjs from 'dayjs';
import { useLoaderData, useParams } from 'react-router-dom';
import { trainQuery } from '~/features/trains/api/get-route-segments.jsx';
import PageHeader from '~/components/ui/page-header.jsx';
import AddStopPointModal from '~/features/trains/components/route-segments/AddStopPointModal.jsx';
import RouteSegmentsTable from '~/features/trains/components/route-segments/RouteSegmentsTable.jsx';
import { useSaveRouteSegments } from '~/features/trains/api/save-route-segments.jsx';
import UpdateStopPointModal from '~/features/trains/components/route-segments/UpdateStopPointModal.jsx';
import { calculateTravelTime } from '~/utils/calculateTravelTime.js';

export const RouteSegmentsLoader =
  (queryClient) =>
  async ({ params }) => {
    const query = trainQuery(params.trainId);
    return queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));
  };

const RouteSegments = () => {
  const { id, name, route, route_segments } = useLoaderData();
  const { trainId } = useParams();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [dataSource, setDataSource] = useState(route_segments);
  const [selectedRow, setSelectedRow] = useState(null);
  const { value: isAddModalOpen, setTrue: openAddModal, setFalse: closeAddModal } = useBoolean();
  const { value: isUpdateModalOpen, setTrue: openUpdateModal, setFalse: closeUpdateModal } = useBoolean();

  const mutation = useSaveRouteSegments({
    mutationConfig: {
      onSuccess: (savedTrain) => {
        setDataSource(savedTrain.route_segments);
        queryClient.setQueryData(trainQuery(trainId).queryKey, savedTrain);
        closeAddModal();
        closeUpdateModal();
        message.success('Đã lưu thay đổi!');
      },
      onError: (error) => {
        message.error(error?.response?.data?.detail || 'Chưa lưu được thay đổi. Vui lòng thử lại.');
      },
    },
  });

  const saveItems = (items) => {
    if (mutation.isPending) return;
    const data = items.map((item) => ({
      station_id: item.station.id,
      distance: item.distance,
      day_number: item.day_number,
      arrival_time: dayjs(item.arrival_time, 'HH:mm').format('HH:mm:ss'),
      departure_time: dayjs(item.departure_time, 'HH:mm').format('HH:mm:ss'),
    }));

    mutation.mutate({ id, segments: data });
  };

  const handleDeleteItem = (index) => {
    saveItems(dataSource.filter((_, i) => i !== index));
  };

  const handleAddItem = (values) => {
    saveItems([...dataSource, values]);
  };

  const handleUpdateItem = (values) => {
    if (!selectedRow) return;
    saveItems(dataSource.map((item) => (item.station.id === selectedRow.station.id ? values : item)));
  };

  const pageHeaderLinks = useMemo(
    () => [
      { title: 'Trang chủ', href: '/admin' },
      { title: 'Khách hàng', href: '/admin/customers' },
      { title: 'Thú cưng' },
    ],
    [],
  );

  const items = [
    {
      key: '1',
      label: 'Id',
      children: id,
    },
    {
      key: '2',
      label: 'Tên tàu',
      children: name,
    },
    {
      key: '3',
      label: 'Tuyến',
      children: route?.name,
    },
    {
      key: '4',
      label: 'Giờ đi',
      children: dataSource[0]?.departure_time ?? 'Chưa cập nhật',
    },
    {
      key: '5',
      label: 'Giờ đến',
      children: dataSource[dataSource.length - 1]?.arrival_time ?? 'Chưa cập nhật',
    },
    {
      key: '6',
      label: 'Thời gian hành trình',
      children: calculateTravelTime(dataSource[0], dataSource[dataSource.length - 1]),
    },
  ];

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-4">
        <PageHeader heading="Quản lý thú cưng" links={pageHeaderLinks} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} disabled={mutation.isPending}>
          Thêm mới
        </Button>
      </Flex>

      <Card title="Thông tin tàu" className="mb-3">
        <Descriptions items={items} />
      </Card>

      <RouteSegmentsTable
        dataSource={dataSource}
        openUpdateModal={openUpdateModal}
        handleDelete={handleDeleteItem}
        setSelectedRow={setSelectedRow}
        isPending={mutation.isPending}
      />
      <AddStopPointModal
        open={isAddModalOpen}
        closeModal={closeAddModal}
        handleAddItem={handleAddItem}
        dataSource={dataSource}
        isPending={mutation.isPending}
      />
      <UpdateStopPointModal
        open={isUpdateModalOpen}
        closeModal={closeUpdateModal}
        handleUpdateItem={handleUpdateItem}
        selectedRow={selectedRow}
        dataSource={dataSource}
        isPending={mutation.isPending}
      />
    </>
  );
};

export default RouteSegments;
