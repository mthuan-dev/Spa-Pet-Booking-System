import { resolveMockImage } from '../../../mocks/imageStore.js';

export function mapServiceRow(row, prices = []) {
  const servicePrices = prices.filter((price) => price.madichvu === row.madichvu)
    .sort((left, right) => left.cannangtu - right.cannangtu || left.cannangden - right.cannangden);
  const dogPrices = servicePrices.filter((price) => price.loaithucung === 'DOG');
  return {
    id: row.madichvu, name: row.ten, category: row.loaidichvu, durationMinutes: row.thoiluongphut,
    imageUrl: resolveMockImage(row.hinhanh), description: row.mota || '',
    prices: servicePrices,
    priceBands: (dogPrices.length ? dogPrices : servicePrices).map((price) => ({
      maxWeightKg: price.cannangden === 999.99 ? null : price.cannangden, priceVnd: price.gia,
    })),
  };
}
