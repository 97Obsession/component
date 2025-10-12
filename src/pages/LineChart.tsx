import React, {useEffect, useRef, useState} from "react";
import EChartsWrapper from "./EChartsWrapper";

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
export default LineChart;