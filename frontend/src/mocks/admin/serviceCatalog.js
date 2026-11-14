import { MOCK_SERVICES } from '../../features/catalog/mocks/services.js';
import { serviceImageUrl } from './serviceImages.js';

// Admin preview data uses the columns of dichvu, chitietcombo and giadichvu.
export const SERVICE_CATALOG_STORAGE_KEY = 'petspa-admin-service-catalog-v1';
const PET_TYPES = ['DOG', 'CAT', 'OTHER'];
const PRICE_SEED_VERSION = 2;

// A service appears in an animal-type tab only when it has prices for that type.
const CAT_PRICE_BANDS = {
  1: [[0, 3, 150000], [3, 5, 180000], [5, 10, 220000]],
  2: [[0, 3, 200000], [3, 5, 250000], [5, 10, 310000]],
  3: [[0, 3, 90000], [3, 5, 120000], [5, 10, 160000]],
};
const OTHER_PRICE_BANDS = {
  1: [[0, 1, 80000], [1, 3, 100000], [3, 5, 130000]],
};

function createSamplePrices(legacy = false) {
  return MOCK_SERVICES.flatMap((service, serviceIndex) => {
    const dogBands = service.priceBands.map((band, index, bands) => [
      index === 0 ? 0 : bands[index - 1].maxWeightKg,
      band.maxWeightKg ?? 999.99,
      band.priceVnd,
    ]);
    const bandsByType = legacy
      ? { DOG: dogBands, CAT: dogBands, OTHER: dogBands }
      : { DOG: dogBands, CAT: CAT_PRICE_BANDS[service.id], OTHER: OTHER_PRICE_BANDS[service.id] };
    return PET_TYPES.flatMap((loaithucung, typeIndex) => (bandsByType[loaithucung] ?? [])
      .map(([cannangtu, cannangden, gia], bandIndex) => ({
        // Keep the original sample IDs stable when upgrading saved demo data.
        magiadichvu: (serviceIndex * PET_TYPES.length + typeIndex) * dogBands.length + bandIndex + 1,
        madichvu: service.id,
        loaithucung,
        cannangtu,
        cannangden,
        gia,
      })));
  });
}

function upgradeSamplePrices(catalog) {
  if (catalog.priceSeedVersion >= PRICE_SEED_VERSION) return false;
  const groupKey = (price) => `${price.madichvu}:${price.loaithucung}`;
  const fields = ['magiadichvu', 'madichvu', 'loaithucung', 'cannangtu', 'cannangden', 'gia'];
  const legacyGroups = new Map();
  for (const price of createSamplePrices(true)) {
    const key = groupKey(price);
    if (!legacyGroups.has(key)) legacyGroups.set(key, []);
    legacyGroups.get(key).push(price);
  }
  const untouchedGroups = new Set();
  for (const [key, originalPrices] of legacyGroups) {
    const savedPrices = catalog.giadichvu.filter((price) => groupKey(price) === key);
    if (savedPrices.length === originalPrices.length && originalPrices.every((original) =>
      savedPrices.some((saved) => fields.every((field) => saved[field] === original[field]))))
      untouchedGroups.add(key);
  }
  // Preserve whole groups containing edits/additions, including their weight ranges.
  catalog.giadichvu = [
    ...catalog.giadichvu.filter((price) => !untouchedGroups.has(groupKey(price))),
    ...createSamplePrices().filter((price) => untouchedGroups.has(groupKey(price))),
  ];
  catalog.priceSeedVersion = PRICE_SEED_VERSION;
  return true;
}

function createCatalog() {
  const now = new Date().toISOString();
  const dichvu = MOCK_SERVICES.map((service) => ({
    madichvu: service.id,
    ten: service.name,
    loaidichvu: service.category,
    thoiluongphut: service.durationMinutes,
    hinhanh: service.imageUrl,
    mota: service.description,
    trangthai: 1,
    ngaytao: now,
    ngaycapnhat: now,
  }));
  return {
    dichvu,
    chitietcombo: [1, 2, 3].map((madichvucon) => ({ macombo: 4, madichvucon })),
    giadichvu: createSamplePrices(),
    priceSeedVersion: PRICE_SEED_VERSION,
  };
}

export function loadServiceCatalog() {
  const stored = localStorage.getItem(SERVICE_CATALOG_STORAGE_KEY);
  if (stored) {
    const catalog = JSON.parse(stored);
    if (upgradeSamplePrices(catalog))
      localStorage.setItem(SERVICE_CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    return catalog;
  }
  const catalog = createCatalog();
  localStorage.setItem(SERVICE_CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  return catalog;
}

export function handleServiceCatalog({ path, method, body, fail }) {
  const catalog = loadServiceCatalog();
  const nextId = (items, key) => Math.max(0, ...items.map((item) => item[key])) + 1;
  const findService = (id) =>
    catalog.dichvu.find((service) => service.madichvu === Number(id)) || fail('Không tìm thấy dịch vụ.', 404);
  const save = (result) => {
    localStorage.setItem(SERVICE_CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    return result;
  };
  if (path === '/ad/services' && method === 'get') return {
    ...catalog,
    dichvu: catalog.dichvu.map((service) => ({ ...service, hinhanhUrl: serviceImageUrl(service.hinhanh) })),
  };

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
      children = body.chitietcombo === undefined
        ? catalog.chitietcombo.filter((item) => item.macombo === madichvu).map((item) => item.madichvucon)
        : body.chitietcombo.map((item) => Number(item.madichvucon));
      if (!children.length) fail('Vui lòng chọn dịch vụ thành phần cho combo.');
      if (new Set(children).size !== children.length) fail('Dịch vụ thành phần bị trùng.');
      if (children.some((id) => findService(id).loaidichvu !== 'SINGLE'))
        fail('Dịch vụ thành phần phải là dịch vụ lẻ.');
    }
    const now = new Date().toISOString();
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
    catalog.chitietcombo = catalog.chitietcombo.filter((item) => item.macombo !== madichvu);
    catalog.chitietcombo.push(...children.map((madichvucon) => ({ macombo: madichvu, madichvucon })));
    return save(service);
  }

  const priceMatch = path.match(/^\/ad\/service-prices(?:\/(\d+))?$/);
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
      && price.cannangtu === cannangtu && price.cannangden === cannangden))
      fail('Dịch vụ đã có giá cho loại thú cưng và khoảng cân nặng này.', 409);
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
    return save(price);
  }
  return fail('Thao tác dịch vụ không được hỗ trợ.', 405);
}
