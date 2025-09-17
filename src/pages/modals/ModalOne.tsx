import React from 'react';
import { Modal, Typography } from 'antd';

export interface CommonModalProps {
    open: boolean;
    onClose: () => void;
}

const ModalOne: React.FC<CommonModalProps> = ({ open, onClose }) => {
    return (
        <Modal open={open} onCancel={onClose} onOk={onClose} title="弹窗一" destroyOnClose>
            <Typography.Paragraph>
                这是第一个弹窗的内容。可以放表单、说明或任何组件。
            </Typography.Paragraph>
        </Modal>
    );
};

export default ModalOne;


