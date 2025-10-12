import React, { JSX, useCallback, useEffect, useMemo, useReducer } from 'react';
import { Table, Input, Button, Popconfirm, message, Select, DatePicker } from 'antd';
import { ColumnsType } from 'antd/es/table';
import '../index.less';
import dayjs from 'dayjs';
import tableReducer, {TableState} from "./tableReducer";

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
export interface ValidationRule {
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




// 辅助函数：判断值是否为空
const isEmptyValue = (value: string | number | (string | number)[]) => {
    if (typeof value === 'string') return !value.trim();
    if (typeof value === 'number') return isNaN(value);
    if (Array.isArray(value)) return value.length === 0;
    return !value;
};

// Reducer 函数


// 单元格编辑组件（保持不变）
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

// 主组件
const EditableTable = React.memo(<TData extends Record<string, string | number | (string | number)[]>>({
                                                                                                           columns,
                                                                                                           data,
                                                                                                           rowKey = 'id',
                                                                                                           onSave,
                                                                                                           onDelete,
                                                                                                           onAdd,
                                                                                                           onCopy,
                                                                                                           enableAdd = true,
                                                                                                           actions = ['delete', 'copy'],
                                                                                                           copyToEnd = true,
                                                                                                           autoSave = true,
                                                                                                           validation = {},
                                                                                                           width,
                                                                                                       }: EditableTableProps<TData>): JSX.Element => {
    // 初始化状态
    const initialState: TableState<TData> = {
        tableData: data,
        editingRowIndex: -1,
        tempRowData: null,
        currentOptions: [],
        loading: false,
        dynamicOptions: {},
        lastCopiedRowIndex: null,
    };

    // 使用 useReducer
    const [state, dispatch] = useReducer(tableReducer, initialState);

    // 同步外部 data 到内部 state
    useEffect(() => {
        dispatch({ type: 'SYNC_DATA', payload: data });
    }, [data]);

    // 处理编辑行时的异步选项加载
    useEffect(() => {
        if (state.editingRowIndex === -1 || !state.tempRowData) return;

        columns.forEach(col => {
            // 加载 autocompleteSelect 的初始选项
            if (col.type === 'autocompleteSelect' && col.onSearch && !col.dependsOn) {
                dispatch({ type: 'SET_LOADING', payload: true });
                col.onSearch('').then(opts => {
                    dispatch({ type: 'SET_CURRENT_OPTIONS', payload: opts });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }).catch(() => {
                    dispatch({ type: 'SET_LOADING', payload: false });
                });
            }
            // 加载依赖列的动态选项
            if (col.dependsOn && col.getOptions && !isEmptyValue(state.tempRowData[col.dependsOn])) {
                dispatch({ type: 'SET_LOADING', payload: true });
                col.getOptions(state.tempRowData[col.dependsOn]).then(options => {
                    dispatch({ type: 'SET_DYNAMIC_OPTIONS', payload: { key: col.key, options: Array.isArray(options) ? options : [] } });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }).catch(() => {
                    dispatch({ type: 'SET_LOADING', payload: false });
                });
            }
        });
    }, [state.editingRowIndex, state.tempRowData, columns]);

    // 处理单元格值变化时的依赖列选项加载
    const handleCellChange = useCallback((key: string, value: string | number | (string | number)[]) => {
        dispatch({ type: 'UPDATE_CELL', payload: { key, value } });
        // 检查依赖列并加载动态选项
        const dependentColumns = columns.filter(c => c.dependsOn === key);
        for (const depCol of dependentColumns) {
            if (depCol.getOptions && !isEmptyValue(value)) {
                dispatch({ type: 'SET_LOADING', payload: true });
                depCol.getOptions(value).then(options => {
                    dispatch({ type: 'SET_DYNAMIC_OPTIONS', payload: { key: depCol.key, options: Array.isArray(options) ? options : [] } });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }).catch(() => {
                    dispatch({ type: 'SET_LOADING', payload: false });
                });
            }
        }
    }, [columns]);

    // 处理日期变化
    const handleDateChange = useCallback((key: string) => (date: dayjs.Dayjs | null, dateString: string | string[]) => {
        dispatch({ type: 'UPDATE_CELL', payload: { key, value: Array.isArray(dateString) ? dateString[0] : dateString } });
    }, []);

    // 处理复制行
    const handleCopyRow = useCallback((rowIndex: number) => {
        const newTableData = [...state.tableData];
        const copiedRow: TData = { ...newTableData[rowIndex] };
        if (typeof rowKey === 'string') {
            copiedRow[rowKey] = (newTableData.length + 1).toString();
        } else if (typeof rowKey === 'function') {
            const newId = rowKey(newTableData[rowIndex]);
            copiedRow[rowKey as any] = newId;
        }
        dispatch({ type: 'COPY_ROW', payload: { rowIndex, rowKey, copyToEnd, tempRowData: copiedRow, onCopy, onSave, autoSave } });
    }, [state.tableData, rowKey, copyToEnd, onCopy, onSave, autoSave]);

    // 表格列配置
    const tableColumns: ColumnsType<TData> = useMemo(() => [
        ...columns.map((col) => ({
            title: col.title,
            dataIndex: col.key,
            key: col.key,
            width: col.width,
            fixed: col.fixed,
            render: (value: string | number | (string | number)[], record: TData, rowIndex: number) => {
                const isEditing = state.editingRowIndex === rowIndex && col.editable;
                const currentColumnOptions = col.dependsOn ? state.dynamicOptions[col.key] || col.options || [] : col.options || [];
                const isEditable = col.editable && (!col.dependsOn || (isEditing && state.tempRowData ? !isEmptyValue(state.tempRowData[col.dependsOn]) : !isEmptyValue(record[col.dependsOn])));

                return isEditing ? (
                    <CellEditor
                        col={col}
                        value={state.tempRowData ? state.tempRowData[col.key] : value}
                        currentOptions={col.type === 'autocompleteSelect' && !col.dependsOn ? state.currentOptions : currentColumnOptions}
                        loading={state.loading}
                        isEditable={isEditable}
                        onChange={(newValue) => handleCellChange(col.key, newValue)}
                        onSearch={col.onSearch ? (searchValue) => {
                            dispatch({ type: 'SET_LOADING', payload: true });
                            col.onSearch!(searchValue).then(opts => {
                                dispatch({ type: 'SET_CURRENT_OPTIONS', payload: opts });
                                dispatch({ type: 'SET_LOADING', payload: false });
                            }).catch(() => {
                                dispatch({ type: 'SET_LOADING', payload: false });
                            });
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
                    {state.editingRowIndex === rowIndex ? (
                        <>
                            <Button type="link" onClick={() => dispatch({ type: 'SAVE_ROW', payload: { rowIndex, columns, validation, onSave, autoSave } })} style={{ marginRight: 8 }}>
                                保存
                            </Button>
                            <Button type="link" onClick={() => dispatch({ type: 'CANCEL_EDIT', payload: { onSave, autoSave } })}>
                                取消
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button type="link" onClick={() => dispatch({ type: 'EDIT_ROW', payload: { rowIndex, tempRowData: { ...state.tableData[rowIndex] } } })} style={{ marginRight: 8 }}>
                                编辑
                            </Button>
                            {actions.includes('delete') && (
                                <Popconfirm
                                    title="确认删除此行？"
                                    onConfirm={() => dispatch({ type: 'DELETE_ROW', payload: { rowIndex, onDelete, onSave } })}
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
    ], [columns, state, actions, handleCellChange, handleDateChange, onSave, autoSave, onDelete, validation, handleCopyRow]);

    return (
        <div className="editable-table" style={{ width: width || '100%', overflowX: width ? 'auto' : 'visible' }}>
            <Table
                columns={tableColumns}
                dataSource={state.tableData}
                rowKey={rowKey}
                pagination={{ pageSize: 10 }}
                scroll={{ x: width || true }}
            />
            {enableAdd && (
                <div className="table-actions">
                    <Button type="primary" onClick={() => dispatch({ type: 'ADD_ROW', payload: { columns, onAdd } })}>
                        新增行
                    </Button>
                    <Button onClick={() => onSave(state.tableData)} style={{ marginLeft: 8 }}>
                        保存全部
                    </Button>
                </div>
            )}
        </div>
    );
});

export default EditableTable;