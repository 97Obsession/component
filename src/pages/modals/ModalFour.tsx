import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import type { CommonModalProps } from './ModalOne';

const ModalFour: React.FC<CommonModalProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const handleSubmit = async () => {
        await form.validateFields();
        onClose();
    };

    return (
        <Modal open={open} onCancel={onClose} onOk={handleSubmit} title="弹窗四（表单）" destroyOnClose>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item name="remark" label="备注">
                    <Input.TextArea rows={3} placeholder="可选" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={handleSubmit}>提交</Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalFour;


