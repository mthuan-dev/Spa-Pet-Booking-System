import { ClockCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Collapse, Empty, Input, Modal, Tabs, Tooltip } from 'antd';
import { useState } from 'react';
import PageHeader from '~/components/ui/page-header.jsx';
import { useDeleteCatalogItem } from '../api/catalog.js';
import PriceForm from './PriceForm.jsx';
import { CatalogState, errorMessage, formatPrice, formatWeight, matchesKeyword, PET_TYPES } from './catalogShared.jsx';
import './WeightPriceAccordion.css';

const bandLabel = (price) => `${formatWeight(price.cannangtu)}–${formatWeight(price.cannangden)} kg`;
const servicePrices = (catalog, serviceId, petType) => catalog.giadichvu
  .filter((price) => price.madichvu === serviceId && price.loaithucung === petType)
  .sort((a, b) => a.cannangtu - b.cannangtu || a.cannangden - b.cannangden);

function ServiceHeading({ service }) {
  return (
    <div className="wp-service-heading">
      <div className="wp-service-heading-text">
        <h3>{service.ten}</h3>
        <span className="wp-duration"><ClockCircleOutlined /> {service.thoiluongphut} phút</span>
      </div>
    </div>
  );
}

function BandRows({ service, prices, onAddPrice, onEditPrice, onDeletePrice }) {
  return (
    <div className="wp-band-list">
      <div className="wp-band-list-heading"><span>Cân nặng thú cưng</span><span>Giá dịch vụ</span></div>
      {prices.map((price) => (
        <div className="wp-band-row" key={price.magiadichvu}>
          <span className="wp-band-weight"><span className="wp-band-dot" />{bandLabel(price)}</span>
          <div className="wp-band-price-actions">
            <strong className="wp-band-price">{formatPrice(price.gia)}</strong>
            <div className="wp-band-actions">
              <Tooltip title="Sửa cân nặng và giá">
                <Button type="text" size="small" icon={<EditOutlined />}
                  aria-label={`Sửa cân nặng và giá ${service.ten}, ${bandLabel(price)}`} onClick={() => onEditPrice(price)} />
              </Tooltip>
              <Tooltip title="Xóa mức cân nặng">
                <Button type="text" size="small" danger icon={<DeleteOutlined />}
                  aria-label={`Xóa mức cân nặng ${service.ten}, ${bandLabel(price)}`} onClick={() => onDeletePrice({ price, service })} />
              </Tooltip>
            </div>
          </div>
        </div>
      ))}
      {!prices.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có mức giá" />}
      <Button className="wp-add-band" type="text" icon={<PlusOutlined />} onClick={() => onAddPrice(service)}>
        Thêm mức cân nặng
      </Button>
    </div>
  );
}

function ExpandableServices({ services, catalog, petType, onAddPrice, onEditPrice, onDeletePrice }) {
  return (
    <Collapse className="wp-service-accordion" bordered={false} collapsible="icon"
      expandIcon={({ isActive }) => (
        <span className={`wp-expand-toggle${isActive ? ' wp-expand-toggle-expanded' : ''}`}>
          <span className="sr-only">{isActive ? 'Thu gọn dịch vụ' : 'Mở rộng dịch vụ'}</span>
        </span>
      )}
      items={services.map((service) => {
        const prices = servicePrices(catalog, service.madichvu, petType);
        return {
          key: String(service.madichvu),
          label: <ServiceHeading service={service} />,
          extra: <div className="wp-accordion-summary"><span>{prices.length} mức cân nặng</span>
            <strong>{prices.length ? `Từ ${formatPrice(Math.min(...prices.map((price) => price.gia)))}` : 'Chưa có giá'}</strong>
          </div>,
          children: <BandRows service={service} prices={prices} onAddPrice={onAddPrice}
            onEditPrice={onEditPrice} onDeletePrice={onDeletePrice} />,
        };
      })} />
  );
}

function PriceWorkspace({ catalog, petType, onAddPrice, onEditPrice, onDeletePrice }) {
  const [keyword, setKeyword] = useState('');
  const prices = catalog.giadichvu.filter((price) => price.loaithucung === petType);
  const pricedServiceIds = new Set(prices.map((price) => price.madichvu));
  const services = catalog.dichvu.filter((service) => pricedServiceIds.has(service.madichvu)
    && matchesKeyword(service.ten, keyword));
  const visibleServiceIds = new Set(services.map((service) => service.madichvu));
  const priceCount = prices.filter((price) => visibleServiceIds.has(price.madichvu)).length;
  return (
    <div className="wp-price-body">
      <div className="wp-price-toolbar">
        <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm dịch vụ..." value={keyword} allowClear
          onChange={(event) => setKeyword(event.target.value)} className="wp-service-search" />
        <span className="wp-catalog-summary">{services.length} dịch vụ <span>·</span> {priceCount} mức giá</span>
      </div>
      {services.length
        ? <ExpandableServices services={services} catalog={catalog} petType={petType} onAddPrice={onAddPrice}
            onEditPrice={onEditPrice} onDeletePrice={onDeletePrice} />
        : <Empty description={keyword.trim() ? 'Không tìm thấy dịch vụ' : 'Chưa có bảng giá cho loại thú cưng này'} />}
    </div>
  );
}

export default function WeightPriceAccordion({ query, petType, onTypeChange }) {
  const { message } = App.useApp();
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deletion = useDeleteCatalogItem('service-prices', () => {
    setDeleting(null);
    message.success('Đã xóa mức cân nặng');
  });
  const deletePrice = async () => {
    if (!deleting || deletion.isPending) return;
    try { await deletion.mutateAsync(deleting.price.magiadichvu); }
    catch (error) { message.error(errorMessage(error)); }
  };
  return (
    <div className="wp-price-list">
      <div className="wp-page-heading">
        <PageHeader heading="Quản lý giá theo cân nặng"
          links={[{ title: 'Trang chủ', href: '/admin' }, { title: 'Giá theo cân nặng' }]} />
        <Button type="primary" icon={<PlusOutlined />} disabled={!query.data} onClick={() => setEditor({})}>Thêm mới</Button>
      </div>
      {query.isError || query.isPending ? <CatalogState query={query} /> : (
        <Tabs className="weight-price-tabs" type="line" tabBarGutter={0} activeKey={petType} onChange={onTypeChange}
          items={PET_TYPES.map((item) => ({ key: item.value, label: item.label,
            children: <PriceWorkspace key={item.value} catalog={query.data}
              petType={item.value} onAddPrice={(service) => setEditor({ madichvu: service.madichvu })}
              onEditPrice={setEditor} onDeletePrice={setDeleting} />,
          }))} />
      )}
      {editor && query.data && (
        <Modal open title={editor.magiadichvu ? 'Chỉnh sửa mức cân nặng' : 'Thêm giá theo cân nặng'}
          footer={null} centered closable={false} mask={{ closable: false }}>
          <div style={{ paddingTop: 16 }}>
            <PriceForm catalog={query.data} petType={petType} initialValues={editor}
              price={editor.magiadichvu ? editor : undefined}
              onCancel={() => setEditor(null)} onSuccess={() => setEditor(null)} />
          </div>
        </Modal>
      )}
      <Modal open={Boolean(deleting)} title="Xóa mức cân nặng" centered
        okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} confirmLoading={deletion.isPending}
        cancelButtonProps={{ disabled: deletion.isPending }} closable={!deletion.isPending}
        keyboard={!deletion.isPending} mask={{ closable: !deletion.isPending }}
        onOk={deletePrice} onCancel={() => { if (!deletion.isPending) setDeleting(null); }}>
        {deleting && <p>Xóa mức {bandLabel(deleting.price)} của dịch vụ <strong>{deleting.service.ten}</strong>?</p>}
      </Modal>
    </div>
  );
}
