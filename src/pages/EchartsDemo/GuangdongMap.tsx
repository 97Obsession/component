// GuangdongMap.tsx：修复版地图组件
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Modal } from 'antd';

interface MapData {
    name: string;
    value: number;
}

const GuangdongMap: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    const mapData: MapData[] = [
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

    // 示例 GeoJSON 数据（简化版，实际替换为完整下载的 guangdong.json）
    // 从 https://github.com/pettyferlove/guangdong-geojson/raw/master/guangdong.json 下载真实数据
    const guangdongGeoJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: '广州' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[113.25, 23.13], [113.35, 23.13], [113.35, 23.23], [113.25, 23.23], [113.25, 23.13]]], // 简化坐标示例
                },
            },
            // ... 添加其他地市 features（完整版有21+个）
            // 示例：{ type: 'Feature', properties: { name: '深圳' }, geometry: { type: 'Polygon', coordinates: [[[114.05, 22.55], ...]] } }
            // 完整数据请从 GitHub 下载并替换整个对象
        ],
    };

    useEffect(() => {
        if (chartRef.current) {
            // 注册地图数据
            echarts.registerMap('guangdong', guangdongGeoJSON);

            chartInstance.current = echarts.init(chartRef.current);
            const option = {
                backgroundColor: '#f0f2f5',
                title: {
                    text: '广东省流量热力图',
                    left: 'center',
                    textStyle: { color: '#333', fontSize: 16 },
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} 万流量',
                },
                visualMap: {
                    min: 200,
                    max: 3500,
                    left: 'left',
                    top: 'center',
                    text: ['高', '低'],
                    calculable: true,
                    inRange: {
                        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
                    },
                },
                series: [
                    {
                        name: '广东',
                        type: 'map',
                        map: 'guangdong', // 使用注册的地图
                        roam: true,
                        label: {
                            show: true,
                            color: '#333',
                        },
                        data: mapData,
                        itemStyle: {
                            emphasis: { areaColor: '#ffeb3b' },
                        },
                    },
                ],
            };

            chartInstance.current.setOption(option);

            // 点击事件
            chartInstance.current.on('click', (params) => {
                Modal.info({
                    title: `${params.name} 详情`,
                    content: (
                        <div>
                            <p>流量: {params.value} 万</p>
                            <p>卡数: {mockCityData.find(d => d.city === params.name)?.cards || 0}</p> // 注意：需导入 mockCityData
                        </div>
                    ),
                });
            });

            const resizeHandler = () => chartInstance.current?.resize();
            window.addEventListener('resize', resizeHandler);

            return () => {
                window.removeEventListener('resize', resizeHandler);
                chartInstance.current?.dispose();
            };
        }
    }, []);

    // 预留 WebSocket 更新
    // const updateMapData = (newData: MapData[]) => {
    //   chartInstance.current?.setOption({ series: [{ data: newData }] });
    // };

    return (
        <div
            ref={chartRef}
            style={{ width: '100%', height: 500, border: '1px solid #d9d9d9', borderRadius: '6px' }}
        />
    );
};

// 注意：mockCityData 需从 Dashboard 传入或全局导入
const mockCityData = [/* ... 复制上面的 mockCityData */]; // 临时导入

export default GuangdongMap;