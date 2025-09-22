import React, { JSX, useState } from 'react';
import { Table, Input, Button, Popconfirm, message, Select, DatePicker } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './index.less';
import dayjs from 'dayjs';

// 定义下拉选项类型
export interface SelectOption {
    value: string | number;
    label: string;
}

// 定义列的类型
export interface Column {
    key: string;
    title: string;
    type?: 'text' | 'number' | 'email' | 'select' | 'multipleSelect' | 'autocompleteSelect' | 'date';
    required?: boolean;
    editable?: boolean;
    defaultValue?: string | number | (string | number)[];
    options?: SelectOption[];
    onSearch?: (searchText: string) => Promise<SelectOption[]>;
    width?: number | string;
    fixed?: 'left' | 'right';
    format?: string;
    dependsOn?: string;
    getOptions?: (dependentValue: string | number | (string | number)[]) => Promise<SelectOption[]> | SelectOption[];
}

// 定义验证规则
interface ValidationRule {
    required?: boolean;
    min?: number;
}

// 定义操作类型
type ActionType = 'delete' | 'copy';

// 定义组件的 Props 类型
export interface EditableTableProps<TData extends Record<string, string | number | (string | number)[]>> {
    columns: Column[];
    data: TData[];
    rowKey?: keyof TData | ((record: TData) => string);
    onSave: (updatedData: TData[]) => void;
    onDelete?: (index: number) => void;
    onAdd?: (newData: TData[]) => void;
    onCopy?: (copiedData: TData[], originalIndex: number) => void;
    enableAdd?: boolean;
    enableDelete?: boolean;
    enableCopy?: boolean;
    actions?: ActionType[];
    copyToEnd?: boolean;
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
                                                                                                onCopy,
                                                                                                enableAdd = true,
                                                                                                enableDelete = true,
                                                                                                enableCopy = true,
                                                                                                actions = ['delete', 'copy'],
                                                                                                copyToEnd = true,
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
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, SelectOption[]>>({});

    // 辅助函数：判断值是否为空
    const isEmptyValue = (value: string | number | (string | number)[]) => {
        if (typeof value === 'string') return !value.trim();
        if (typeof value === 'number') return isNaN(value);
        if (Array.isArray(value)) return value.length === 0;
        return !value;
    };

    // 处理单元格点击编辑
    const handleCellClick = (rowIndex: number, colIndex: number, value: string | number | (string | number)[]) => {
        const col = columns[colIndex];
        if (!col.editable) return;

        // 检查依赖列值
        if (col.dependsOn) {
            const dependentValue = tableData[rowIndex][col.dependsOn];
            if (isEmptyValue(dependentValue)) {
                const dependCol = columns.find(c => c.key === col.dependsOn);
                message.warning(`请先选择${dependCol?.title || '依赖列'}`);
                return;
            }
        }

        setEditingCell({ rowIndex, colIndex });
        setTempValue(value);
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

    // 处理选择变化
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
        if (col.type === 'date' && !newValue) {
            await message.error(`${col.title}必须选择一个有效日期`);
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

        if (col.type === 'date' && newValue) {
            if (!dayjs(newValue, col.format || 'YYYY-MM-DD', true).isValid()) {
                await message.error(`${col.title}必须是有效的日期格式`);
                return;
            }
        }

        const newData = [...tableData];
        newData[rowIndex][key] = newValue;
        setTableData(newData);

        // 检查是否有列依赖当前列的值
        const dependentColumns = columns.filter(c => c.dependsOn === key);
        for (const depCol of dependentColumns) {
            if (depCol.getOptions) {
                const options = await depCol.getOptions(newValue);
                setDynamicOptions(prev => ({
                    ...prev,
                    [depCol.key]: Array.isArray(options) ? options : [],
                }));
            }
        }
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

    // 复制行
    const handleCopyRow = (rowIndex: number) => {
        const newData = [...tableData];
        const copiedRow: TData = { ...newData[rowIndex] };
        if (typeof rowKey === 'string') {
            copiedRow[rowKey] = (tableData.length + 1).toString();
        } else if (typeof rowKey === 'function') {
            const newId = rowKey(newData[rowIndex]);
            copiedRow[rowKey as any] = newId;
        }
        if (copyToEnd) {
            newData.push(copiedRow);
        } else {
            newData.unshift(copiedRow);
        }
        setTableData(newData);
        onCopy?.(newData, rowIndex);
        if (autoSave) onSave(newData);
        message.success('行复制成功');
    };

    // 处理日期变化
    const handleDateChange = (date: dayjs.Dayjs | null, dateString: string | string[]) => {
        setTempValue(Array.isArray(dateString) ? dateString[0] : dateString);
    };

    // 表格列配置
    const tableColumns: ColumnsType<TData> = [
        ...columns.map((col, colIndex) => ({
            title: col.title,
            dataIndex: col.key,
            key: col.key,
            width: col.width,
            fixed: col.fixed,
            render: (value: string | number | (string | number)[], record: TData, rowIndex: number) => {
                const isEditing = editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex;
                const currentColumnOptions = col.dependsOn ? dynamicOptions[col.key] || col.options || [] : col.options || [];

                // 计算是否可编辑：列本身可编辑 且 (无依赖 或 依赖列值不为空)
                const isEditable = col.editable && (!col.dependsOn || !isEmptyValue(record[col.dependsOn]));

                if (col.type === 'select' || col.type === 'multipleSelect' || col.type === 'autocompleteSelect') {
                    return isEditing ? (
                        <Select
                            mode={col.type === 'multipleSelect' ? 'multiple' : undefined}
                            showSearch={col.type === 'autocompleteSelect'}
                            filterOption={col.type === 'autocompleteSelect' ? false : true}
                            onSearch={col.type === 'autocompleteSelect' && !col.dependsOn ? (searchValue) => {
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
                            disabled={!isEditable} // 新增：动态设置 Select 的 disabled 属性
                        >
                            {(col.type === 'autocompleteSelect' && !col.dependsOn ? currentOptions : currentColumnOptions).map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    ) : (
                        <span
                            onClick={isEditable ? () => handleCellClick(rowIndex, colIndex, value) : undefined}
                            className={isEditable ? 'editable-cell' : 'disabled-cell'}
                        >
                            {Array.isArray(value)
                                ? value.map(val => currentColumnOptions.find(opt => opt.value === val)?.label || val).join(', ') || '--'
                                : (currentColumnOptions.find(opt => opt.value === value)?.label || value) || '--'}
                        </span>
                    );
                }
                if (col.type === 'date') {
                    return isEditing ? (
                        <DatePicker
                            format={col.format || 'YYYY-MM-DD'}
                            value={tempValue ? dayjs(tempValue as string, col.format || 'YYYY-MM-DD') : null}
                            onChange={handleDateChange}
                            onBlur={() => handleSave(rowIndex, colIndex)}
                            style={{ width: '100%' }}
                            autoFocus
                            className="editable-input"
                            disabled={!isEditable} // 新增：动态设置 DatePicker 的 disabled 属性
                        />
                    ) : (
                        <span
                            onClick={isEditable ? () => handleCellClick(rowIndex, colIndex, value) : undefined}
                            className={isEditable ? 'editable-cell' : 'disabled-cell'}
                        >
                            {value || '--'}
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
                        disabled={!isEditable} // 新增：动态设置 Input 的 disabled 属性
                    />
                ) : (
                    <span
                        onClick={isEditable ? () => handleCellClick(rowIndex, colIndex, value) : undefined}
                        className={isEditable ? 'editable-cell' : 'disabled-cell'}
                    >
                        {Array.isArray(value) ? value.join(', ') : value || '--'}
                    </span>
                );
            },
        })),
        ...(actions && actions.length > 0
            ? [
                {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    fixed: 'right' as const,
                    render: (_: any, __: TData, rowIndex: number) => (
                        <div>
                            {actions.includes('delete') && (
                                <Popconfirm
                                    title="确认删除此行？"
                                    onConfirm={() => handleDeleteRow(rowIndex)}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    <Button type="link" style={{ marginRight: 8 }}>删除</Button>
                                </Popconfirm>
                            )}
                            {actions.includes('copy') && (
                                <Button type="link" onClick={() => handleCopyRow(rowIndex)}>
                                    复制
                                </Button>
                            )}
                        </div>
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
                scroll={{ x: width || true }}
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