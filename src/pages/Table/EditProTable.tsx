// EditProTable.tsx
import React, { JSX, useState } from 'react';
import { Table, Input, Button, Popconfirm, message, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './index.less';

// 定义下拉选项类型
export interface SelectOption {
    value: string | number;
    label: string;
}

// 定义列的类型
export interface Column {
    key: string;
    title: string;
    type?: 'text' | 'number' | 'email' | 'select' | 'multipleSelect' | 'autocompleteSelect';
    required?: boolean;
    editable?: boolean;
    defaultValue?: string | number | (string | number)[];
    options?: SelectOption[];
    onSearch?: (searchText: string) => Promise<SelectOption[]>;
    width?: number | string; // 新增 width 属性，与 Ant Design ColumnsType 一致
}

// 定义验证规则
interface ValidationRule {
    required?: boolean;
    min?: number;
}

// 定义组件的 Props 类型，使用泛型
export interface EditableTableProps<TData extends Record<string, string | number | (string | number)[]>> {
    columns: Column[];
    data: TData[];
    rowKey?: keyof TData | ((record: TData) => string);
    onSave: (updatedData: TData[]) => void;
    onDelete?: (index: number) => void;
    onAdd?: (newData: TData[]) => void;
    enableAdd?: boolean;
    enableDelete?: boolean;
    autoSave?: boolean;
    validation?: Record<string, ValidationRule>;
    width?: number | string;
}

// 使用 React.FC 声明泛型组件
const EditableTable = <TData extends Record<string, string | number | (string | number)[]>>({
                                                                                                columns,
                                                                                                data,
                                                                                                rowKey = 'id',
                                                                                                onSave,
                                                                                                onDelete,
                                                                                                onAdd,
                                                                                                enableAdd = true,
                                                                                                enableDelete = true,
                                                                                                autoSave = true,
                                                                                                validation = {},
                                                                                                width,
                                                                                            }: EditableTableProps<TData>): JSX.Element => {
    const [tableData, setTableData] = useState<TData[]>(data);
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number }>({
        rowIndex: -1,
        colIndex: -1,
    });
    const [tempValue, setTempValue] = useState<string | number | (string | number)[]>('');
    const [currentOptions, setCurrentOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    // 处理单元格点击编辑
    const handleCellClick = (rowIndex: number, colIndex: number, value: string | number | (string | number)[]) => {
        if (!columns[colIndex].editable) return;
        setEditingCell({ rowIndex, colIndex });
        setTempValue(value);
        const col = columns[colIndex];
        if (col.type === 'autocompleteSelect') {
            setCurrentOptions(col.options || []);
            if (col.onSearch) {
                setLoading(true);
                col.onSearch('').then(opts => {
                    setCurrentOptions(opts);
                    setLoading(false);
                }).catch(() => setLoading(false));
            }
        }
    };

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const col = columns[editingCell.colIndex];
        setTempValue(col?.type === 'number' ? (value === '' ? '' : Number(value)) : value);
    };

    // 处理选择变化（单选和多选）
    const handleSelectChange = (value: string | number | (string | number)[]) => {
        setTempValue(value);
    };

    // 处理保存
    const handleSave = async (rowIndex: number, colIndex: number) => {
        const newValue = tempValue;
        const col = columns[colIndex];
        const key = col.key;

        if (col.required) {
            if (typeof newValue === 'string' && !newValue.trim()) {
                await message.error(`${col.title}不能为空`);
                return;
            }
            if (typeof newValue === 'number' && isNaN(newValue)) {
                await message.error(`${col.title}必须是有效的数字`);
                return;
            }
            if (Array.isArray(newValue) && newValue.length === 0) {
                await message.error(`${col.title}至少选择一项`);
                return;
            }
        }

        if (validation[key]?.min && typeof newValue === 'string' && newValue.length < validation[key].min) {
            await message.error(`${col.title}长度至少${validation[key].min}位`);
            return;
        }
        if (validation[key]?.min && typeof newValue === 'number' && newValue < validation[key].min) {
            await message.error(`${col.title}值必须大于或等于${validation[key].min}`);
            return;
        }
        if (validation[key]?.min && Array.isArray(newValue) && newValue.length < validation[key].min) {
            await message.error(`${col.title}至少选择${validation[key].min}项`);
            return;
        }

        if ((col.type === 'select' || col.type === 'multipleSelect' || col.type === 'autocompleteSelect') && col.options) {
            if (Array.isArray(newValue)) {
                if (!newValue.every(val => col.options!.some(opt => opt.value === val))) {
                    await message.error(`${col.title}必须选择有效选项`);
                    return;
                }
            } else if (!col.options.some(opt => opt.value === newValue)) {
                await message.error(`${col.title}必须选择有效选项`);
                return;
            }
        }

        const newData = [...tableData];
        newData[rowIndex][key] = newValue;
        setTableData(newData);
        if (autoSave) onSave(newData);

        setEditingCell({ rowIndex: -1, colIndex: -1 });
        setCurrentOptions([]);
    };

    // 新增行
    const handleAddRow = () => {
        const newRow: TData = { id: (tableData.length + 1).toString() } as TData;
        columns.forEach(col => {
            newRow[col.key] = col.defaultValue !== undefined ? col.defaultValue
                : col.type === 'multipleSelect' ? []
                    : (col.type === 'select' || col.type === 'autocompleteSelect') ? ''
                        : '';
        });
        const newData = [...tableData, newRow];
        setTableData(newData);
        onAdd?.(newData);
    };

    // 删除行
    const handleDeleteRow = (rowIndex: number) => {
        const newData = tableData.filter((_, index) => index !== rowIndex);
        setTableData(newData);
        onDelete?.(rowIndex);
        onSave(newData);
    };

    // 表格列配置
    const tableColumns: ColumnsType<TData> = [
        ...columns.map((col, colIndex) => ({
            title: col.title,
            dataIndex: col.key,
            key: col.key,
            width: col.width, // 应用自定义列宽
            render: (value: string | number | (string | number)[], record: TData, rowIndex: number) => {
                const isEditing = editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex;
                if (col.type === 'select' || col.type === 'multipleSelect' || col.type === 'autocompleteSelect') {
                    return isEditing ? (
                        <Select
                            mode={col.type === 'multipleSelect' ? 'multiple' : undefined}
                            showSearch={col.type === 'autocompleteSelect'}
                            filterOption={col.type === 'autocompleteSelect' ? false : true}
                            onSearch={col.type === 'autocompleteSelect' ? (searchValue) => {
                                if (col.onSearch) {
                                    setLoading(true);
                                    col.onSearch(searchValue).then(opts => {
                                        setCurrentOptions(opts);
                                        setLoading(false);
                                    }).catch(() => setLoading(false));
                                }
                            } : undefined}
                            loading={loading}
                            value={tempValue}
                            onChange={handleSelectChange}
                            onBlur={() => handleSave(rowIndex, colIndex)}
                            style={{ width: '100%' }}
                            autoFocus
                            className="editable-input"
                        >
                            {(col.type === 'autocompleteSelect' ? currentOptions : col.options)?.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    ) : (
                        <span
                            onClick={() => handleCellClick(rowIndex, colIndex, value)}
                            className={col.editable ? 'editable-cell' : ''}
                        >
                            {Array.isArray(value)
                                ? value.map(val => col.options?.find(opt => opt.value === val)?.label || val).join(', ') || '--'
                                : (col.options?.find(opt => opt.value === value)?.label || value) || '--'}
                        </span>
                    );
                }
                return isEditing ? (
                    <Input
                        type={col.type || 'text'}
                        value={tempValue as string | number}
                        onChange={handleInputChange}
                        onBlur={() => handleSave(rowIndex, colIndex)}
                        onPressEnter={() => handleSave(rowIndex, colIndex)}
                        autoFocus
                        className="editable-input"
                    />
                ) : (
                    <span
                        onClick={() => handleCellClick(rowIndex, colIndex, value)}
                        className={col.editable ? 'editable-cell' : ''}
                    >
                        {Array.isArray(value) ? value.join(', ') : value || '--'}
                    </span>
                );
            },
        })),
        ...(enableDelete
            ? [
                {
                    title: '操作',
                    key: 'action',
                    width: 100, // 为操作列设置固定宽度
                    render: (_: any, __: TData, rowIndex: number) => (
                        <Popconfirm
                            title="确认删除此行？"
                            onConfirm={() => handleDeleteRow(rowIndex)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button type="link">删除</Button>
                        </Popconfirm>
                    ),
                },
            ]
            : []),
    ];

    return (
        <div className="editable-table" style={{ width: width || '100%', overflowX: width ? 'auto' : 'visible' }}>
            <Table
                columns={tableColumns}
                dataSource={tableData}
                rowKey={rowKey}
                pagination={{ pageSize: 10 }}
                scroll={width ? { x: 'max-content' } : undefined}
            />
            {enableAdd && (
                <div className="table-actions">
                    <Button type="primary" onClick={handleAddRow}>
                        新增行
                    </Button>
                    <Button onClick={() => onSave(tableData)} style={{ marginLeft: 8 }}>
                        保存全部
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EditableTable;