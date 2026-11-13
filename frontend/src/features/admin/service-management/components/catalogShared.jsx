import { Alert, Button, Empty, Image, Spin, Tag } from 'antd';

export const PET_TYPES = [
  { value: 'DOG', label: 'Chó' },
  { value: 'CAT', label: 'Mèo' },
  { value: 'OTHER', label: 'Khác' },
];
export const petTypeLabel = (value) => PET_TYPES.find((item) => item.value === value)?.label ?? value;
export const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 2,
}).format(value);
export const formatWeight = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);
export const matchesKeyword = (value, keyword) => {
  const normalize = (text) => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  return normalize(value).includes(normalize(keyword).trim());
};
export const errorMessage = (error) => error?.response?.data?.detail || 'Chưa lưu được dữ liệu. Vui lòng thử lại.';
export const ServiceStatus = ({ value }) => (
  <Tag color={value === 1 ? 'success' : 'default'}>{value === 1 ? 'Hoạt động' : 'Vô hiệu'}</Tag>
);
export const ServiceImage = ({ service }) => service.hinhanh
  ? <Image width={48} height={48} src={service.hinhanh} alt={service.ten} style={{ objectFit: 'cover', borderRadius: 6 }} />
  : <span className="text-gray-400">—</span>;

export const CatalogState = ({ query, missing = false }) => {
  if (query.isPending) return <div className="bg-white p-4"><Spin /></div>;
  if (query.isError) return <Alert type="error" showIcon title="Chưa tải được dữ liệu dịch vụ."
    action={<Button onClick={() => query.refetch()}>Thử lại</Button>} />;
  if (missing) return <div className="bg-white p-4"><Empty description="Không tìm thấy dữ liệu." /></div>;
  return null;
};
