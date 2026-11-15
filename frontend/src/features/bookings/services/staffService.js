import { availableStaffRows } from '../../../mocks/bookings.js';
import { mockRequest } from '../../../shared/api/mockRequest.js';
export const staffService = {
  async getAvailableStaff(request) {
    return mockRequest(availableStaffRows(request).map((row) => ({
      id: row.manguoidung, name: row.hoten, role: 'Nhân viên spa', specialties: [], avatarTone: 'honey',
    })), 150);
  },
};
