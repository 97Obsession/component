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

// 初始地图数据
export const initialMapData = [
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
interface Props {
    socket?: Socket;  // 新增：接收共享 socket
    mapData: any
}
const GuangdongMap: React.FC <Props> = ({ socket,mapData }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
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

                    ],
                };

                chartInstance.current.setOption(option);

                // 点击事件
                chartInstance.current.on('click', (params) => {
                    console.log('click', params);
                    // 新增：用共享 socket 发送消息
                    if (socket && socket.connected) {
                        socket.emit('select-city', {
                            city: params?.data?.name,
                            timestamp: Date.now(),
                        });
                    } else {
                        console.warn('Socket 未连接，无法发送');
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
    }, [mapData]);  // 依赖 mapData 和 nodes，数据更新时重新渲染 option

    return (
        <div
            ref={chartRef}
            style={{ width: '100%', height: 500, border: '1px solid #d9d9d9', borderRadius: '6px' }}
        />
    );
};

export default GuangdongMap;