// TableTest.tsx
import React, {useEffect, useMemo, useState} from 'react';
import EditProTable, { Column, EditableTableProps, SelectOption } from './EditProTable';
import {Button, Form, Select, Space} from "antd";
import DynamicSelectList from "./DynamicSelectList";
import axios from "axios";

interface DataType {
    id: string;
    name: string;
    age: number;
    email: string;
    job: string;
    hobby: string;
    search: string;
    date: string;
}
// 定义筛选条件的类型
interface FilterCondition {
    type: 'connected' | 'non-connected';
    aggregation: 'sum' | 'count';
}

// 定义数据项的类型（假设原始数据结构）
interface DataItem {
    id: string;
    type: 'connected' | 'non-connected';
    value: number;
    category: string;
    date: string;
}

// 示例原始数据
const initialData: DataItem[] = [
    { id: '1', type: 'connected', value: 100, category: 'A', date: '2025-09-01' },
    { id: '2', type: 'non-connected', value: 200, category: 'B', date: '2025-09-02' },
    { id: '3', type: 'connected', value: 150, category: 'A', date: '2025-09-03' },
    { id: '4', type: 'non-connected', value: 300, category: 'C', date: '2025-09-04' },
];

const TableTest: React.FC = () => {
    // Form.useForm() 是一个 React Hook，返回一个单一的 form 实例（因此用数组解构 [form]）。
    // 通过将 form 实例传递给 Form 组件的 form 属性（例如 <Form form={form}>），可以将表单的控制权绑定到这个实例。
    // const [form] = Form.useForm();
// 等价于：
//     const formInstance = Form.useForm()[0];
//     const form = formInstance;
    const [form] = Form.useForm();
    const [category, setCategory] = useState<SelectOption[]>([]);
    const [filteredData, setFilteredData] = useState<DataItem[]>(initialData);
    const [data, setData] = useState<DataType[]>(useMemo( () => [
        { id: '1', name: '张三', age: 25, email: 'zhangsan@example.com', job: 'react', hobby: '1', search: '1', date: '2025-09-18' },
        { id: '2', name: '李四', age: 30, email: 'lisi@example.com', job: 'vue', hobby: '1', search: '1', date: '2025-09-18' },
    ], []));
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log("开始请求数据");
                const response = await axios.get('/api/categories');
                if (response.data.code === 200) {
                   setCategory(response.data.data);
                }
            } catch (error) {
                console.error('获取用户列表失败:', error);
            } finally {
                console.log('finally');
            }
        };

        fetchUsers();
    }, []);
    const mockApiSearch = async (searchText: string): Promise<SelectOption[]> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const allOptions: SelectOption[] = [
            { value: '1', label: '选项 1 - Apple' },
            { value: '2', label: '选项 2 - Banana' },
            { value: '3', label: '选项 3 - Orange' },
            { value: '4', label: '选项 4 - Mango' },
        ];
        return allOptions.filter(option =>
            option.label.toLowerCase().includes(searchText.toLowerCase())
        );
    };


    const categoryColumns: Column[] = [
        {key: 'name', title: '姓名', type: 'text', required: true, editable: true, defaultValue: 'test'},
        {
            key: 'category',
            title: '分类',
            type: 'select',
            editable: true,
            options: category,
        },
        {
            key: 'subCategory',
            title: '子分类',
            type: 'select',
            editable: true,
            dependsOn: 'category', // 依赖 category 列
            getOptions: async (categoryValue) => {
                const response = await axios.get(`/api/focus-areas?category=${categoryValue}`);
                return response.data.data;
            },
        },
    ]

    const columns: Column[] = useMemo(() => [
        { key: 'name', title: '姓名', type: 'text', required: true, editable: true, defaultValue: '', width: 150, fixed: "left"}, // 设置列宽
        { key: 'age', title: '年龄', type: 'number', required: true, editable: true, defaultValue: 0, width: 100 },
        { key: 'email', title: '邮箱', type: 'email', editable: true, defaultValue: '', width: 200 },
        { key: 'job', title: '职业', type: 'select', editable: true, defaultValue: '', options: [{ label: 'react', value: '1' }, { label: 'vue', value: '2' }], width: 120 },
        { key: 'hobby', title: '爱好', type: 'multipleSelect', editable: true, defaultValue: '', options: [{ label: '游泳', value: '1' }, { label: '羽毛球', value: '2' }], width: 150 },
        {
            key: 'search',
            title: '类别',
            type: 'autocompleteSelect',
            editable: true,
            defaultValue: '',
            options: [{ label: '游泳', value: '1' }, { label: '羽毛球', value: '2' }],
            onSearch: async (searchText: string) => {
                console.log(searchText);
                return mockApiSearch(searchText);
            },
            width: 150,
        },
        {
            key: 'date',
            title: '日期',
            type: 'date',
            editable: true,
            required: true,
            format: 'YYYY-MM-DD', // 自定义日期格式
            width: 150,
        },
    ], []);

    const handleSave: (updatedData: DataType[]) => void = (updatedData: DataType[]) => {
        console.log('保存数据：', updatedData);
    };

    const handleDelete = (index: number) => {
        console.log('删除行：', index);
    };

    const handleAdd = (newData: DataType[]) => {
        console.log('新增数据：', newData);
    };

    // 处理表单提交
    const onFinish = (values: { conditions: FilterCondition[] }) => {
        let result = [...initialData];
        debugger
        // 应用筛选条件
        values.conditions.forEach((condition) => {
            // 筛选类型
            if (condition.type) {
                result = result.filter((item) => item.type === condition.type);
            }

            // 应用聚合
            if (condition.aggregation === 'sum') {
                const sum = result.reduce((acc, item) => acc + item.value, 0);
                result = [{
                    id: 'summary',
                    type: condition.type,
                    value: sum,
                    category: '汇总',
                    date: new Date().toISOString().split('T')[0], // 当前日期
                }];
            } else if (condition.aggregation === 'count') {
                const count = result.length;
                result = [{
                    id: 'summary',
                    type: condition.type,
                    value: count,
                    category: '计数',
                    date: new Date().toISOString().split('T')[0], // 当前日期
                }];
            }
        });

        setFilteredData(result);
    };
    // 动态搜索条件的输入框类型
    const metricSelectConfigs = [
        { name: 'metric', placeholder: '请选择指标', options: [{ value: 'value', label: '值' }, { value: 'count', label: '计数' }] },
        { name: 'type', placeholder: '请选择类型', options: [{ value: 'numeric', label: '数值' }, { value: 'text', label: '文本' }] },
        { name: 'value', placeholder: '请选择梳子', options: [{ value: '1', label: '梳子1' }, { value: '2', label: '梳子2' }] },
    ];

    const sumSelectConfigs = [
        { name: 'type', placeholder: '请选择类型', options: [{ value: 'connected', label: '连接出账' }, { value: 'non-connected', label: '非连接出账' }] },
        { name: 'aggregation', placeholder: '请选择聚合方式', options: [{ value: 'count', label: '计数' }, { value: 'sum', label: '求和' }] },
    ];
    return (
        <div style={{ padding: 16 }}>
            {/*<Form*/}
            {/*    form={form}*/}
            {/*    onFinish={onFinish}*/}
            {/*    initialValues={{ conditions: [{ type: '', aggregation: '' }] }}*/}
            {/*    layout="horizontal"*/}
            {/*>*/}
            {/*    <DynamicSelectList*/}
            {/*        form={form}*/}
            {/*        label="选择计算条件"*/}
            {/*        name="conditions"*/}
            {/*        selectConfigs={sumSelectConfigs}*/}
            {/*        addButtonText="增加条件"*/}
            {/*    />*/}
            {/*    <DynamicSelectList*/}
            {/*        form={form}*/}
            {/*        label="选择计算指标"*/}
            {/*        name="metrics"*/}
            {/*        selectConfigs={metricSelectConfigs}*/}
            {/*        addButtonText="增加指标"*/}
            {/*    />*/}
            {/*    <Form.Item>*/}
            {/*        /!*如果按钮的 htmlType 不是 "submit"（例如 "button"），点击按钮不会触发表单提交或 onFinish。你需要手动调用 form.submit() 来触发提交。*!/*/}
            {/*        /!*验证字段：Form 自动调用内部的验证逻辑（基于 Form.Item 的 rules 属性），检查所有字段是否符合验证规则。*!/*/}
            {/*        /!*收集表单数据：如果验证通过，Form 会收集所有字段的值，生成一个包含表单数据的对象。*!/*/}
            {/*        /!*触发 onFinish：Form 组件将收集到的数据作为参数传递给 onFinish 函数（如果提供了该属性）。*!/*/}
            {/*        <Button type="primary" htmlType="submit">*/}
            {/*            筛选*/}
            {/*        </Button>*/}
            {/*    </Form.Item>*/}
            {/*</Form>*/}
            {/*<EditProTable<DataType>*/}
            {/*    columns={columns}*/}
            {/*    rowKey={'id'}*/}
            {/*    data={data}*/}
            {/*    onSave={handleSave}*/}
            {/*    onDelete={handleDelete}*/}
            {/*    onCopy={(copiedData, originalIndex) => console.log('复制了第', originalIndex, '行:', copiedData)} // 可选回调*/}
            {/*    onAdd={handleAdd}*/}
            {/*    width={700}*/}
            {/*    actions={['delete', 'copy']} // 显示删除和复制*/}
            {/*    copyToEnd={true} // 复制到末尾*/}
            {/*    validation={{ name: { min: 2 } }}*/}
            {/*/>*/}
            <EditProTable<DataType>
                columns={categoryColumns}
                rowKey={'id'}
                data={data}
                onSave={handleSave}
                onDelete={handleDelete}
                onCopy={(copiedData, originalIndex) => console.log('复制了第', originalIndex, '行:', copiedData)}
                onAdd={handleAdd}
                width={700}
                height={400}
                actions={['delete', 'copy']}
                copyToEnd={true}
                validation={{ name: { min: 2 } }}
            />
        </div>
    );
};

export default TableTest;