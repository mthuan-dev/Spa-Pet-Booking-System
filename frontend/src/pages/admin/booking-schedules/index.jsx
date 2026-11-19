import { Alert, Button, Calendar, Flex, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BookingScheduleModal from '~/features/admin/booking-schedules/components/BookingScheduleModal.jsx';
import dayjs from 'dayjs';
import PageHeader from '~/components/ui/page-header.jsx';
import { countBookingsByDate, getBookingSchedules } from '~/features/admin/booking-schedules/utils/bookingSchedules.js';

const BookingSchedulesPage = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dayjs());

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-booking-schedules'],
    queryFn: getBookingSchedules,
  });
  const bookingCounts = useMemo(() => countBookingsByDate(bookings), [bookings]);

  return (
    <>
      <Flex align="center" justify="space-between">
        <PageHeader
          heading="Quản lý lịch hẹn"
          links={[{ title: 'Trang chủ', href: '/admin' }, { title: 'Lịch hẹn' }]}
        />
      </Flex>
      {isError && (
        <Alert
          className="mt-3"
          type="error"
          title="Chưa tải được lịch hẹn."
          action={<Button size="small" onClick={() => refetch()}>Thử lại</Button>}
        />
      )}
      <Calendar
        value={date}
        mode="month"
        cellRender={(date, info) => {
          if (info.type === 'date') {
            const count = bookingCounts.get(date.format('YYYY-MM-DD')) ?? 0;
            return (
              <Flex align="flex-end" vertical>
                <Tag color={count >= 10 ? 'gold' : 'cyan'} variant="solid">{isError ? '—' : count} lịch hẹn</Tag>
              </Flex>
            );
          }
        }}
        onSelect={(date, info) => {
          setDate(date);
          if (!(info.source === 'month' || info.source === 'year')) {
            refetch();
            setOpen(true);
          }
        }}
        className="mt-3 [&_.ant-picker-calendar-mode-switch]:hidden"
      />
      <BookingScheduleModal
        key={date.format('YYYY-MM-DD')}
        date={date}
        open={open}
        onCancel={() => setOpen(false)}
        bookings={bookings}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </>
  );
};

export default BookingSchedulesPage;
