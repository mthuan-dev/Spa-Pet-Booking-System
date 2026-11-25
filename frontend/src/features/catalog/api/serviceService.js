import { bookingApi } from '../../../api/bookingApi.js'
import { mapServiceRow } from '../mappers/serviceMapper.js'
export const serviceService = {
  async getAvailableServices() {
    const rows = await bookingApi('/services')
    return rows.filter(row => row.prices.length).map(row => mapServiceRow(row, row.prices))
  },
  async getServiceById(id) { return (await this.getAvailableServices()).find(row => row.id === Number(id)) || null },
}
