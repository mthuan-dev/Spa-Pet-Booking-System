import { mockServices, mockServicePrices } from '../../../mocks/data.js';
import { mapServiceRow } from '../mappers/serviceMapper.js'
import { copyMockData, mockRequest } from '../../../shared/api/mockRequest.js'

export const serviceService = {
  async getAvailableServices() {
    return mockRequest(copyMockData(mockServices.filter((row) => row.trangthai === 1 && mockServicePrices.some((price) => price.madichvu === row.madichvu)).map((row) => mapServiceRow(row, mockServicePrices))))
  },
  async getServiceById(id) {
    const row = mockServices.find((service) => service.madichvu === Number(id) && service.trangthai === 1)
    return mockRequest(row ? copyMockData(mapServiceRow(row, mockServicePrices)) : null)
  },
}
