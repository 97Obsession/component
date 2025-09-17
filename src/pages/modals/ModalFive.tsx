import React from 'react';
import { Modal, Result } from 'antd';
import type { CommonModalProps } from './ModalOne';

const ModalFive: React.FC<CommonModalProps> = ({ open, onClose }) => {
    return (
        <Modal open={open} onCancel={onClose} onOk={onClose} title="弹窗五" destroyOnClose>
            <Result status="success" title="操作成功" subTitle="这是第五个弹窗内容示例。" />
        </Modal>
    );
};

export default ModalFive;


