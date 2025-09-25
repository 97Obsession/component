import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
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

// 单元格编辑组件
const CellEditor = React.memo<{
    col: Column;
    value: string | number | (string | number)[];
    currentOptions: SelectOption[];
    loading: boolean;
    isEditable: boolean;
    onChange: (value: string | number | (string | number)[]) => void;
    onSearch?: (searchValue: string) => void;
    onBlur: () => void;
    onDateChange: (date: dayjs.Dayjs | null, dateString: string | string[]) => void;
}>(({ col, value, currentOptions, loading, isEditable, onChange, onSearch, onBlur, onDateChange }) => {
    if (col.type === 'select' || col.type === 'multipleSelect' || col.type === 'autocompleteSelect') {
        return (
            <Select
                mode={col.type === 'multipleSelect' ? 'multiple' : undefined}
                showSearch={col.type === 'autocompleteSelect'}
                filterOption={col.type === 'autocompleteSelect' ? false : true}
                onSearch={col.type === 'autocompleteSelect' && !col.dependsOn ? onSearch : undefined}
                loading={loading}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                style={{ width: '100%' }}
                autoFocus
                className="editable-input"
                disabled={!isEditable}
            >
                {currentOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                        {option.label}
                    </Select.Option>
                ))}
            </Select>
        );
    }
    if (col.type === 'date') {
        return (
            <DatePicker
                format={col.format || 'YYYY-MM-DD'}
                value={value ? dayjs(value as string, col.format || 'YYYY-MM-DD') : null}
                onChange={onDateChange}
                onBlur={onBlur}
                style={{ width: '100%' }}
                autoFocus
                className="editable-input"
                disabled={!isEditable}
            />
        );
    }
    return (
        <Input
            type={col.type || 'text'}
            value={value as string | number}
            onChange={e => onChange(col.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
            onBlur={onBlur}
            onPressEnter={onBlur}
            autoFocus
            className="editable-input"
            disabled={!isEditable}
        />
    );
});

// 使用 React.FC 声明泛型组件
const EditableTable = React.memo(<TData extends Record<string, string | number | (string | number)[]>>({
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
    const [editingRowIndex, setEditingRowIndex] = useState<number>(-1);
    const [tempRowData, setTempRowData] = useState<TData | null>(null);
    const [currentOptions, setCurrentOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, SelectOption[]>>({});
    const [lastCopiedRowIndex, setLastCopiedRowIndex] = useState<number | null>(null);

    // 同步外部 data 到内部 state
    useEffect(() => {
        setTableData(data);
        // 如果正在编辑，退出编辑模式以避免数据不一致
        setEditingRowIndex(-1);
        setTempRowData(null);
        setLastCopiedRowIndex(null);
    }, [data]);

    // 辅助函数：判断值是否为空
    const isEmptyValue = useCallback((value: string | number | (string | number)[]) => {
        if (typeof value === 'string') return !value.trim();
        if (typeof value === 'number') return isNaN(value);
        if (Array.isArray(value)) return value.length === 0;
        return !value;
    }, []);

    // 开始编辑一行
    const handleEditRow = useCallback((rowIndex: number) => {
        setEditingRowIndex(rowIndex);
        setTempRowData({ ...tableData[rowIndex] });
        // 加载 autocompleteSelect 的初始选项
        columns.forEach(col => {
            if (col.type === 'autocompleteSelect' && col.onSearch) {
                setLoading(true);
                col.onSearch('').then(opts => {
                    setCurrentOptions(opts);
                    setLoading(false);
                }).catch(() => setLoading(false));
            }
        });
    }, [columns, tableData]);

    // 处理单元格值变化
    const handleCellChange = useCallback(async (key: string, value: string | number | (string | number)[]) => {
        setTempRowData(prev => prev ? { ...prev, [key]: value } : prev);
        // 如果更改的是依赖列，立即加载相关列的动态选项
        const dependentColumns = columns.filter(c => c.dependsOn === key);
        for (const depCol of dependentColumns) {
            if (depCol.getOptions && !isEmptyValue(value)) {
                setLoading(true);
                const options = await depCol.getOptions(value);
                setDynamicOptions(prev => ({
                    ...prev,
                    [depCol.key]: Array.isArray(options) ? options : [],
                }));
                setLoading(false);
            }
        }
    }, [columns, isEmptyValue]);

    // 处理保存行
    const handleSaveRow = useCallback(async (rowIndex: number) => {
        if (!tempRowData) return;

        // 验证所有可编辑列
        for (const col of columns) {
            const key = col.key;
            const newValue = tempRowData[key];

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
        }

        // 更新表格数据
        setTableData(prev => {
            const newData = [...prev];
            newData[rowIndex] = tempRowData;
            return newData;
        });

        // 处理依赖列（确保保存后动态选项更新）
        for (const col of columns) {
            const dependentColumns = columns.filter(c => c.dependsOn === col.key);
            for (const depCol of dependentColumns) {
                if (depCol.getOptions && !isEmptyValue(tempRowData[col.key])) {
                    const options = await depCol.getOptions(tempRowData[col.key]);
                    setDynamicOptions(prev => ({
                        ...prev,
                        [depCol.key]: Array.isArray(options) ? options : [],
                    }));
                }
            }
        }

        if (autoSave) onSave([...tableData.slice(0, rowIndex), tempRowData, ...tableData.slice(rowIndex + 1)]);
        setEditingRowIndex(-1);
        setTempRowData(null);
        setLastCopiedRowIndex(null);
        setCurrentOptions([]);
    }, [tempRowData, columns, validation, tableData, autoSave, onSave, isEmptyValue]);

    // 取消编辑
    const handleCancelEdit = useCallback(() => {
        if (lastCopiedRowIndex !== null) {
            // 如果是复制后取消，移除新行
            setTableData(prev => {
                const newData = prev.filter((_, index) => index !== lastCopiedRowIndex);
                if (autoSave) onSave(newData);
                return newData;
            });
        }
        setEditingRowIndex(-1);
        setTempRowData(null);
        setLastCopiedRowIndex(null);
        setCurrentOptions([]);
    }, [autoSave, onSave, lastCopiedRowIndex]);

    // 新增行
    const handleAddRow = useCallback(() => {
        const newRow: TData = { id: (tableData.length + 1).toString() } as TData;
        columns.forEach(col => {
            newRow[col.key] = col.defaultValue !== undefined ? col.defaultValue
                : col.type === 'multipleSelect' ? []
                    : (col.type === 'select' || col.type === 'autocompleteSelect') ? ''
                        : '';
        });
        setTableData(prev => [...prev, newRow]);
        onAdd?.([...tableData, newRow]);
    }, [columns, tableData, onAdd]);

    // 删除行
    const handleDeleteRow = useCallback((rowIndex: number) => {
        setTableData(prev => prev.filter((_, index) => index !== rowIndex));
        onDelete?.(rowIndex);
        onSave(tableData);
    }, [tableData, onDelete, onSave]);

    // 复制行并自动进入编辑状态
    const handleCopyRow = useCallback((rowIndex: number) => {
        setTableData(prev => {
            const newData = [...prev];
            const copiedRow: TData = { ...newData[rowIndex] };
            if (typeof rowKey === 'string') {
                copiedRow[rowKey] = (newData.length + 1).toString();
            } else if (typeof rowKey === 'function') {
                const newId = rowKey(newData[rowIndex]);
                copiedRow[rowKey as any] = newId;
            }
            const newRowIndex = copyToEnd ? newData.length : 0;
            const updatedData = copyToEnd ? [...newData, copiedRow] : [copiedRow, ...newData];
            // 自动进入新行的编辑模式
            setEditingRowIndex(newRowIndex);
            setTempRowData({ ...copiedRow });
            setLastCopiedRowIndex(newRowIndex);
            // 加载新行的动态选项（如 subCategory）
            columns.forEach(col => {
                if (col.type === 'autocompleteSelect' && col.onSearch) {
                    setLoading(true);
                    col.onSearch('').then(opts => {
                        setCurrentOptions(opts);
                        setLoading(false);
                    }).catch(() => setLoading(false));
                }
                if (col.dependsOn && col.getOptions && !isEmptyValue(copiedRow[col.dependsOn])) {
                    setLoading(true);
                    col.getOptions(copiedRow[col.dependsOn]).then(options => {
                        setDynamicOptions(prev => ({
                            ...prev,
                            [col.key]: Array.isArray(options) ? options : [],
                        }));
                        setLoading(false);
                    }).catch(() => setLoading(false));
                }
            });
            // 在复制后立即调用 onSave，确保父组件收到更新
            if (autoSave) onSave(updatedData);
            return updatedData;
        });
        onCopy?.(tableData, rowIndex);
        message.success('行复制成功');
    }, [tableData, rowKey, copyToEnd, onCopy, autoSave, onSave, columns, isEmptyValue]);

    // 处理日期变化
    const handleDateChange = useCallback((key: string) => (date: dayjs.Dayjs | null, dateString: string | string[]) => {
        setTempRowData(prev => prev ? { ...prev, [key]: Array.isArray(dateString) ? dateString[0] : dateString } : prev);
    }, []);

    // 表格列配置
    const tableColumns: ColumnsType<TData> = useMemo(() => [
        ...columns.map((col) => ({
            title: col.title,
            dataIndex: col.key,
            key: col.key,
            width: col.width,
            fixed: col.fixed,
            render: (value: string | number | (string | number)[], record: TData, rowIndex: number) => {
                const isEditing = editingRowIndex === rowIndex && col.editable;
                const currentColumnOptions = col.dependsOn ? dynamicOptions[col.key] || col.options || [] : col.options || [];
                // 在编辑模式下，基于 tempRowData 判断依赖列值
                const isEditable = col.editable && (!col.dependsOn || (isEditing && tempRowData ? !isEmptyValue(tempRowData[col.dependsOn]) : !isEmptyValue(record[col.dependsOn])));

                return isEditing ? (
                    <CellEditor
                        col={col}
                        value={tempRowData ? tempRowData[col.key] : value}
                        currentOptions={col.type === 'autocompleteSelect' && !col.dependsOn ? currentOptions : currentColumnOptions}
                        loading={loading}
                        isEditable={isEditable}
                        onChange={(newValue) => handleCellChange(col.key, newValue)}
                        onSearch={col.onSearch ? (searchValue) => {
                            setLoading(true);
                            col.onSearch!(searchValue).then(opts => {
                                setCurrentOptions(opts);
                                setLoading(false);
                            }).catch(() => setLoading(false));
                        } : undefined}
                        onBlur={() => {}}
                        onDateChange={handleDateChange(col.key)}
                    />
                ) : (
                    <span className="disabled-cell">
                        {Array.isArray(value)
                            ? value.map(val => currentColumnOptions.find(opt => opt.value === val)?.label || val).join(', ') || '--'
                            : (currentColumnOptions.find(opt => opt.value === value)?.label || value) || '--'}
                    </span>
                );
            },
        })),
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, __: TData, rowIndex: number) => (
                <div>
                    {editingRowIndex === rowIndex ? (
                        <>
                            <Button type="link" onClick={() => handleSaveRow(rowIndex)} style={{ marginRight: 8 }}>
                                保存
                            </Button>
                            <Button type="link" onClick={handleCancelEdit}>
                                取消
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button type="link" onClick={() => handleEditRow(rowIndex)} style={{ marginRight: 8 }}>
                                编辑
                            </Button>
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
                        </>
                    )}
                </div>
            ),
        },
    ], [columns, editingRowIndex, dynamicOptions, currentOptions, loading, tempRowData, actions, handleCellChange, handleSaveRow, handleCancelEdit, handleEditRow, handleDeleteRow, handleCopyRow, isEmptyValue]);

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
});

export default EditableTable;