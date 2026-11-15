import { mockServices, mockComboDetails, mockServicePrices } from '../data.js';
import { mockTimestamp } from '../utils.js';
const PET_TYPES = ['DOG', 'CAT', 'OTHER'];
export function loadServiceCatalog() {
  return { dichvu: mockServices, chitietcombo: mockComboDetails, giadichvu: mockServicePrices };
}

export function handleServiceCatalog({ path, method, body, fail }) {
  const catalog = loadServiceCatalog();
  const nextId = (items, key) => Math.max(0, ...items.map((item) => item[key])) + 1;
  const findService = (id) =>
    catalog.dichvu.find((service) => service.madichvu === Number(id)) || fail('Không tìm thấy dịch vụ.', 404);
  if (path === '/ad/services' && method === 'get') return catalog;

  const serviceMatch = path.match(/^\/ad\/services(?:\/(\d+))?$/);
  if (serviceMatch && ['post', 'put'].includes(method)) {
    if ((method === 'post') === Boolean(serviceMatch[1])) fail('Đường dẫn dịch vụ không hợp lệ.');
    const previous = serviceMatch[1] ? findService(serviceMatch[1]) : null;
    const values = { loaidichvu: 'SINGLE', trangthai: 1, ...previous, ...body };
    const ten = String(values.ten || '').trim();
    if (!ten || ten.length > 150) fail('Tên dịch vụ cần từ 1 đến 150 ký tự.');
    if (!['SINGLE', 'COMBO'].includes(values.loaidichvu)) fail('Loại dịch vụ không hợp lệ.');
    if (previous && previous.loaidichvu !== values.loaidichvu) fail('Không thể đổi loại dịch vụ.');
    const duration = Number(values.thoiluongphut);
    if (!Number.isInteger(duration) || duration <= 0 || duration > 2147483647)
      fail('Thời lượng phải là số phút nguyên lớn hơn 0.');
    if (![0, 1].includes(values.trangthai)) fail('Trạng thái dịch vụ không hợp lệ.');
    const hinhanh = String(values.hinhanh || '').trim();
    if (hinhanh.length > 255) fail('Đường dẫn ảnh tối đa 255 ký tự.');

    const madichvu = previous?.madichvu ?? nextId(catalog.dichvu, 'madichvu');
    let children = [];
    if (values.loaidichvu === 'COMBO') {
      if (body.chitietcombo !== undefined && !Array.isArray(body.chitietcombo)) fail('Danh sách dịch vụ thành phần không hợp lệ.');
      children = body.chitietcombo === undefined
        ? catalog.chitietcombo.filter((item) => item.macombo === madichvu).map((item) => item.madichvucon)
        : body.chitietcombo.map((item) => Number(item.madichvucon));
      if (!children.length) fail('Vui lòng chọn dịch vụ thành phần cho combo.');
      if (new Set(children).size !== children.length) fail('Dịch vụ thành phần bị trùng.');
      if (children.some((id) => findService(id).loaidichvu !== 'SINGLE'))
        fail('Dịch vụ thành phần phải là dịch vụ lẻ.');
    }
    const now = mockTimestamp();
    const service = {
      madichvu,
      ten,
      loaidichvu: values.loaidichvu,
      thoiluongphut: duration,
      hinhanh: hinhanh || null,
      mota: String(values.mota || '').trim() || null,
      trangthai: values.trangthai,
      ngaytao: previous?.ngaytao ?? now,
      ngaycapnhat: now,
    };
    if (previous) Object.assign(previous, service);
    else catalog.dichvu.push(service);
    mockComboDetails.splice(0, mockComboDetails.length, ...mockComboDetails.filter((item) => item.macombo !== madichvu));
    catalog.chitietcombo.push(...children.map((madichvucon) => ({ macombo: madichvu, madichvucon })));
    return service;
  }

  const priceMatch = path.match(/^\/ad\/service-prices(?:\/(\d+))?$/);
  if (priceMatch?.[1] && method === 'delete') {
    const index = catalog.giadichvu.findIndex((price) => price.magiadichvu === Number(priceMatch[1]));
    if (index < 0) fail('Không tìm thấy giá dịch vụ.', 404);
    const [price] = catalog.giadichvu.splice(index, 1);
    return price;
  }
  if (priceMatch && ['post', 'put'].includes(method)) {
    if ((method === 'post') === Boolean(priceMatch[1])) fail('Đường dẫn giá dịch vụ không hợp lệ.');
    const previous = priceMatch[1]
      ? catalog.giadichvu.find((price) => price.magiadichvu === Number(priceMatch[1]))
        || fail('Không tìm thấy giá dịch vụ.', 404)
      : null;
    const values = { ...previous, ...body };
    const service = findService(values.madichvu);
    if (!PET_TYPES.includes(values.loaithucung)) fail('Loại thú cưng không hợp lệ.');
    for (const field of ['cannangtu', 'cannangden', 'gia']) {
      if (values[field] === null || values[field] === '' || !Number.isFinite(Number(values[field])))
        fail('Vui lòng nhập đầy đủ cân nặng và giá tiền.');
    }
    const cannangtu = Number(Number(values.cannangtu).toFixed(2));
    const cannangden = Number(Number(values.cannangden).toFixed(2));
    const gia = Number(Number(values.gia).toFixed(2));
    if (cannangtu < 0 || cannangden > 999.99 || cannangden <= cannangtu)
      fail('Cân nặng đến phải lớn hơn cân nặng từ và tối đa 999,99 kg.');
    if (gia < 0 || gia > 9999999999.99) fail('Giá tiền không hợp lệ.');
    if (catalog.giadichvu.some((price) =>
      price.magiadichvu !== previous?.magiadichvu
      && price.madichvu === service.madichvu
      && price.loaithucung === values.loaithucung
      && cannangtu < price.cannangden && cannangden > price.cannangtu))
      fail('Khoảng cân nặng bị trùng với mức giá khác của dịch vụ và loại thú cưng này.', 409);
    const price = {
      magiadichvu: previous?.magiadichvu ?? nextId(catalog.giadichvu, 'magiadichvu'),
      madichvu: service.madichvu,
      loaithucung: values.loaithucung,
      cannangtu,
      cannangden,
      gia,
    };
    if (previous) Object.assign(previous, price);
    else catalog.giadichvu.push(price);
    return price;
  }
  return fail('Thao tác dịch vụ không được hỗ trợ.', 405);
}
