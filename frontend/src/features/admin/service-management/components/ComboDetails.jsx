import { CheckOutlined, PictureOutlined } from '@ant-design/icons';
import { Card, Image } from 'antd';
import { useState } from 'react';
import { ServiceStatus } from './catalogShared.jsx';
import './ComboDetails.css';

const ComboImage = ({ combo }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="combo-details-image">
      {combo.hinhanh && !failed ? (
        <Image
          src={combo.hinhanhUrl || combo.hinhanh}
          alt={combo.ten}
          width="100%"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="combo-details-image-empty">
          <PictureOutlined />
          <span>Chưa có hình ảnh</span>
        </div>
      )}
    </div>
  );
};

const ComboDetails = ({ combo, catalog }) => {
  const components = catalog.chitietcombo
    .filter((child) => child.macombo === combo.madichvu)
    .map((child) => catalog.dichvu.find((service) => service.madichvu === child.madichvucon))
    .filter(Boolean);

  return (
    <Card className="combo-details-card">
      <div className="combo-details-layout">
        <dl className="combo-details-fields">
          <div className="combo-details-field combo-details-name">
            <dt>Tên combo</dt>
            <dd><h2>{combo.ten}</h2></dd>
          </div>
          <div className="combo-details-field">
            <dt>Mã combo</dt>
            <dd>#{combo.madichvu}</dd>
          </div>
          <div className="combo-details-field">
            <dt>Thời lượng</dt>
            <dd>{combo.thoiluongphut} phút</dd>
          </div>
          <div className="combo-details-field">
            <dt>Trạng thái</dt>
            <dd><ServiceStatus value={combo.trangthai} /></dd>
          </div>
          <div className="combo-details-field">
            <dt>Dịch vụ thành phần</dt>
            <dd>
              {components.length ? (
                <ul className="combo-details-components">
                  {components.map((service) => (
                    <li key={service.madichvu}>
                      <CheckOutlined />
                      <span>{service.ten}</span>
                    </li>
                  ))}
                </ul>
              ) : <span className="combo-details-muted">Chưa có dịch vụ thành phần</span>}
            </dd>
          </div>
          <div className="combo-details-field">
            <dt>Mô tả</dt>
            <dd className="combo-details-description">{combo.mota || 'Chưa có mô tả.'}</dd>
          </div>
        </dl>
        <ComboImage key={combo.hinhanh || 'empty'} combo={combo} />
      </div>
    </Card>
  );
};

export default ComboDetails;
