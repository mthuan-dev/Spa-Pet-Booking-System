import { ClockCircleOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Collapse, Empty, Input, InputNumber, Modal, Popover, Tabs } from 'antd';
import { useState } from 'react';
import PageHeader from '~/components/ui/page-header.jsx';
import { useSaveCatalogItem } from '../api/catalog.js';
import PriceForm from './PriceForm.jsx';
import { CatalogState, errorMessage, formatPrice, formatWeight, matchesKeyword, PET_TYPES } from './catalogShared.jsx';
import './WeightPriceAccordion.css';

const bandLabel = (price) => `${formatWeight(price.cannangtu)}–${formatWeight(price.cannangden)} kg`;
const servicePrices = (catalog, serviceId, petType) => catalog.giadichvu
  .filter((price) => price.madichvu === serviceId && price.loaithucung === petType)
  .sort((a, b) => a.cannangtu - b.cannangtu || a.cannangden - b.cannangden);

function QuickPrice({ price, service }) {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(price.gia);
  const mutation = useSaveCatalogItem('service-prices', () => {
    setOpen(false);
    message.success('Đã cập nhật giá dịch vụ');
  });
  const save = async () => {
    if (mutation.isPending || amount == null || amount < 0 || amount > 9999999999.99) return;
    try { await mutation.mutateAsync({ id: price.magiadichvu, data: { gia: amount } }); }
    catch (error) { message.error(errorMessage(error)); }
  };
  return (
    <Popover trigger="click" placement="bottom" open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          setAmount(price.gia);
          setOpen(next);
        }
      }}
      content={(
        <div className="wp-quick-editor">
          <strong>Chỉnh sửa giá</strong>
          <span className="wp-quick-context">{service.ten} · {bandLabel(price)}</span>
          <label htmlFor={`quick-price-${price.magiadichvu}`}>Giá tiền (VNĐ)</label>
          <InputNumber id={`quick-price-${price.magiadichvu}`} aria-label="Giá mới" value={amount}
            min={0} max={9999999999.99} precision={2} step={1000} onChange={setAmount}
            onPressEnter={save} disabled={mutation.isPending} style={{ width: '100%' }} />
          <div className="wp-quick-actions">
            <Button size="small" disabled={mutation.isPending} onClick={() => setOpen(false)}>Hủy</Button>
            <Button size="small" type="primary" onClick={save} loading={mutation.isPending} disabled={amount == null}>
              Lưu giá
            </Button>
          </div>
        </div>
      )}>
      <button type="button" className="wp-price-edit"
        aria-label={`Sửa giá ${service.ten}, ${bandLabel(price)}`} data-price-id={price.magiadichvu}>
        <strong>{formatPrice(price.gia)}</strong>
        <EditOutlined className="wp-price-pencil" />
      </button>
    </Popover>
  );
}

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

function BandRows({ service, prices, onAddPrice }) {
  return (
    <div className="wp-band-list">
      <div className="wp-band-list-heading"><span>Cân nặng thú cưng</span><span>Giá dịch vụ</span></div>
      {prices.map((price) => (
        <div className="wp-band-row" key={price.magiadichvu}>
          <span className="wp-band-weight"><span className="wp-band-dot" />{bandLabel(price)}</span>
          <QuickPrice price={price} service={service} />
        </div>
      ))}
      {!prices.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có mức giá" />}
      <Button className="wp-add-band" type="text" icon={<PlusOutlined />} onClick={() => onAddPrice(service)}>
        Thêm mức cân nặng
      </Button>
    </div>
  );
}

function ExpandableServices({ services, catalog, petType, onAddPrice }) {
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
          children: <BandRows service={service} prices={prices} onAddPrice={onAddPrice} />,
        };
      })} />
  );
}

function PriceWorkspace({ catalog, petType, onAddPrice }) {
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
        ? <ExpandableServices services={services} catalog={catalog} petType={petType} onAddPrice={onAddPrice} />
        : <Empty description={keyword.trim() ? 'Không tìm thấy dịch vụ' : 'Chưa có bảng giá cho loại thú cưng này'} />}
    </div>
  );
}

export default function WeightPriceAccordion({ query, petType, onTypeChange }) {
  const [editor, setEditor] = useState(null);
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
              petType={item.value} onAddPrice={(service) => setEditor({ madichvu: service.madichvu })} />,
          }))} />
      )}
      {editor && query.data && (
        <Modal open title="Thêm giá theo cân nặng" footer={null} centered closable={false} mask={{ closable: false }}>
          <div style={{ paddingTop: 16 }}>
            <PriceForm catalog={query.data} petType={petType} initialValues={editor}
              onCancel={() => setEditor(null)} onSuccess={() => setEditor(null)} />
          </div>
        </Modal>
      )}
    </div>
  );
}
