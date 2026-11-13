import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { DEMO_CREDENTIALS, DEMO_TOKEN, STORAGE_KEY, loadSampleData } from './data.js';
import { currentUser } from '../features/profile/mocks/customerRepository.js';

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();
const nextId = (items) => Math.max(0, ...items.map((item) => item.id)) + 1;
const search = (items, keyword) => items.filter((item) => normalize(JSON.stringify(item)).includes(normalize(keyword)));
const inRange = (date, start, end) =>
  (!start || date.slice(0, 10) >= start.slice(0, 10)) && (!end || date.slice(0, 10) <= end.slice(0, 10));

function paginate(items, params = {}, spring = false) {
  const size = Math.max(1, Number(params.size) || 10);
  const page = Math.max(1, Number(params.page) || 1);
  const rows = items.slice((page - 1) * size, page * size);
  if (spring)
    return {
      content: rows,
      size,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size),
      number: page - 1,
    };
  return {
    items: rows,
    meta: {
      current_page: page,
      per_page: size,
      total_elements: items.length,
      total_pages: Math.ceil(items.length / size),
    },
  };
}

function handle(config) {
  const db = loadSampleData();
  const method = (config.method || 'get').toLowerCase();
  const path = config.url.replace(/^\/api/, '').replace(/\/$/, '');
  const params = config.params || {};
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  const fail = (detail, status = 400) => {
    throw new AxiosError(detail, 'ERR_BAD_REQUEST', config, null, {
      status,
      statusText: detail,
      data: { detail },
      headers: {},
      config,
    });
  };
  const save = (result) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return result;
  };
  const find = (items, id) => items.find((item) => item.id === Number(id)) || fail('Không tìm thấy dữ liệu', 404);

  if (path === '/auth/login' && method === 'post') {
    if (body.email !== DEMO_CREDENTIALS.email || body.password !== DEMO_CREDENTIALS.password)
      fail('Tài khoản mẫu: admin@example.com / Admin123!', 401);
    return { user: db.users[0], token: DEMO_TOKEN, refreshToken: DEMO_TOKEN };
  }
  const sessionUser = currentUser();
  if (sessionUser?.role !== 'ADMIN') fail('Vui lòng đăng nhập tài khoản quản trị', 401);
  if (path === '/auth/me') return { ...sessionUser, userRole: sessionUser.role };
  if (path === '/auth/refresh') return { token: DEMO_TOKEN, refreshToken: DEMO_TOKEN };
  if (path === '/public/stations') return db.stations;
  if (path === '/public/person-types') return db.personTypes;
  if (path === '/ad/routes') return db.routes;

  if (path === '/ad/users') {
    if (method === 'post') {
      const user = { ...body, id: nextId(db.users), is_deleted: false, is_verified: true };
      db.users.push(user);
      return save(user);
    }
    return paginate(
      search(
        db.users.filter((user) => !params.role || user.userRole === params.role),
        params.keyword,
      ),
      params,
      true,
    );
  }
  const userMatch = path.match(/^\/ad\/users\/(\d+)$/);
  if (userMatch) {
    const user = find(db.users, userMatch[1]);
    if (method === 'put') {
      Object.assign(user, body, { id: user.id });
      return save(user);
    }
    if (method === 'delete') {
      user.is_deleted = !user.is_deleted;
      return save(user);
    }
    return user;
  }
  if (path === '/ad/seat-types/all') return db.seatTypes;
  if (path === '/ad/seat-types') {
    if (method === 'post') {
      if (!body.name?.trim() || !body.code?.trim()) fail('Vui lòng nhập tên và mã loại ghế');
      const item = {
        ...body,
        id: nextId(db.seatTypes),
        original_price_per_km: Number(body.original_price_per_km),
        active: true,
      };
      db.seatTypes.push(item);
      return save(item);
    }
    return paginate(search(db.seatTypes, params.keyword), params);
  }
  const layoutMatch = path.match(/^\/ad\/carriage-layouts(?:\/(\d+))?$/);
  if (layoutMatch) {
    if (method === 'get')
      return layoutMatch[1] ? find(db.layouts, layoutMatch[1]) : paginate(search(db.layouts, params.keyword), params);
    const item = layoutMatch[1] ? find(db.layouts, layoutMatch[1]) : { id: nextId(db.layouts), active: true };
    Object.assign(item, {
      name: body.name,
      floors: Number(body.floors),
      row_count: Number(body.row_count),
      seats: (body.layout || []).map((id, i) => ({
        id: item.id * 100 + i + 1,
        position: i + 1,
        seatType: find(db.seatTypes, id),
      })),
    });
    if (!layoutMatch[1]) db.layouts.push(item);
    return save(item);
  }

  const filteredOrders = () => db.orders.filter((order) => inRange(order.createdAt, params.startDate, params.endDate));
  if (path === '/ad/orders/report') {
    const start = dayjs(params.startDate || dayjs().startOf('week'));
    const days = Math.min(366, Math.max(1, dayjs(params.endDate || dayjs()).diff(start, 'day') + 1));
    return Array.from({ length: days }, (_, i) => {
      const date = start.add(i, 'day').format('YYYY-MM-DD');
      const orders = db.orders.filter((order) => order.createdAt.startsWith(date) && order.status === 'COMPLETED');
      return {
        date,
        totalPrice: orders.reduce((sum, order) => sum + order.totalPrice, 0),
        totalTickets: orders.reduce((sum, order) => sum + order.tickets.length, 0),
      };
    });
  }
  if (path === '/ad/orders/report/user') {
    const orders = filteredOrders();
    return {
      guestUser: orders.filter((item) => item.id % 3 === 0).length,
      internalUser: orders.filter((item) => item.id % 3 !== 0).length,
    };
  }
  if (path === '/ad/trains/report')
    return db.trains.map((train) => {
      const tickets = filteredOrders()
        .flatMap((order) => order.tickets)
        .filter((ticket) => ticket.trainId === train.id);
      return {
        train: train.name,
        totalTickets: tickets.length,
        totalPrice: tickets.reduce((sum, ticket) => sum + ticket.price, 0),
      };
    });
  if (path === '/ad/orders')
    return paginate(
      search(
        filteredOrders().filter(
          (order) =>
            (!params.paymentMethod || order.paymentMethod === params.paymentMethod) &&
            (!params.status || order.status === params.status),
        ),
        params.keyword,
      ),
      params,
    );
  if (path === '/ad/trains/search') return paginate(search(db.trains, params.keyword), params);

  const segmentMatch = path.match(/^\/ad\/trains\/(\d+)\/route-segments$/);
  if (segmentMatch) {
    const train = find(db.trains, segmentMatch[1]);
    if (method === 'post') {
      train.route_segments = body.map((segment, i) => ({
        ...segment,
        id: i + 1,
        station: find(db.stations, segment.station_id),
      }));
      return save(train);
    }
    return train;
  }
  const carriageMatch = path.match(/^\/ad\/trains\/(\d+)\/carriages$/);
  if (carriageMatch)
    return find(db.trains, carriageMatch[1]).carriages.map((item) => ({
      ...item,
      carriageLayoutName: item.carriageLayout.name,
    }));
  const trainMatch = path.match(/^\/ad\/trains(?:\/(\d+))?$/);
  if (trainMatch) {
    if (method === 'get') return trainMatch[1] ? find(db.trains, trainMatch[1]) : db.trains;
    const train = trainMatch[1]
      ? find(db.trains, trainMatch[1])
      : { id: nextId(db.trains), is_active: true, route_segments: [] };
    Object.assign(train, {
      name: body.name,
      route: body.routeId ? find(db.routes, body.routeId) : train.route || db.routes[0],
      carriages: (body.carriagesList || []).map((id, i) => ({
        id: train.id * 100 + i + 1,
        position: i + 1,
        carriageLayout: find(db.layouts, id),
      })),
      seatPrices: (body.seatPricesList || []).map((item) => ({
        seatType: find(db.seatTypes, item.seat_type_id),
        original_price_per_km: Number(item.price),
      })),
    });
    if (!trainMatch[1]) db.trains.push(train);
    return save(train);
  }
  if (path === '/public/schedules/count') {
    const dates = [
      ...new Set(db.schedules.filter((item) => inRange(item.date, params.start, params.end)).map((item) => item.date)),
    ];
    return dates.map((date) => ({ date, count: db.schedules.filter((item) => item.date === date).length }));
  }
  const dateMatch = path.match(/^\/public\/schedules\/(\d{4}-\d{2}-\d{2})$/);
  if (dateMatch) return db.schedules.filter((item) => item.date === dateMatch[1]);
  const addSchedule = (date, trainIds) => {
    for (const id of trainIds) {
      if (!db.schedules.some((item) => item.date === date && item.train.id === Number(id)))
        db.schedules.push({ id: nextId(db.schedules), date, train: find(db.trains, id) });
    }
  };
  if (path === '/ad/schedules' && method === 'post') {
    addSchedule(body.date, body.trains || []);
    return save({ message: 'Đã thêm lịch trình mẫu' });
  }
  const scheduleMatch = path.match(/^\/ad\/schedules\/(\d+)$/);
  if (scheduleMatch && method === 'delete') {
    find(db.schedules, scheduleMatch[1]);
    db.schedules = db.schedules.filter((item) => item.id !== Number(scheduleMatch[1]));
    return save({ message: 'Đã xóa lịch trình mẫu' });
  }
  if (path === '/ad/tickets/search')
    return paginate(
      search(
        db.passengers.filter(
          (item) =>
            (!params.trainId || item.trainId === Number(params.trainId)) &&
            (!params.personTypeId || item.personTypeId === Number(params.personTypeId)) &&
            (!params.carriageId || item.carriageId === Number(params.carriageId)) &&
            (!params.departureTime || item.departureTime.startsWith(params.departureTime)) &&
            (!params.departureStation || item.departureStation === params.departureStation) &&
            (!params.arrivalStation || item.arrivalStation === params.arrivalStation),
        ),
        params.keyword,
      ),
      params,
    );
  fail(`Chưa có dữ liệu mẫu cho ${method.toUpperCase()} ${path}`, 404);
}

export async function mockAdapter(config) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { data: structuredClone(handle(config)), status: 200, statusText: 'OK', headers: {}, config };
}
