// import { Button, Space, Spin } from 'antd';
import React, { useMemo, useState, Suspense, useEffect } from 'react';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Spin from 'antd/es/spin';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from '../redux/counterSlice';
import { Table } from "antd";  // 已导入
import useFetchItems from "./hook/useFetchItems";

interface DataItem {
    id: number;
    title: string;
    description: string;
}

interface ReTableProps {
    data?: DataItem[];
}

type ModalKey = 'one' | 'two' | 'three' | 'four' | 'five';

// 动态引入五个弹窗组件（按需加载，独立分包）
const LazyModalMap: Record<ModalKey, React.LazyExoticComponent<React.ComponentType<any>>> = {
    one: React.lazy(() => import('./modals/ModalOne')),
    two: React.lazy(() => import('./modals/ModalTwo')),
    three: React.lazy(() => import('./modals/ModalThree')),
    four: React.lazy(() => import('./modals/ModalFour')),
    five: React.lazy(() => import('./modals/ModalFive')),
};

const ReTable: React.FC<ReTableProps> = () => {
    const [visibleKey, setVisibleKey] = useState<ModalKey | null>(null);
    // 使用 useSelector 获取 counter 状态
    const count = useSelector((state: any) => state.counter.value);
    // 使用 useDispatch 获取 dispatch 函数
    const dispatch = useDispatch();
    // 配置化按钮与弹窗映射，避免重复代码
    const configs = useMemo(() => ([
        { key: 'one' as const, label: '打开弹窗一' },
        { key: 'two' as const, label: '打开弹窗二' },
        { key: 'three' as const, label: '打开弹窗三' },
        { key: 'four' as const, label: '打开弹窗四' },
        { key: 'five' as const, label: '打开弹窗五' },
    ]), []);

    // Hook 返回流式数据（data 逐步累积）
    const { data, total, loading, error } = useFetchItems('http://localhost:3000/api/items');

    const handleOpen = (key: ModalKey) => setVisibleKey(key);
    const handleClose = () => setVisibleKey(null);

    const ActiveModal = visibleKey ? LazyModalMap[visibleKey] : null;

    // Table columns（匹配数据字段）
    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: '住址',
            dataIndex: 'address',
            key: 'address',
        },
    ];

    // 早期返回：处理 loading 和 error（全局 Spinner 或消息）
    // if (loading && data.length === 0) {
    //     return <div style={{ padding: 16, textAlign: 'center' }}><Spin size="large" /> 加载中...</div>;
    // }
    if (error) {
        return <div style={{ padding: 16, color: 'red' }}>错误: {error}</div>;
    }
// 新增：实时计算 progress（依赖 data.length 和 total）
    const progress = useMemo(() => {
        if (total <= 0) return 0;
        return Math.min(100, (data.length / total) * 100);
    }, [data.length, total]);  // 每当 length 或 total 变，重新算
    return (
        <>
            <Space wrap>
                {configs.map(cfg => (
                    <Button key={cfg.key} type="primary" onClick={() => handleOpen(cfg.key)}>
                        {cfg.label}
                    </Button>
                ))}
            </Space>
            <div>count{count}</div>
            <button onClick={() => dispatch(increment())}>增加</button>
            <button onClick={() => dispatch(decrement())}>减少</button>

            {/* 可选：进度显示（流式加载时实时更新） */}
            {total > 0 && (
                <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
                    data.length: {data.length}
                    data.total: {total}
                    加载进度: {progress.toFixed(0)}%
                    ({data.length}/{total})
                </div>
            )}

            <Suspense fallback={<div style={{ padding: 16 }}><Spin /> 加载中...</div>}>
                {ActiveModal && (
                    <ActiveModal open={!!visibleKey} onClose={handleClose} />
                )}
            </Suspense>
             Table：使用流式 data，支持渐进渲染
            <Table
                dataSource={data}  // 流式数据：逐步追加行
                columns={columns}
                // loading={loading}  // Table 内置 Spinner（当 loading=true 时显示）
                pagination={false}
                scroll={{ x: 800, y: 400 }}  // 虚拟滚动：横向/纵向滚动条，支持大数据
                rowKey="id"  // 优化渲染（使用 id 作为 key）
                size="middle"  // 可选：紧凑布局
            />
        </>
    );
};

export default ReTable;