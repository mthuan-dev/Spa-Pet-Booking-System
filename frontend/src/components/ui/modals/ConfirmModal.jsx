import { Modal, Typography } from 'antd';

const { Title } = Typography;

const ConfirmModal = ({ title, content, open, handleOk, handleCancel }) => {
  return (
    <Modal centered open={open} title={title} onOk={handleOk} onCancel={handleCancel}>
      <Title level={4}>{content}</Title>
    </Modal>
  );
};


export default ConfirmModal;
