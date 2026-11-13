import dayjs from 'dayjs';

export const DEMO_CREDENTIALS = { email: 'admin@example.com', password: 'Admin123!' };
export const DEMO_TOKEN = 'railway-admin-local-preview';
export const STORAGE_KEY = 'railway-admin-preview-data-v1';

export function createSampleData() {
  const seatTypes = [
    {
      id: 1,
      name: 'Ngồi mềm điều hòa',
      code: 'NMDH',
      description: 'Ghế ngồi mềm, toa có điều hòa',
      original_price_per_km: 650,
      active: true,
    },
    {
      id: 2,
      name: 'Nằm mềm điều hòa',
      code: 'NMemDH',
      description: 'Giường nằm mềm, khoang điều hòa',
      original_price_per_km: 1100,
      active: true,
    },
    {
      id: 3,
      name: 'Ngồi cứng',
      code: 'NC',
      description: 'Ghế ngồi phổ thông',
      original_price_per_km: 450,
      active: true,
    },
    {
      id: 4,
      name: 'Nằm cứng điều hòa',
      code: 'NCDH',
      description: 'Giường nằm khoang 6 chỗ',
      original_price_per_km: 850,
      active: false,
    },
  ];
  const layouts = ['Toa ngồi mềm điều hòa', 'Toa nằm mềm điều hòa', 'Toa ngồi cứng phổ thông'].map((name, index) => ({
    id: index + 1,
    name,
    floors: index === 1 ? 2 : 1,
    row_count: index === 1 ? 1 : 4,
    active: true,
    seats: Array.from({ length: index === 1 ? 12 : 24 }, (_, i) => ({
      id: index * 100 + i + 1,
      position: i + 1,
      seatType: seatTypes[index],
    })),
  }));
  const stations = [
    { id: 1, name: 'Hà Nội' },
    { id: 2, name: 'Vinh' },
    { id: 3, name: 'Đà Nẵng' },
    { id: 4, name: 'Nha Trang' },
    { id: 5, name: 'Sài Gòn' },
  ];
  const routes = [
    { id: 1, name: 'Hà Nội - Sài Gòn' },
    { id: 2, name: 'Hà Nội - Đà Nẵng' },
    { id: 3, name: 'Sài Gòn - Nha Trang' },
  ];
  const trains = ['SE1', 'SE2', 'SE3', 'SE4'].map((name, index) => ({
    id: index + 1,
    name,
    is_active: true,
    route: routes[index % routes.length],
    carriages: [0, 1].map((n) => ({ id: index * 10 + n + 1, position: n + 1, carriageLayout: layouts[n] })),
    seatPrices: seatTypes.map((seatType) => ({ seatType, original_price_per_km: seatType.original_price_per_km })),
    route_segments: stations.map((station, n) => ({
      id: index * 10 + n + 1,
      station,
      distance: [0, 319, 791, 1315, 1726][n],
      day_number: n >= 3 ? 1 : 0,
      arrival_time: ['06:00:00', '11:40:00', '21:30:00', '06:10:00', '14:30:00'][n],
      departure_time: ['06:10:00', '11:50:00', '21:45:00', '06:20:00', '14:40:00'][n],
    })),
  }));
  const names = [
    'Nguyễn Minh Anh',
    'Trần Quốc Huy',
    'Lê Thu Hà',
    'Phạm Hoàng Nam',
    'Võ Ngọc Linh',
    'Đặng Tuấn Kiệt',
    'Bùi Thanh Mai',
    'Đỗ Gia Bảo',
    'Hồ Phương Thảo',
    'Ngô Đức Minh',
    'Dương Khánh Vy',
    'Lý Bảo Ngọc',
  ];
  const users = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    email: i === 0 ? DEMO_CREDENTIALS.email : `user${i + 1}@example.com`,
    phone: `090${String(1234567 + i)}`,
    address: `${i + 10} Nguyễn Huệ, TP. Hồ Chí Minh`,
    userRole: i < 5 ? 'ADMIN' : 'USER',
    gender: i % 2 ? 'FEMALE' : 'MALE',
    is_deleted: i === 4,
    is_verified: true,
  }));
  const personTypes = [
    {
      id: 1,
      name: 'Người Việt Nam',
      description: 'Hành khách trong nước',
      percentage: 0,
      children: [
        {
          id: 11,
          name: 'Người lớn',
          description: 'Áp dụng giá vé thông thường',
          percentage: 0,
          parent: { name: 'Người Việt Nam' },
        },
        {
          id: 12,
          name: 'Trẻ em',
          description: 'Ưu đãi dành cho trẻ em',
          percentage: 25,
          parent: { name: 'Người Việt Nam' },
        },
        {
          id: 13,
          name: 'Sinh viên',
          description: 'Ưu đãi dành cho học sinh, sinh viên',
          percentage: 10,
          parent: { name: 'Người Việt Nam' },
        },
      ],
    },
    {
      id: 2,
      name: 'Người nước ngoài',
      description: 'Hành khách quốc tế',
      percentage: 0,
      children: [
        {
          id: 21,
          name: 'Người lớn',
          description: 'Áp dụng giá vé thông thường',
          percentage: 0,
          parent: { name: 'Người nước ngoài' },
        },
      ],
    },
  ];
  const passengers = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    code: `VE${String(i + 1).padStart(6, '0')}`,
    fullName: names[i % names.length],
    identity: `079${String(123456789 + i)}`,
    object: personTypes[0].children[i % 3],
    departureStation: 'Hà Nội',
    arrivalStation: 'Sài Gòn',
    departureTime:
      dayjs()
        .subtract(i % 7, 'day')
        .format('YYYY-MM-DD') + ' 06:10:00',
    arrivalTime:
      dayjs()
        .subtract(i % 7, 'day')
        .add(1, 'day')
        .format('YYYY-MM-DD') + ' 14:30:00',
    trainId: (i % trains.length) + 1,
    trainName: trains[i % trains.length].name,
    seatType: seatTypes[i % 2].name,
    carriageType: '1 - Ngồi mềm',
    carriageId: 1,
    personTypeId: personTypes[0].children[i % 3].id,
    originalPrice: 780000,
    price: 780000 - (i % 3) * 50000,
    schedule: { train: { name: trains[i % trains.length].name } },
  }));
  const orders = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    fullName: names[i % names.length],
    email: `customer${i + 1}@example.com`,
    phoneNumber: `091${String(2345678 + i)}`,
    identity: `079${String(234567890 + i)}`,
    paymentMethod: i % 2 ? 'PAYPAL' : 'VNPAY',
    status: i % 5 ? 'COMPLETED' : 'PENDING',
    totalPrice: passengers[i].price + passengers[(i + 1) % passengers.length].price,
    createdAt: dayjs()
      .subtract(i, 'day')
      .hour(9 + (i % 8))
      .format('YYYY-MM-DDTHH:mm:ss'),
    tickets: [passengers[i], passengers[(i + 1) % passengers.length]],
  }));
  const schedules = Array.from({ length: 45 }, (_, i) =>
    trains.slice(0, (i % 3) + 1).map((train, n) => ({
      id: i * 10 + n + 1,
      date: dayjs()
        .startOf('month')
        .add(i - 5, 'day')
        .format('YYYY-MM-DD'),
      train,
    })),
  ).flat();
  return { seatTypes, layouts, stations, routes, trains, users, personTypes, passengers, orders, schedules };
}

export function loadSampleData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.trains && saved?.schedules && saved?.users) return saved;
  } catch {
    /* Initialize the isolated preview with fresh sample data. */
  }
  const data = createSampleData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}
