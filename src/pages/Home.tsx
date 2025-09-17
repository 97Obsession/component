import React from 'react';
import { Typography } from 'antd';
import { increment, decrement, incrementByAmount } from '../redux/counterSlice';
import { useSelector, useDispatch } from 'react-redux';
const Home: React.FC = () => {
    // 使用 useSelector 获取 counter 状态
    const count = useSelector((state:any ) => state.counter.value);
    // 使用 useDispatch 获取 dispatch 函数
    const dispatch = useDispatch();
    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={3}>首页</Typography.Title>
            <Typography.Paragraph>
                这是示例首页。通过上方导航切换到各个页面。
                <button onClick={() => dispatch(increment())}>增加</button>
                <button onClick={() => dispatch(decrement())}>减少</button>
                {count}
            </Typography.Paragraph>
        </div>
    );
};

export default Home;


