import React from 'react';
import { Modal, Descriptions } from 'antd';
import type { CommonModalProps } from './ModalOne';

const ModalThree: React.FC<CommonModalProps> = ({ open, onClose }) => {
    return (
        <Modal open={open} onCancel={onClose} onOk={onClose} title="弹窗三" destroyOnClose>
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="字段A">值A</Descriptions.Item>
                <Descriptions.Item label="字段B">值B</Descriptions.Item>
                <Descriptions.Item label="字段C">值C</Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ModalThree;


