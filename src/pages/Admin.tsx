import React from 'react';
import { Typography, Alert } from 'antd';

const Admin: React.FC = () => {
    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={3}>管理后台</Typography.Title>
            <Alert type="success" message="只有具备管理员权限的用户可以看到此页面" showIcon />
        </div>
    );
};

export default Admin;


