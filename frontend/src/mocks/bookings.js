import { mockUsers, mockPets, mockBookingDetails, mockPayments, mockReviews } from './data.js';


export function bookingBundle(row) {
  const { matkhau, ...employee } = mockUsers.find((user) => user.manguoidung === row.manhanvien);
  return {
    datlich: row, thucung: mockPets.find((pet) => pet.mathucung === row.mathucung), nhanvien: employee,
    chitietdatlich: mockBookingDetails.filter((detail) => detail.madatlich === row.madatlich),
    thanhtoan: mockPayments.filter((payment) => payment.madatlich === row.madatlich),
    danhgia: mockReviews.find((review) => review.madatlich === row.madatlich) || null,
  };
}


