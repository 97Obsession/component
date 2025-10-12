// Dashboard.tsx：主组件
import React, { useState, useEffect } from 'react';
import {Row, Col, Carousel, Table} from 'antd';
import { ColumnsType } from 'antd/es/table';
import GuangdongMap from './GuangdongMap';

// 类型定义
interface CityData {
    key: number;
    city: string;
    cards: number;
    traffic: number;
}

// 硬编码数据
const mockCityData: CityData[] = [
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

const columns: ColumnsType<CityData> = [
    { title: '地市', dataIndex: 'city', key: 'city', width: 150 },
    { title: '卡数', dataIndex: 'cards', key: 'cards', width: 150 },
    { title: '流量数 (万)', dataIndex: 'traffic', key: 'traffic', width: 150 },
];

// 轮播表格组件：每页8个地市
const CarouselTable: React.FC<{ data: CityData[] }> = ({ data }) => {
    // 分组：每组8个
    const groups: CityData[][] = [];
    for (let i = 0; i < data.length; i += 8) {
        groups.push(data.slice(i, i + 8));
    }

    const renderTable = (groupData: CityData[]) => (
        <div style={{ height: 416, padding: '16px' }}> {/* 8行高度 */}
            <Table
                columns={columns}
                dataSource={groupData}
                pagination={false}
                scroll={{ y: 400 }}
                size="small"
                bordered
                style={{ background: '#fff' }}
            />
        </div>
    );

    return (
        <Carousel
            autoplay
            autoplaySpeed={3000}
            dots={true}
            infinite
            style={{ width: '100%', height: 416 }}
        >
            {groups.map((group, index) => (
                <div key={index}>{renderTable(group)}</div>
            ))}
        </Carousel>
    );
};

const Dashboard: React.FC = () => {
    const [tableData, setTableData] = useState<CityData[]>(mockCityData);

    // 预留接口替换
    // useEffect(() => {
    //   fetch('/api/cities').then(res => res.json()).then(setTableData);
    // }, []);

    // 预留 WebSocket
    // useEffect(() => {
    //   const ws = new WebSocket('ws://example.com');
    //   ws.onmessage = (e) => setTableData(prev => [...prev, ...JSON.parse(e.data)]);
    //   return () => ws.close();
    // }, []);

    return (
        <div style={{ padding: '20px', background: '#f0f2f5' }}>
            <Row gutter={24}>
                <Col span={12}>
                    <h3>广东省地市卡流量统计轮播表</h3>
                    <CarouselTable data={tableData} />
                </Col>
                <Col span={12}>
                    <h3>广东省地图可视化</h3>
                    <GuangdongMap />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;