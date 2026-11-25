import { bookingApi } from '../../../api/bookingApi.js'
import { mapUserRow } from '../mappers/customerMapper.js'
export const customerService = {
  async getCurrentCustomer() { return mapUserRow(await bookingApi('/customer')) },
}
