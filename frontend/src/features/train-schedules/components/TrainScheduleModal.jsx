import { Alert, App, Button, Col, Drawer, Dropdown, Empty, Flex, Form, Input, Row, Select, Table, Tag, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { filterBookingSchedules, SCHEDULE_BOOKING_STATUS, updateBookingScheduleStatus } from '../utils/bookingSchedules.js';

const EMPTY_FILTERS = { keyword: '', status: undefined, serviceId: undefined };
const STATUS_OPTIONS = Object.entries(SCHEDULE_BOOKING_STATUS).map(([value, status]) => ({ value, label: status.label }));
const STATUS_ACTIONS = [
  { key: 'COMPLETED', label: 'COMPLETED' },
  { key: 'CANCELLED', label: 'CANCELLED', danger: true },
];

const bookingColumns = [
  {
    title: 'Giờ hẹn',
    key: 'appointment',
    width: 115,
    render: (_, booking) => [booking.appointment.startTime.slice(0, 5), booking.appointment.endTime.slice(0, 5)].join(' – '),
  },
  {
    title: 'Khách & thú cưng',
    key: 'contact',
    width: 200,
    render: (_, booking) => (
      <Flex vertical>
        <span>{booking.contact.name}</span>
        <Typography.Text type="secondary">Thú cưng: {booking.pet.name}</Typography.Text>
      </Flex>
    ),
  },
  {
    title: 'Dịch vụ',
    key: 'services',
    width: 180,
    render: (_, booking) => booking.services.map((service) => (
      <div key={service.bookingDetailId ?? service.serviceId}>{service.name}</div>
    )),
  },
];

const TrainScheduleModal = ({ date, open, onCancel, bookings = [], isLoading, isError, onRetry }) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const updateStatus = useMutation({
    mutationFn: updateBookingScheduleStatus,
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(['admin-booking-schedules'], (current) => current?.map(
        (booking) => booking.id === updatedBooking.id ? updatedBooking : booking,
      ));
      message.success('Đã đổi trạng thái đặt lịch thành ' + updatedBooking.bookingStatus + '.');
    },
    onError: (error) => message.error(error.message),
  });
  const columns = [
    ...bookingColumns,
    {
      title: 'Trạng thái đặt lịch',
      dataIndex: 'bookingStatus',
      key: 'status',
      width: 140,
      render: (value, booking) => {
        if (value !== 'CONFIRMED') {
          return <Tag color={SCHEDULE_BOOKING_STATUS[value]?.color} style={{ fontSize: 12 }}>{value}</Tag>;
        }
        return (
          <Dropdown
            trigger={['click']}
            disabled={updateStatus.isPending}
            menu={{
              items: STATUS_ACTIONS,
              onClick: ({ key }) => updateStatus.mutate({ id: booking.id, status: key }),
            }}
          >
            <Button
              size="small"
              color={SCHEDULE_BOOKING_STATUS.CONFIRMED.color}
              variant="filled"
              style={{ fontSize: 12 }}
              disabled={updateStatus.isPending}
              loading={updateStatus.isPending && updateStatus.variables?.id === booking.id}
              aria-label={'Đổi trạng thái đặt lịch ' + booking.code}
            >
              CONFIRMED <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];
  const dateKey = date?.format('YYYY-MM-DD');
  const dayBookings = useMemo(() => filterBookingSchedules(bookings, { date: dateKey }), [bookings, dateKey]);
  const filteredBookings = useMemo(
    () => filterBookingSchedules(dayBookings, { date: dateKey, ...filters }),
    [dayBookings, dateKey, filters],
  );
  const serviceOptions = useMemo(() => Array.from(new Map(
    dayBookings.flatMap((booking) => booking.services.map((service) => [service.serviceId, { value: service.serviceId, label: service.name }])),
  ).values()), [dayBookings]);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  return (
    <Drawer
      title={'Lịch hẹn ngày ' + date?.format('DD/MM/YYYY')}
      open={open}
      onClose={onCancel}
      size="large"
    >
      {isError ? (
        <Alert
          type="error"
          title="Chưa tải được lịch hẹn trong ngày."
          action={<Button size="small" onClick={onRetry}>Thử lại</Button>}
        />
      ) : (
        <>
          <Form layout="vertical">
            <Form.Item label="Tìm lịch hẹn" htmlFor="day-booking-search">
              <Input
                id="day-booking-search"
                placeholder="Mã lịch, khách hàng, số điện thoại, thú cưng"
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
                allowClear
              />
            </Form.Item>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item label="Trạng thái đặt lịch" htmlFor="day-booking-status">
                  <Select
                    id="day-booking-status"
                    placeholder="Tất cả trạng thái"
                    options={STATUS_OPTIONS}
                    value={filters.status}
                    onChange={(value) => updateFilter('status', value)}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Dịch vụ" htmlFor="day-booking-service">
                  <Select
                    id="day-booking-service"
                    placeholder="Tất cả dịch vụ"
                    options={serviceOptions}
                    value={filters.serviceId}
                    onChange={(value) => updateFilter('serviceId', value)}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Flex align="center" justify="space-between" gap={12} className="mb-3">
            <Typography.Text aria-live="polite">Hiển thị {filteredBookings.length} / {dayBookings.length} lịch hẹn trong ngày</Typography.Text>
            <Button onClick={() => setFilters(EMPTY_FILTERS)}>Xóa bộ lọc</Button>
          </Flex>
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={filteredBookings}
            loading={isLoading}
            scroll={{ x: 635 }}
            pagination={{ pageSize: 8, hideOnSinglePage: true, showSizeChanger: false }}
            locale={{ emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={dayBookings.length ? 'Không có lịch hẹn phù hợp với bộ lọc.' : 'Chưa có lịch hẹn đã xác nhận trong ngày này.'}
              />
            ) }}
            bordered
          />
        </>
      )}
    </Drawer>
  );
};

export default TrainScheduleModal;
