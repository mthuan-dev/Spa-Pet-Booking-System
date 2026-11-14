import { CheckCircleFilled, CloseOutlined, DeleteOutlined, ExpandOutlined, ScissorOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Image, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { SERVICE_IMAGE_TYPES, serviceImageError } from '../utils/serviceImages.js';
import ServiceImageCropper from './ServiceImageCropper.jsx';
import './ServiceImageInput.css';

const formatSize = (bytes) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const imageName = (path) => {
  try { return decodeURIComponent(path?.split(/[?#]/)[0].split('/').pop() || 'Ảnh dịch vụ'); }
  catch { return 'Ảnh dịch vụ'; }
};

const ServiceImageInput = ({ id, value, onChange, file, onFileChange, imageUrl, disabled, onBusyChange }) => {
  const inputRef = useRef(null);
  const readerRef = useRef(null);
  const dragDepth = useRef(0);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cropping, setCropping] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    if (readerRef.current) {
      readerRef.current.abort();
      readerRef.current = null;
    }
  }, []);

  const finishReading = () => {
    readerRef.current = null;
    setReading(null);
    onBusyChange?.(false);
  };

  const cancelReading = () => {
    readerRef.current?.abort();
    finishReading();
  };

  const selectFile = (selected) => {
    if (disabled || !selected) return;
    const validationError = serviceImageError(selected);
    if (validationError) {
      message.error(validationError);
      return;
    }
    readerRef.current?.abort();
    const reader = new FileReader();
    readerRef.current = reader;
    setReading({ name: selected.name, size: selected.size, progress: 0 });
    onBusyChange?.(true);
    reader.onprogress = (event) => {
      if (event.lengthComputable && readerRef.current === reader)
        setReading({ name: selected.name, size: selected.size, progress: Math.round(event.loaded / event.total * 100) });
    };
    reader.onerror = () => {
      if (readerRef.current !== reader) return;
      message.error('Không thể đọc ảnh. Vui lòng chọn lại.');
      finishReading();
    };
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => {
        if (readerRef.current !== reader) return;
        onFileChange(selected);
        onChange?.('');
        finishReading();
      };
      image.onerror = () => {
        if (readerRef.current !== reader) return;
        message.error('Tệp ảnh bị lỗi hoặc không đọc được. Vui lòng chọn ảnh khác.');
        finishReading();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(selected);
  };

  const removeImage = () => {
    if (disabled) return;
    cancelReading();
    setPreviewOpen(false);
    setCropping(false);
    onFileChange(null);
    onChange?.('');
  };

  const src = file ? preview : value ? imageUrl || value : '';
  const name = file?.name || imageName(value);
  const hasImage = Boolean(file || value);
  const canEdit = Boolean(src) && !disabled && !reading;
  const openCropper = () => {
    setPreviewOpen(false);
    setCropping(true);
  };

  return (
    <div className={`service-image-input${disabled ? ' service-image-input-disabled' : ''}`}>
      <input ref={inputRef} id={id} type="file" accept={SERVICE_IMAGE_TYPES.join(',')}
        aria-label="Chọn ảnh dịch vụ" disabled={disabled} hidden
        onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ''; }} />
      {!hasImage && !reading && <button type="button" className={`service-image-dropzone${dragging ? ' is-dragging' : ''}`}
        disabled={disabled} onClick={() => inputRef.current?.click()}
        aria-label="Tải ảnh dịch vụ"
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && event.dataTransfer.types.includes('Files')) {
            dragDepth.current += 1;
            setDragging(true);
          }
        }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'; }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (disabled) return;
          if (event.dataTransfer.files.length > 1) {
            message.error('Vui lòng chọn một ảnh cho mỗi dịch vụ.');
            return;
          }
          selectFile(event.dataTransfer.files[0]);
        }}>
        <span className="service-image-drop-description">Kéo thả ảnh vào đây hoặc <span>bấm để chọn ảnh</span></span>
        <span className="service-image-upload-tile"><UploadOutlined /></span>
        <span className="service-image-drop-hint">JPG, PNG, WebP <span>·</span> Tối đa 2 MB</span>
      </button>}

      {(reading || hasImage) && (
        <div className={`service-image-file${reading ? ' is-reading' : ''}`} aria-busy={Boolean(reading)}>
          <button type="button" className="service-image-file-main" disabled={!canEdit}
            onClick={() => setPreviewOpen(true)} aria-label="Xem ảnh dịch vụ">
            <span className="service-image-thumbnail">
              {src ? <img src={src} alt="Ảnh dịch vụ đã chọn" /> : <UploadOutlined />}
              {canEdit && <span className="service-image-thumbnail-overlay"><ExpandOutlined /></span>}
            </span>
            <span className="service-image-file-info">
              <span className="service-image-filename" title={reading?.name || name}>{reading?.name || name}</span>
              <span className="service-image-file-meta">
                {(reading || file) && <span>{formatSize(reading?.size ?? file.size)}<span className="service-image-meta-dot">·</span></span>}
                <span className={reading ? 'service-image-reading' : 'service-image-ready'} role="status">
                  {reading ? `Đang đọc · ${reading.progress}%` : <><CheckCircleFilled /> {file ? 'Sẵn sàng' : 'Đã lưu'}</>}
                </span>
              </span>
            </span>
          </button>
          <div className="service-image-file-actions">
            {!reading && <>
              <Tooltip title="Thay ảnh"><button type="button" className="service-image-icon-button"
                disabled={disabled} onClick={() => inputRef.current?.click()} aria-label="Thay ảnh dịch vụ"><UploadOutlined /></button></Tooltip>
              <Tooltip title="Cắt ảnh"><button type="button" className="service-image-icon-button"
                disabled={!canEdit} onClick={openCropper} aria-label="Cắt ảnh dịch vụ"><ScissorOutlined /></button></Tooltip>
            </>}
            <Tooltip title={reading ? 'Hủy chọn ảnh' : 'Xóa ảnh'}><button type="button"
              className="service-image-icon-button service-image-remove" disabled={disabled}
              onClick={reading ? cancelReading : removeImage} aria-label={reading ? 'Hủy chọn ảnh' : 'Xóa ảnh dịch vụ'}>
              <CloseOutlined />
            </button></Tooltip>
          </div>
          {reading && <div className="service-image-progress" role="progressbar" aria-label="Tiến độ đọc ảnh"
            aria-valuenow={reading.progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${reading.progress}%` }} />
          </div>}
        </div>
      )}
      {src && <Image src={src} alt="Ảnh dịch vụ" styles={{ root: { display: 'none' } }}
        preview={{ open: previewOpen, onOpenChange: setPreviewOpen,
          actionsRender: (actions) => <div className="service-image-preview-tools">
            {actions}
            <div className="service-image-preview-actions">
              <Tooltip title="Cắt ảnh"><button type="button" disabled={!canEdit}
                onClick={openCropper} aria-label="Cắt ảnh đang xem"><ScissorOutlined /></button></Tooltip>
              <Tooltip title="Xóa ảnh"><button type="button" disabled={disabled || Boolean(reading)}
                onClick={removeImage} aria-label="Xóa ảnh đang xem"><DeleteOutlined /></button></Tooltip>
            </div>
          </div>,
        }} />}
      {cropping && src && <ServiceImageCropper src={src} filename={name}
        disabled={disabled} onClose={() => setCropping(false)} onBusyChange={onBusyChange}
        onApply={(croppedFile) => {
          onFileChange(croppedFile);
          onChange?.('');
          setCropping(false);
          message.success('Đã cập nhật ảnh đã cắt.');
        }} />}
    </div>
  );
};

export default ServiceImageInput;
