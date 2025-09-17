import React, {useState} from 'react';
import EditProTable, {Column, EditableTableProps} from "./EditProTable";
interface DataType {
    id: string,
    name: string,
    age: number,
    email: string,
    job: string,
}
// 懒加载会导致无法识别组件会可传入泛型的组件，所以要避免

const TableTest: React.FC = () => {
    const [data, setData] = useState<DataType []>([
        { id: "1", name: '张三', age: 25, email: 'zhangsan@example.com', job: "react" },
        { id: "2", name: '李四', age: 30, email: 'lisi@example.com', job: "vue"},
    ]);

    const columns: Column[] = [
        { key: 'name', title: '姓名', type: 'text', required: true, editable: true, defaultValue: '' },
        { key: 'age', title: '年龄', type: 'number', required: true, editable: true, defaultValue: 0 },
        { key: 'email', title: '邮箱', type: 'email', editable: true, defaultValue: '' },
        { key: 'job', title: '职业', type: 'select', editable: true,defaultValue: '', options: [{label: "react", value: "1"}, {label: "vue", value: "2"}] },
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
            validation={{ name: { min: 2 } }} // 姓名至少2位
        />
        </div>
    );
};

export default TableTest;


