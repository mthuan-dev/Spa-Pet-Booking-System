import dayjs from 'dayjs';
import { MOCK_STAFF } from '../../../bookings/mocks/staff.js';

// Preview data for the admin calendar, kept separate from customer booking history.
const SAMPLE_APPOINTMENTS = [
  {
    contact: { name: 'Nguyễn Minh Anh', phone: '0901000001', email: 'minhanh@example.com' },
    pet: { id: 201, name: 'Bông', type: 'DOG', breed: 'Poodle', weight: 4.5 },
    service: { serviceId: 1, name: 'Tắm thơm & sấy lông', price: 120000, durationMinutes: 60 },
    startTime: '08:00', endTime: '09:00', employeeId: 1, status: 'COMPLETED',
  },
  {
    contact: { name: 'Trần Quốc Huy', phone: '0901000002', email: 'quochuy@example.com' },
    pet: { id: 202, name: 'Milo', type: 'DOG', breed: 'Corgi', weight: 9.2 },
    service: { serviceId: 2, name: 'Cắt tỉa tạo kiểu', price: 230000, durationMinutes: 90 },
    startTime: '09:00', endTime: '10:30', employeeId: 2, status: 'CONFIRMED',
  },
  {
    contact: { name: 'Lê Thu Hà', phone: '0901000003', email: 'thuha@example.com' },
    pet: { id: 203, name: 'Miu', type: 'CAT', breed: 'Mèo Anh lông ngắn', weight: 4.1 },
    service: { serviceId: 1, name: 'Tắm thơm & sấy lông', price: 120000, durationMinutes: 60 },
    startTime: '10:00', endTime: '11:00', employeeId: 3, status: 'PENDING',
  },
  {
    contact: { name: 'Phạm Hoàng Nam', phone: '0901000004', email: 'hoangnam@example.com' },
    pet: { id: 204, name: 'Lucky', type: 'DOG', breed: 'Golden Retriever', weight: 22 },
    service: { serviceId: 4, name: 'Gói chăm sóc trọn buổi', price: 590000, durationMinutes: 150 },
    startTime: '13:00', endTime: '15:30', employeeId: 2, status: 'CONFIRMED',
  },
  {
    contact: { name: 'Võ Ngọc Linh', phone: '0901000005', email: 'ngoclinh@example.com' },
    pet: { id: 205, name: 'Kem', type: 'CAT', breed: 'Mèo Ba Tư', weight: 5.6 },
    service: { serviceId: 3, name: 'Chải lông & gỡ rối', price: 100000, durationMinutes: 30 },
    startTime: '14:00', endTime: '14:30', employeeId: 1, status: 'CANCELLED',
  },
  {
    contact: { name: 'Đặng Tuấn Kiệt', phone: '0901000006', email: 'tuankiet@example.com' },
    pet: { id: 206, name: 'Đậu', type: 'DOG', breed: 'Shiba', weight: 8.3 },
    service: { serviceId: 1, name: 'Tắm thơm & sấy lông', price: 150000, durationMinutes: 60 },
    startTime: '16:00', endTime: '17:00', employeeId: 3, status: 'PENDING',
  },
];

export function createSampleBookingSchedules(referenceDate = dayjs()) {
  const today = dayjs(referenceDate).startOf('day');

  return [-2, -1, 0, 1, 2, 3, 5].flatMap((offset) => {
    const date = today.add(offset, 'day').format('YYYY-MM-DD');
    const dateCode = date.replace(/-/g, '');

    return SAMPLE_APPOINTMENTS.map((sample, index) => {
      const id = Number(dateCode) * 10 + index + 1;
      const employee = MOCK_STAFF.find((member) => member.id === sample.employeeId);
      let status = sample.status;
      if (status !== 'CANCELLED') {
        if (offset < 0) status = 'COMPLETED';
        else if (offset > 0 && status === 'COMPLETED') status = 'CONFIRMED';
      }

      return {
        id,
        code: `MEO-${dateCode.slice(2)}-${index + 101}`,
        userId: index + 201,
        contact: { ...sample.contact },
        pet: { ...sample.pet },
        employee: { id: employee.id, name: employee.name },
        appointment: { date, startTime: sample.startTime, endTime: sample.endTime },
        services: [{ ...sample.service, bookingDetailId: id * 10 }],
        bookingStatus: status,
        paymentStatus: status === 'COMPLETED' ? 'PAID' : 'UNPAID',
        payment: { method: 'CASH', amount: sample.service.price },
        totalPrice: sample.service.price,
        note: '',
      };
    });
  });
}
