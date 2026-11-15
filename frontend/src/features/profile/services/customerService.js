import { currentUser } from '../mocks/customerRepository.js';
import { copyMockData, mockRequest } from '../../../shared/api/mockRequest.js';
export const customerService = {
  async getCurrentCustomer() { return mockRequest(copyMockData(currentUser()), 120); },
};
