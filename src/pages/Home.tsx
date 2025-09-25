// import React from 'react';
// import { Typography } from 'antd';
// import { increment, decrement, incrementByAmount } from '../redux/counterSlice';
// import { useSelector, useDispatch } from 'react-redux';
// const Home: React.FC = () => {
//     // 使用 useSelector 获取 counter 状态
//     const count = useSelector((state:any ) => state.counter.value);
//     // 使用 useDispatch 获取 dispatch 函数
//     const dispatch = useDispatch();
//     return (
//         <div style={{ padding: 16 }}>
//             <Typography.Title level={3}>首页</Typography.Title>
//             <Typography.Paragraph>
//                 这是示例首页。通过上方导航切换到各个页面。
//                 <button onClick={() => dispatch(increment())}>增加</button>
//                 <button onClick={() => dispatch(decrement())}>减少</button>
//                 {count}
//             </Typography.Paragraph>
//         </div>
//     );
// };
//
// export default Home;

// 首先，确保已安装必要的包：
// npm install echarts

import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { debounce } from 'lodash';

/**
 * 自定义的 ECharts 包装组件，类似于 echarts-for-react。
 * 这个组件封装了 ECharts 的初始化、更新和销毁逻辑，以实现高性能。
 * 它使用 useRef 来管理 DOM 和图表实例，避免不必要的重新渲染。
 * 支持主题切换和选项更新时的高效合并。
 * 为性能优化：
 * - 只在组件挂载时初始化图表。
 * - 在选项变化时使用 setOption 更新，而不重新初始化。
 * - 添加窗口 resize 监听器，确保图表响应式调整大小。
 * - 在卸载时销毁图表实例，释放资源。
 * @param {Object} props
 * @param {Object} props.option - ECharts 的配置选项。
 * @param {Object} [props.style={ height: '400px', width: '100%' }] - 图表的样式。
 * @param {string} [props.theme='light'] - ECharts 主题。
 */
const EChartsWrapper = ({ option, style = { height: '400px', width: '100%'}, theme = 'light' }) => {
    // 使用 useRef 保存 DOM 引用和图表实例，避免状态变化导致重新渲染
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 初始化图表和 resize 监听器（仅在 theme 变化时重新初始化）
    useEffect(() => {
        if (chartRef.current) {
            // 初始化 ECharts 实例
            chartInstance.current = echarts.init(chartRef.current, theme);
            // 设置初始选项
            chartInstance.current.setOption(option);
        }

        // 防抖处理：避免窗口resize时频繁触发
        const debounceResize = debounce(() => {
            if (chartInstance.current) {
                // 先获取容器最新尺寸，再执行resize
                const container = chartRef.current;
                if (container) {
                    const { width, height } = container.getBoundingClientRect();
                    console.log("resize",width, height);
                    // 只有尺寸变化时才执行resize（避免无效操作）
                    if (width > 0 && height > 0) {
                        chartInstance.current.resize({ width, height });
                    }
                }
            }
        }, 100); // 100ms防抖延迟
        // offsetWidth是 dom元素属性 = 内容+内边距+边框，transform不影响它的值，且它是整数值，且受box-sizing的影响
        // getBoundingClientRect 是 dom元素方法 = 元素相对于视口的位置和尺寸信息  width 和 height 会包含 transform 缩放后的实际显示尺寸（例如 transform: scale(0.5) 会使返回的宽高为原尺寸的一半），且是浮点数（更精确）
        window.addEventListener('resize', debounceResize);

        // 清理函数：在组件卸载时销毁图表并移除监听器，防止内存泄漏
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
            window.removeEventListener('resize', debounceResize);
        };
    }, [theme]); // 依赖 theme，如果 theme 变化则重新初始化

    // 当 option 变化时，更新图表（不重新初始化整个实例，提高性能）
    useEffect(() => {
        if (chartInstance.current) {
            // 使用 notMerge: true 来完全替换选项，避免旧数据残留
            // 如果需要合并旧选项，可以设置为 false
            chartInstance.current.setOption(option, { notMerge: true });
        }
    }, [option]); // 仅依赖 option 变化

    // 返回 DOM 容器
    return <div ref={chartRef} style={style} />;
};

/**
 * 示例1: 折线图组件，使用静态数据初始化，并预留 WebSocket 接口。
 * 这个组件独立管理自己的数据状态，便于后续扩展多个图表。
 * 为性能优化：数据变化时只更新 option 中的 data 部分，不重绘整个图表。
 */
const LineChart = () => {
    // 使用 useState 管理数据状态，初始为静态数据
    const [data, setData] = useState([10, 52, 200, 334, 390, 330, 220]);
    const wsRef = useRef<WebSocket | null>(null); // 用 ref 保存 WebSocket 实例，避免重复创建
    useEffect(() => {
        // 连接本地 WebSocket 服务
        wsRef.current = new WebSocket('ws://localhost:8080');
        console.log("创建websocketå");
        // 连接成功回调
        wsRef.current.onopen = () => {
            console.log('LineChart 已连接到 WebSocket 服务');
            // 可选：向服务端发送初始化消息
            wsRef.current?.send('LineChart 准备就绪');
        };
        // 接收服务端消息（实时更新图表数据）
        wsRef.current.onmessage = (event) => {
            try {
                // 解析服务端发送的JSON数据
                const data = JSON.parse(event.data);
                console.log("data" , data);
                setData(data.temperature);
                // 只处理包含温度数据的消息
                // if (typeof data.temperature === 'number') {
                //     // 更新图表数据（保留最近20条）
                //     setChartData(prev => {
                //         // 格式化时间（只显示时分秒）
                //         const timeStr = new Date(data.timestamp).toLocaleTimeString();
                //
                //         // 新增数据并截断旧数据
                //         const newTimestamps = [...prev.timestamps, timeStr].slice(-20);
                //         const newTemperatures = [...prev.temperatures, data.temperature].slice(-20);
                //
                //         return { timestamps: newTimestamps, temperatures: newTemperatures };
                //     });
                // }
            } catch (error) {
                console.error('解析WebSocket数据失败:', error);
            }
        };

        // 连接关闭回调
        wsRef.current.onclose = () => {
            console.log('WebSocket 连接已关闭');
            // 断线重连逻辑
            setTimeout(() => {
                console.log('尝试重新连接...');
                // 重新初始化连接（利用ref重新赋值触发effect）
                wsRef.current = new WebSocket('ws://localhost:8080');
            }, 3000);
        };


        // 错误处理
        wsRef.current.onerror = (error) => {
            console.error('LineChart WebSocket 错误:', error);
        };

        // 组件卸载时关闭连接
        return () => {
            wsRef.current?.close();
        };
    }, []);

    // ECharts 配置选项
    const option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // X 轴类别数据
        },
        yAxis: {
            type: 'value' // Y 轴数值类型
        },
        series: [
            {
                data: data, // 使用状态中的数据
                type: 'line', // 图表类型：折线图
                smooth: true // 启用平滑曲线
            }
        ]
    };

    // 返回包装组件
    return <EChartsWrapper option={option} />;
};

/**
 * 示例2: 柱状图组件，使用静态数据初始化，并预留 WebSocket 接口。
 * 类似 LineChart，独立状态管理，便于复用和扩展。
 */
const BarChart = () => {
    // 使用 useState 管理数据状态，初始为静态数据
    const [data, setData] = useState([120, 200, 150, 80, 70, 110, 130]);
    useEffect(() => {
     console.log("柱状图渲染了");
    });
    // 预留 WebSocket 集成代码（注释掉，便于后续启用）
    // useEffect(() => {
    //   const ws = new WebSocket('ws://your-websocket-url');
    //   ws.onmessage = (event) => {
    //     const newData = JSON.parse(event.data); // 假设 newData 是数组 [value1, value2, ...]
    //     setData(newData);
    //   };
    //   return () => ws.close();
    // }, []);

    // ECharts 配置选项
    const option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // X 轴类别数据
        },
        yAxis: {
            type: 'value' // Y 轴数值类型
        },
        series: [
            {
                data: data, // 使用状态中的数据
                type: 'bar' // 图表类型：柱状图
            }
        ]
    };

    // 返回包装组件
    return <EChartsWrapper option={option} />;
};

/**
 * 示例3: 饼图组件，使用静态数据初始化，并预留 WebSocket 接口。
 * 类似其他图表，独立状态管理。
 */
const PieChart = () => {
    // 使用 useState 管理数据状态，初始为静态数据
    const [data, setData] = useState([
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
    ]);
    useEffect(() => {
        console.log("饼图渲染了");
    });

    // 预留 WebSocket 集成代码（注释掉，便于后续启用）
    // useEffect(() => {
    //   const ws = new WebSocket('ws://your-websocket-url');
    //   ws.onmessage = (event) => {
    //     const newData = JSON.parse(event.data); // 假设 newData 是对象数组 [{value: num, name: str}, ...]
    //     setData(newData);
    //   };
    //   return () => ws.close();
    // }, []);

    // ECharts 配置选项
    const option = {
        tooltip: {
            trigger: 'item' // 提示框触发类型：项触发
        },
        legend: {
            top: '5%', // 图例位置
            left: 'center'
        },
        series: [
            {
                name: 'Access From', // 系列名称
                type: 'pie', // 图表类型：饼图
                radius: ['40%', '70%'], // 饼图内外半径
                avoidLabelOverlap: false, // 避免标签重叠
                itemStyle: {
                    borderRadius: 10, // 扇区圆角
                    borderColor: '#fff', // 边框颜色
                    borderWidth: 2 // 边框宽度
                },
                label: {
                    show: false, // 默认不显示标签
                    position: 'center' // 标签位置
                },
                emphasis: {
                    label: {
                        show: true, // 强调时显示标签
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false // 不显示标签线
                },
                data: data // 使用状态中的数据
            }
        ]
    };

    // 返回包装组件
    return <EChartsWrapper option={option} />;
};

/**
 * 主应用组件，用于渲染多个图表示例。
 * 在实际项目中，可以将每个图表组件拆分到单独的文件中（如 LineChart.js、BarChart.js 等），
 * 以便于维护和扩展更多图表类型。
 * 例如：
 * - src/components/EChartsWrapper.js
 * - src/components/LineChart.js
 * - src/components/BarChart.js
 * - src/components/PieChart.js
 * - src/App.js（导入并渲染它们）
 */
function Home() {
    return (
        <div style={{width: '100vw', height: '100vh', overflow: 'hidden', padding: '2vmin', boxSizing: 'border-box'}}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '60vh',
                justifyContent: 'space-between',
                // flexShrink: 1,
                // flexGrow: 1,
            }}>
                {/*echarts图表依赖于父容器的宽度，主要是因为为了做宽度变化时，图表的扩张*/}
                <LineChart/>
                <BarChart/>
                <PieChart/>
            </div>
        </div>
    );
}

export default Home;
