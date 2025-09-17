// import { Button, Space, Spin } from 'antd';
import React, { useMemo, useState, Suspense } from 'react';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Spin from 'antd/es/spin';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from '../redux/counterSlice';
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

const ReTable: React.FC<ReTableProps> = ({ data = [] }) => {
    const [visibleKey, setVisibleKey] = useState<ModalKey | null>(null);
    // 使用 useSelector 获取 counter 状态
    const count = useSelector((state:any ) => state.counter.value);
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

    const handleOpen = (key: ModalKey) => setVisibleKey(key);
    const handleClose = () => setVisibleKey(null);

    const ActiveModal = visibleKey ? LazyModalMap[visibleKey] : null;

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
            <Suspense fallback={<div style={{ padding: 16 }}><Spin /> 加载中...</div>}>
                {ActiveModal && (
                    <ActiveModal open={!!visibleKey} onClose={handleClose} />
                )}
            </Suspense>
        </>
    );
};

export default ReTable;
