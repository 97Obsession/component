// TableTest.tsx
import React, { useState } from 'react';
import EditProTable, { Column, EditableTableProps, SelectOption } from './EditProTable';

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

const TableTest: React.FC = () => {
    const [data, setData] = useState<DataType[]>([
        { id: '1', name: '张三', age: 25, email: 'zhangsan@example.com', job: 'react', hobby: '1', search: '1', date: '2025-09-18' },
        { id: '2', name: '李四', age: 30, email: 'lisi@example.com', job: 'vue', hobby: '1', search: '1', date: '2025-09-18' },
    ]);

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

    const columns: Column[] = [
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
    ];

    const handleSave: (updatedData: DataType[]) => void = (updatedData: DataType[]) => {
        console.log('保存数据：', updatedData);
    };

    const handleDelete = (index: number) => {
        console.log('删除行：', index);
    };

    const handleAdd = (newData: DataType[]) => {
        console.log('新增数据：', newData);
    };

    return (
        <div style={{ padding: 16 }}>
            <EditProTable<DataType>
                columns={columns}
                rowKey={'id'}
                data={data}
                onSave={handleSave}
                onDelete={handleDelete}
                onCopy={(copiedData, originalIndex) => console.log('复制了第', originalIndex, '行:', copiedData)} // 可选回调
                onAdd={handleAdd}
                width={700}
                actions={['delete', 'copy']} // 显示删除和复制
                copyToEnd={true} // 复制到末尾
                validation={{ name: { min: 2 } }}
            />
        </div>
    );
};

export default TableTest;