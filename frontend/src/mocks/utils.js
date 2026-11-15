import dayjs from 'dayjs';

export const mockTimestamp = (value = new Date()) => dayjs(value).format('YYYY-MM-DDTHH:mm:ss');
export const nextMockId = (items, key) => Math.max(0, ...items.map((item) => item[key])) + 1;
