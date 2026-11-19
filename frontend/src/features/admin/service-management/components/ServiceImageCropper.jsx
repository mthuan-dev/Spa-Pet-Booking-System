import { ReloadOutlined, ScissorOutlined } from '@ant-design/icons';
import { Alert, App, Button, Modal, Segmented, Spin } from 'antd';
import { useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cropServiceImage } from '../utils/serviceImages.js';

const RATIOS = [
  { label: 'Tự do', value: 'free' },
  { label: '1:1', value: 'square' },
  { label: '4:3', value: 'landscape' },
  { label: '16:9', value: 'wide' },
];
const ASPECTS = { square: 1, landscape: 4 / 3, wide: 16 / 9 };
const CROP_LABELS = {
  cropArea: 'Vùng cắt ảnh. Dùng phím mũi tên để di chuyển.',
  nwDragHandle: 'Đổi kích thước góc trên trái', nDragHandle: 'Đổi kích thước cạnh trên',
  neDragHandle: 'Đổi kích thước góc trên phải', eDragHandle: 'Đổi kích thước cạnh phải',
  seDragHandle: 'Đổi kích thước góc dưới phải', sDragHandle: 'Đổi kích thước cạnh dưới',
  swDragHandle: 'Đổi kích thước góc dưới trái', wDragHandle: 'Đổi kích thước cạnh trái',
};

const ServiceImageCropper = ({ src, filename, onClose, onApply, onBusyChange, disabled, entityLabel = 'dịch vụ' }) => {
  const imageRef = useRef(null);
  const [ratio, setRatio] = useState('free');
  const [crop, setCrop] = useState({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();
  const busy = saving || disabled;

  const resetCrop = (nextRatio = ratio) => {
    const image = imageRef.current;
    setRatio(nextRatio);
    if (!image?.naturalWidth) return;
    setCrop(ASPECTS[nextRatio]
      ? centerCrop(makeAspectCrop({ unit: '%', width: 85 }, ASPECTS[nextRatio], image.naturalWidth, image.naturalHeight),
        image.naturalWidth, image.naturalHeight)
      : { unit: '%', x: 10, y: 10, width: 80, height: 80 });
  };

  const applyCrop = async () => {
    if (busy || !loaded || failed) return;
    setSaving(true);
    onBusyChange?.(true);
    try {
      const croppedFile = await cropServiceImage(imageRef.current, crop, filename);
      onApply(croppedFile);
    } catch (error) {
      message.error(error.message || 'Không thể cắt ảnh. Vui lòng thử lại.');
    } finally {
      setSaving(false);
      onBusyChange?.(false);
    }
  };

  return (
    <Modal open centered width={820} className="service-image-editor" title={`Cắt ảnh ${entityLabel}`}
      maskClosable={!busy} keyboard={!busy} closable={!busy} onCancel={() => { if (!busy) onClose(); }}
      footer={<div className="service-image-editor-footer">
        <Button disabled={busy} onClick={onClose}>Hủy cắt</Button>
        <Button type="primary" icon={<ScissorOutlined />} loading={saving}
          disabled={disabled || !loaded || failed || !crop?.width || !crop?.height} onClick={applyCrop}>Áp dụng ảnh đã cắt</Button>
      </div>}>
      <p className="service-image-editor-description">Kéo vùng chọn hoặc các góc để giữ lại phần ảnh bạn muốn.</p>
      <div className="service-image-crop-toolbar">
        <Segmented options={RATIOS} value={ratio} onChange={resetCrop} disabled={busy || !loaded || failed} aria-label="Tỉ lệ cắt ảnh" />
        <Button type="text" icon={<ReloadOutlined />} disabled={busy || !loaded || failed} onClick={() => resetCrop()}>Đặt lại</Button>
      </div>
      <div className="service-image-editor-stage" aria-busy={!loaded && !failed}>
        {!loaded && !failed && <div className="service-image-editor-loading"><Spin /></div>}
        {failed && <Alert type="error" showIcon title="Không thể mở ảnh."
          description="Vui lòng chọn lại ảnh từ thiết bị để xem và cắt ảnh." />}
        <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}
          aspect={ASPECTS[ratio]} keepSelection ruleOfThirds minWidth={16} minHeight={16}
          ariaLabels={CROP_LABELS} disabled={busy || failed}>
          <img ref={imageRef} src={src} crossOrigin="anonymous" alt={`Ảnh ${entityLabel} để cắt`} draggable={false}
            hidden={failed} onLoad={() => { setLoaded(true); resetCrop(); }} onError={() => { setFailed(true); setLoaded(false); }} />
        </ReactCrop>
      </div>
    </Modal>
  );
};

export default ServiceImageCropper;
