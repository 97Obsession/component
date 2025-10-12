// GuangdongMap.tsx：Geo-Graph 风格广东省地图（集成 Socket.io WebSocket 更新）
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Modal } from 'antd';
import io, { Socket } from 'socket.io-client';  // 新增：导入 Socket.io 客户端
import geoData from './guangdongMap.json';

interface Node {
    name: string;
    value: number;
    coord: [number, number]; // [lng, lat]
}

// 临时 mockCityData（用于 Modal）
const mockCityData = [
    { key: 1, city: '广州', cards: 1500, traffic: 2500 },
    { key: 2, city: '深圳', cards: 2000, traffic: 3500 },
    { key: 3, city: '珠海', cards: 800, traffic: 1200 },
    { key: 4, city: '汕头', cards: 600, traffic: 900 },
    { key: 5, city: '佛山', cards: 1200, traffic: 1800 },
    { key: 6, city: '韶关', cards: 400, traffic: 600 },
    { key: 7, city: '河源', cards: 300, traffic: 450 },
    { key: 8, city: '梅州', cards: 350, traffic: 500 },
    { key: 9, city: '惠州', cards: 700, traffic: 1000 },
    { key: 10, city: '汕尾', cards: 250, traffic: 350 },
    { key: 11, city: '东莞', cards: 1100, traffic: 1600 },
    { key: 12, city: '中山', cards: 900, traffic: 1300 },
    { key: 13, city: '江门', cards: 500, traffic: 750 },
    { key: 14, city: '阳江', cards: 300, traffic: 450 },
    { key: 15, city: '湛江', cards: 450, traffic: 650 },
    { key: 16, city: '茂名', cards: 400, traffic: 550 },
    { key: 17, city: '肇庆', cards: 350, traffic: 500 },
    { key: 18, city: '清远', cards: 300, traffic: 400 },
    { key: 19, city: '潮州', cards: 250, traffic: 350 },
    { key: 20, city: '揭阳', cards: 280, traffic: 400 },
    { key: 21, city: '云浮', cards: 200, traffic: 300 },
];

// 初始地图数据
const initialMapData = [
    { name: '广州', value: 2500 },
    { name: '深圳', value: 3500 },
    { name: '珠海', value: 1200 },
    { name: '汕头', value: 900 },
    { name: '佛山', value: 1800 },
    { name: '韶关', value: 600 },
    { name: '河源', value: 450 },
    { name: '梅州', value: 500 },
    { name: '惠州', value: 1000 },
    { name: '汕尾', value: 350 },
    { name: '东莞', value: 1600 },
    { name: '中山', value: 1300 },
    { name: '江门', value: 750 },
    { name: '阳江', value: 450 },
    { name: '湛江', value: 650 },
    { name: '茂名', value: 550 },
    { name: '肇庆', value: 500 },
    { name: '清远', value: 400 },
    { name: '潮州', value: 350 },
    { name: '揭阳', value: 400 },
    { name: '云浮', value: 300 },
];

// 初始节点数据（coord 固定，value 从 mapData 同步）
const initialNodes: Node[] = [
    { name: '广州', value: 2500, coord: [113.25, 23.13] },
    { name: '深圳', value: 3500, coord: [114.05, 22.55] },
    { name: '珠海', value: 1200, coord: [113.58, 22.27] },
    { name: '汕头', value: 900, coord: [116.72, 23.35] },
    { name: '佛山', value: 1800, coord: [113.12, 23.02] },
    { name: '韶关', value: 600, coord: [113.58, 24.82] },
    { name: '河源', value: 450, coord: [114.68, 23.73] },
    { name: '梅州', value: 500, coord: [116.12, 24.3] },
    { name: '惠州', value: 1000, coord: [114.4, 23.13] },
    { name: '汕尾', value: 350, coord: [115.38, 22.78] },
    { name: '东莞', value: 1600, coord: [113.75, 23.02] },
    { name: '中山', value: 1300, coord: [113.38, 22.52] },
    { name: '江门', value: 750, coord: [113.08, 22.25] },
    { name: '阳江', value: 450, coord: [111.97, 21.87] },
    { name: '湛江', value: 650, coord: [110.35, 21.27] },
    { name: '茂名', value: 550, coord: [110.93, 21.67] },
    { name: '肇庆', value: 500, coord: [112.47, 23.05] },
    { name: '清远', value: 400, coord: [113.03, 23.7] },
    { name: '潮州', value: 350, coord: [116.63, 23.68] },
    { name: '揭阳', value: 400, coord: [116.35, 23.55] },
    { name: '云浮', value: 300, coord: [112.05, 22.93] },
];

// 示例链接：模拟城市间关系（静态）
const links = [
    { source: '广州', target: '深圳' },
    { source: '广州', target: '佛山' },
    { source: '广州', target: '东莞' },
    { source: '深圳', target: '惠州' },
    { source: '深圳', target: '珠海' },
    { source: '珠海', target: '中山' },
    { source: '中山', target: '江门' },
    { source: '江门', target: '阳江' },
    { source: '汕头', target: '潮州' },
    { source: '潮州', target: '揭阳' },
];

const GuangdongMap: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const [mapData, setMapData] = useState(initialMapData);  // 新增：状态管理地图数据
    const [nodes, setNodes] = useState(initialNodes);  // 新增：状态管理节点数据（value 同步 mapData）

    // 新增：Socket.io 连接和订阅
    useEffect(() => {
        const socket: Socket = io('http://localhost:8080');  // 连接服务器

        socket.on('connect', () => {
            console.log('Socket.io 连接成功 (地图)');
            // 订阅地图频道
            socket.emit('subscribe', ['map-channel']);
        });

        // 接收更新消息
        socket.on('update', (payload) => {
            if (payload.channel === 'map-channel') {
                console.log('收到地图数据更新:', payload.data);
                setMapData(payload.data);  // 更新地图数据（颜色/标签自动响应）

                // 同步 nodes value（保持 coord 不变）
                const updatedNodes = initialNodes.map((node) => {
                    const newValue = payload.data.find((d: any) => d.name === node.name)?.value || node.value;
                    return { ...node, value: newValue };
                });
                setNodes(updatedNodes);
            }
        });

        // 错误处理
        socket.on('connect_error', (error) => {
            console.error('Socket.io 连接错误 (地图):', error);
        });

        // Cleanup：组件卸载时断开
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const initMap = async () => {
            if (chartRef.current) {
                chartInstance.current = echarts.init(chartRef.current);

                try {
                    echarts.registerMap('guangdong', geoData);
                } catch (error) {
                    console.error('加载广东地图数据失败:', error);
                }

                const option = {
                    backgroundColor: '#f0f2f5',
                    title: {
                        text: '广东省城市关系图 (Geo-Graph)',
                        left: 'center',
                        textStyle: { color: '#333', fontSize: 16 },
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: (params: any) => {
                            if (params.seriesType === 'graph') {
                                return `${params.name}<br/>流量: ${params.data.value} 万`;
                            }
                            return `${params.name}<br/>流量: ${params.value} 万`;
                        },
                    },
                    // 新增：visualMap 颜色渐变（蓝到红）
                    visualMap: {
                        min: 200,
                        max: 3500,
                        left: 'left',
                        top: 'center',
                        text: ['高 (红色)', '低 (蓝色)'],
                        calculable: true,
                        inRange: {
                            color: [
                                '#313695', // 深蓝 (低值)
                                '#4575b4',
                                '#74add1',
                                '#abd9e9',
                                '#e0f3f8', // 浅蓝
                                '#ffffbf', // 黄
                                '#fee090',
                                '#fdae61',
                                '#f46d43',
                                '#d73027',
                                '#a50026'  // 深红 (高值)
                            ],
                        },
                    },
                    geo: {
                        map: 'guangdong',
                        roam: true,
                        itemStyle: {
                            areaColor: '#e0f3f8',
                            borderColor: '#91ced4',
                        },
                        emphasis: {
                            areaColor: '#ffffbf',
                        },
                    },
                    series: [
                        // 背景地图：应用 visualMap 颜色渐变，并显示数据标签
                        {
                            type: 'map',
                            map: 'guangdong',
                            geoIndex: 0,
                            data: mapData,  // 使用动态状态
                            roam: true,
                            // 新增：label 显示数据值
                            label: {
                                show: true,
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 'bold',
                                formatter: '{@[1]}',  // 显示 value (mapData 的第二个字段)
                                position: 'inside',  // 标签位置在块内
                            },
                            // 强调样式
                            emphasis: {
                                itemStyle: {
                                    areaColor: '#ffeb3b',
                                },
                                label: {
                                    show: true,
                                    color: '#000',
                                    fontSize: 12,
                                },
                            },
                        },
                        // Graph 关系图：节点和边（保持原样，可选应用 visualMap 到节点）
                        // {
                        //     type: 'graph',
                        //     coordinateSystem: 'geo',
                        //     geoIndex: 0,
                        //     zlevel: 1,
                        //     label: {
                        //         show: true,
                        //         formatter: '{b}',
                        //         color: '#333',
                        //         fontSize: 12,
                        //     },
                        //     symbolSize: (val: number) => Math.sqrt(val / 10),
                        //     itemStyle: {
                        //         color: (params: any) => {
                        //             const max = 3500;
                        //             const min = 200;
                        //             const ratio = (params.data.value - min) / (max - min);
                        //             const colors = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf'];
                        //             return colors[Math.floor(ratio * (colors.length - 1))];
                        //         },
                        //     },
                        //     lineStyle: {
                        //         color: '#91ced4',
                        //         width: 1,
                        //         curveness: 0.2,
                        //     },
                        //     data: nodes,  // 使用动态状态
                        //     links: links.map((link) => ({
                        //         source: link.source,
                        //         target: link.target,
                        //     })),
                        //     roam: true,
                        // },
                    ],
                };

                chartInstance.current.setOption(option);

                // 点击事件
                chartInstance.current.on('click', (params) => {
                    if (params.seriesType === 'graph' || params.seriesType === 'map') {
                        const name = params.name;
                        const value = mapData.find((d) => d.name === name)?.value || params.value;
                        Modal.info({
                            title: `${name} 详情`,
                            content: (
                                <div>
                                    <p>流量: {value} 万</p>
                                    <p>卡数: {mockCityData.find((d) => d.city === name)?.cards || 0}</p>
                                    <p>坐标: {nodes.find((n) => n.name === name)?.coord?.join(', ') || 'N/A'}</p>
                                </div>
                            ),
                        });
                    }
                });

                const resizeHandler = () => chartInstance.current?.resize();
                window.addEventListener('resize', resizeHandler);

                return () => {
                    window.removeEventListener('resize', resizeHandler);
                    chartInstance.current?.dispose();
                };
            }
        };

        initMap();
    }, [mapData, nodes]);  // 依赖 mapData 和 nodes，数据更新时重新渲染 option

    return (
        <div
            ref={chartRef}
            style={{ width: '100%', height: 500, border: '1px solid #d9d9d9', borderRadius: '6px' }}
        />
    );
};

export default GuangdongMap;