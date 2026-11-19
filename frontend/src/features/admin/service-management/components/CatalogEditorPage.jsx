import { Card } from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '~/components/ui/page-header.jsx';
import { useServiceCatalog } from '../api/catalog.js';
import ServiceForm from './ServiceForm.jsx';
import PriceForm from './PriceForm.jsx';
import { CatalogState, PET_TYPES } from './catalogShared.jsx';

const CatalogEditorPage = ({ kind }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useServiceCatalog();
  const isPrice = kind === 'price';
  const title = isPrice ? 'Giá theo cân nặng' : 'Combo dịch vụ';
  const basePath = isPrice ? '/admin/weight-prices' : '/admin/combos';
  const item = isPrice
    ? query.data?.giadichvu.find((price) => price.magiadichvu === Number(id))
    : query.data?.dichvu.find((service) => service.madichvu === Number(id) && service.loaidichvu === 'COMBO');
  const selectedType = searchParams.get('loai');
  const petType = item?.loaithucung ?? (PET_TYPES.some((type) => type.value === selectedType) ? selectedType : 'DOG');
  const cancelPath = isPrice ? `${basePath}?loai=${petType}` : basePath;
  const ready = query.isSuccess && (!id || item);
  return (
    <>
      <PageHeader className="mb-4" heading={`${id ? 'Chỉnh sửa' : 'Thêm'} ${title.toLowerCase()}`}
        links={[{ title: 'Trang chủ', href: '/admin' }, { title, href: cancelPath },
          { title: id ? 'Chỉnh sửa' : 'Thêm mới' }]} />
      {!ready ? <CatalogState query={query} missing={Boolean(id) && !item} /> : (
        <Card style={{ maxWidth: 800 }}>
          {isPrice
            ? <PriceForm key={id || 'new'} price={item} catalog={query.data} petType={petType}
                onCancel={() => navigate(cancelPath)}
                onSuccess={(savedPrice) => navigate(`${basePath}?loai=${savedPrice.loaithucung}`)} />
            : <ServiceForm key={id || 'new'} category="COMBO" service={item} catalog={query.data}
                onCancel={() => navigate(cancelPath)} onSuccess={() => navigate(basePath)} />}
        </Card>
      )}
    </>
  );
};

export default CatalogEditorPage;
