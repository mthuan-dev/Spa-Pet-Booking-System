import { EditOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Flex } from 'antd';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '~/components/ui/page-header.jsx';
import { useServiceCatalog } from '../api/catalog.js';
import { CatalogState, formatPrice, formatWeight, petTypeLabel } from './catalogShared.jsx';
import ComboDetails from './ComboDetails.jsx';

const CatalogDetailsPage = ({ kind }) => {
  const { id } = useParams();
  const query = useServiceCatalog();
  const isPrice = kind === 'price';
  const title = isPrice ? 'Giá theo cân nặng' : 'Combo dịch vụ';
  const item = isPrice
    ? query.data?.giadichvu.find((price) => price.magiadichvu === Number(id))
    : query.data?.dichvu.find((service) => service.madichvu === Number(id) && service.loaidichvu === 'COMBO');
  const basePath = isPrice ? `/admin/trains?loai=${item?.loaithucung || 'DOG'}` : '/admin/carriage-layouts';
  const serviceName = isPrice && query.data?.dichvu.find((service) => service.madichvu === item?.madichvu)?.ten;
  const items = !item || !isPrice ? [] : [
    { key: 'magiadichvu', label: 'Mã giá', children: item.magiadichvu },
    { key: 'madichvu', label: 'Dịch vụ', children: serviceName },
    { key: 'loaithucung', label: 'Loại thú cưng', children: petTypeLabel(item.loaithucung) },
    { key: 'cannangtu', label: 'Cân nặng từ', children: `${formatWeight(item.cannangtu)} kg` },
    { key: 'cannangden', label: 'Cân nặng đến', children: `${formatWeight(item.cannangden)} kg` },
    { key: 'gia', label: 'Giá tiền', children: formatPrice(item.gia) },
  ];
  return (
    <>
      <Flex align="center" justify="space-between" className="mb-4" gap={12} wrap>
        <PageHeader heading={`Thông tin ${title.toLowerCase()}`}
          links={[{ title: 'Trang chủ', href: '/admin' }, { title, href: basePath }, { title: 'Chi tiết' }]} />
        {item && <Link to="edit"><Button type="primary" icon={<EditOutlined />}>Chỉnh sửa</Button></Link>}
      </Flex>
      {!item || !query.isSuccess ? <CatalogState query={query} missing={!item} /> : isPrice ? (
        <Card><Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} items={items} /></Card>
      ) : <ComboDetails combo={item} catalog={query.data} />}
    </>
  );
};

export default CatalogDetailsPage;
