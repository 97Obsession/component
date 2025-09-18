import React, {useState} from 'react';
import EditProTable, {Column, EditableTableProps, SelectOption} from "./EditProTable";
interface DataType {
    id: string,
    name: string,
    age: number,
    email: string,
    job: string,
    hobby: string,
    search: string
}
// 懒加载会导致无法识别组件会可传入泛型的组件，所以要避免

const TableTest: React.FC = () => {
    const [data, setData] = useState<DataType []>([
        { id: "1", name: '张三', age: 25, email: 'zhangsan@example.com', job: "react", hobby: "1" , search: "1"},
        { id: "2", name: '李四', age: 30, email: 'lisi@example.com', job: "vue", hobby: "1" , search: "1"},
    ]);
    const mockApiSearch = async (searchText: string): Promise<SelectOption[]> => {
        // 模拟异步请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        const allOptions: SelectOption[] = [
            { value: '1', label: '选项 1 - Apple' },
            { value: '2', label: '选项 2 - Banana' },
            { value: '3', label: '选项 3 - Orange' },
            { value: '4', label: '选项 4 - Mango' },
        ];
        // 根据输入过滤（实际中应调用后端 API）
        return allOptions.filter(option =>
            option.label.toLowerCase().includes(searchText.toLowerCase())
        );
    };
    const columns: Column[] = [
        { key: 'name', title: '姓名', type: 'text', required: true, editable: true, defaultValue: '' },
        { key: 'age', title: '年龄', type: 'number', required: true, editable: true, defaultValue: 0 },
        { key: 'email', title: '邮箱', type: 'email', editable: true, defaultValue: '' },
        { key: 'job', title: '职业', type: 'select', editable: true,defaultValue: '', options: [{label: "react", value: "1"}, {label: "vue", value: "2"}] },
        { key: 'hobby', title: '爱好', type: 'multipleSelect', editable: true,defaultValue: '', options: [{label: "游泳", value: "1"}, {label: "羽毛球", value: "2"}] },
        {
            key: 'search',
            title: '类别',
            type: 'autocompleteSelect',
            editable: true,
            defaultValue: '',
            options: [{label: "游泳", value: "1"}, {label: "羽毛球", value: "2"}],
            onSearch: async (searchText: string) => {
                console.log(searchText);
                return mockApiSearch(searchText);
            },
        },
    ];

    const handleSave:(updatedData: DataType[]) => void = (updatedData: DataType[]) => {
        // setData(updatedData);
        console.log('保存数据：', updatedData); // 发送到API
    };

    const handleDelete = (index: number) => {
        console.log('删除行：', index);
    };

    const handleAdd = (newData: DataType[]) => {
        console.log('新增数据：', newData);
    };
    return (
        <div style={{ padding: 16 }}>
            <EditProTable<DataType> // 懒加载会导致泛型无法传入
            columns={columns}
            rowKey={"id"}
            data={data}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAdd}
            width={700}
            validation={{ name: { min: 2 } }} // 姓名至少2位
        />
        </div>
    );
};

export default TableTest;


