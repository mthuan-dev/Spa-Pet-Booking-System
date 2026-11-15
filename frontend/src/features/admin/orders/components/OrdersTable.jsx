import { Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { convertToVnCurrency } from '~/utils/convert.js';
import { useOrders } from '../api/get-orders.js';

const expandColumns = [
  { title: 'Mã dịch vụ', dataIndex: 'serviceId', key: 'serviceId' },
  { title: 'Dịch vụ', key: 'service', render: (item) => <div><p>{item.name}</p><p>{item.durationMinutes} phút</p></div> },
  { title: 'Thú cưng', key: 'pet', render: ({ pet }) => <div><p>{pet.name}</p><p>{pet.species} · {pet.weight} kg</p></div> },
  { title: 'Lịch hẹn', key: 'appointment', render: ({ appointment, employee }) => <div><p>{dayjs(appointment.date).format('DD/MM/YYYY')} · {appointment.startTime}–{appointment.endTime}</p><p>Nhân viên: {employee.name}</p></div> },
  { title: 'Giá', dataIndex: 'price', key: 'price', render: (value) => <strong className="text-red-500">{convertToVnCurrency(value)}</strong> },
];
const columns = [
  { title: 'Mã đặt lịch', dataIndex: 'code', key: 'code' },
  { title: 'Khách hàng', key: 'contact', render: ({ contact }) => <div><p>Họ tên: {contact.name}</p><p>Email: {contact.email}</p><p>SĐT: {contact.phone}</p></div> },
  { title: 'Thanh toán', key: 'payment', render: ({ payment }) => <Tag color={payment.method === 'VNPAY' ? 'purple' : 'green'}>{payment.method === 'CASH' ? 'Tiền mặt' : payment.method}</Tag> },
  { title: 'Tổng giá', dataIndex: 'totalPrice', key: 'totalPrice', render: (value) => <strong className="text-red-500">{convertToVnCurrency(value)}</strong> },
  { title: 'Trạng thái', dataIndex: 'bookingStatus', key: 'bookingStatus', render: (value) => <Tag color={{ PENDING: 'blue', CONFIRMED: 'purple', COMPLETED: 'green', CANCELLED: 'red' }[value]}>{value}</Tag> },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (value) => dayjs(value).format('HH:mm:ss DD/MM/YYYY') },
];
export default function OrdersTable({ filters }) {
  const { data, isLoading } = useOrders({
    startDate: filters?.dateRange?.startDate, endDate: filters?.dateRange?.endDate, keyword: filters?.keyword || '',
    paymentMethod: filters?.paymentMethod, status: filters?.status, page: 1, size: 10,
  });
  return <Table rowKey="id" columns={columns} dataSource={data?.items} loading={isLoading} size="medium" expandable={{
    expandedRowRender: (booking) => <Table rowKey="bookingDetailId" columns={expandColumns} dataSource={booking.services.map((service) => ({
      ...service, pet: booking.pet, appointment: booking.appointment, employee: booking.employee,
    }))} pagination={false} size="small" />,
  }} />;
}
