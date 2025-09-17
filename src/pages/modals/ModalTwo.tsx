import React from 'react';
import { Modal, Alert } from 'antd';
import type { CommonModalProps } from './ModalOne';

const ModalTwo: React.FC<CommonModalProps> = ({ open, onClose }) => {
    return (
        <Modal open={open} onCancel={onClose} onOk={onClose} title="弹窗二" destroyOnClose>
            <Alert message="这是第二个弹窗，可以展示提示信息。" type="info" showIcon />
        </Modal>
    );
};

export default ModalTwo;


