import {message} from "antd";
import dayjs from "dayjs";
import {Column, SelectOption, ValidationRule} from "./EditProTable";
// 定义 Action 类型
type TableAction<TData> =
    | { type: 'SYNC_DATA'; payload: TData[] }
    | { type: 'EDIT_ROW'; payload: { rowIndex: number; tempRowData: TData } }
    | { type: 'UPDATE_CELL'; payload: { key: string; value: string | number | (string | number)[] } }
    | { type: 'SAVE_ROW'; payload: { rowIndex: number; columns: Column[]; validation: Record<string, ValidationRule>; onSave: (data: TData[]) => void; autoSave: boolean } }
    | { type: 'CANCEL_EDIT'; payload: { onSave: (data: TData[]) => void; autoSave: boolean } }
    | { type: 'ADD_ROW'; payload: { columns: Column[]; onAdd?: (data: TData[]) => void } }
    | { type: 'DELETE_ROW'; payload: { rowIndex: number; onDelete?: (index: number) => void; onSave: (data: TData[]) => void } }
    | { type: 'COPY_ROW'; payload: { rowIndex: number; rowKey: keyof TData | ((record: TData) => string); copyToEnd: boolean; tempRowData: TData; onCopy?: (data: TData[], index: number) => void; onSave: (data: TData[]) => void; autoSave: boolean } }
    | { type: 'SET_CURRENT_OPTIONS'; payload: SelectOption[] }
    | { type: 'SET_DYNAMIC_OPTIONS'; payload: { key: string; options: SelectOption[] } }
    | { type: 'SET_LOADING'; payload: boolean };

// 定义状态类型 TableState，泛型 TData 表示表格数据的类型，约束为键值对对象
export interface TableState<TData> {
    // tableData: 存储表格的完整数据，是一个 TData 类型的数组
    tableData: TData[];
    // editingRowIndex: 当前正在编辑的行索引，-1 表示没有行处于编辑状态
    editingRowIndex: number;
    // tempRowData: 当前编辑行的临时数据，保存编辑中的值，null 表示无编辑行
    tempRowData: TData | null;
    // currentOptions: 当前用于 autocompleteSelect 类型的下拉选项
    currentOptions: SelectOption[];
    // loading: 表示异步操作（如加载选项）是否正在进行
    loading: boolean;
    // dynamicOptions: 存储依赖列的动态下拉选项，键为列的 key，值为选项数组
    dynamicOptions: Record<string, SelectOption[]>;
    // lastCopiedRowIndex: 记录最近复制的行索引，用于取消复制操作时移除该行
    lastCopiedRowIndex: number | null;
}

// 定义 Reducer 函数，接收当前状态和动作，返回新的状态
// TData 泛型约束为键值对对象，值可以是 string、number 或数组
function tableReducer<TData extends Record<string, string | number | (string | number)[]>>(state: TableState<TData>, action: TableAction<TData>): TableState<TData> {
    // 根据 action 的类型进行分支处理
    switch (action.type) {
        // SYNC_DATA: 同步外部传入的表格数据到内部状态
        case 'SYNC_DATA':
            // 返回新状态，更新 tableData，并重置编辑相关状态
            return {
                ...state, // 保留其他状态字段
                tableData: action.payload, // 更新表格数据
                editingRowIndex: -1, // 重置编辑行索引
                tempRowData: null, // 清空临时数据
                lastCopiedRowIndex: null // 清空复制行索引
            };

        // EDIT_ROW: 进入某行的编辑模式
        case 'EDIT_ROW':
            // 返回新状态，设置编辑行索引和临时数据
            return {
                ...state, // 保留其他状态字段
                editingRowIndex: action.payload.rowIndex, // 设置当前编辑的行索引
                tempRowData: action.payload.tempRowData, // 设置编辑行的临时数据
                currentOptions: [], // 清空自动补全选项
                loading: false, // 重置加载状态
            };

        // UPDATE_CELL: 更新编辑行中某个单元格的值
        case 'UPDATE_CELL':
            // 如果没有临时数据（未处于编辑模式），直接返回当前状态
            if (!state.tempRowData) return state;
            // 返回新状态，更新临时数据中的指定字段
            return {
                ...state, // 保留其他状态字段
                tempRowData: {
                    ...state.tempRowData, // 复制临时数据
                    [action.payload.key]: action.payload.value // 更新指定 key 的值
                }
            };

        // SAVE_ROW: 保存编辑行的数据
        case 'SAVE_ROW': {
            // 解构 action.payload 获取必要参数
            const { rowIndex, columns, validation, onSave, autoSave } = action.payload;
            // 如果没有临时数据，直接返回当前状态
            if (!state.tempRowData) return state;

            // 验证逻辑：检查每一列的数据是否符合规则
            for (const col of columns) {
                // 获取列的 key 和临时数据中的值
                const key = col.key;
                const newValue = state.tempRowData[key];

                // 验证必填字段
                if (col.required) {
                    // 如果值是字符串且为空，显示错误提示并返回当前状态
                    if (typeof newValue === 'string' && !newValue.trim()) {
                        message.error(`${col.title}不能为空`);
                        return state;
                    }
                    // 如果值是数字且为 NaN，显示错误提示并返回当前状态
                    if (typeof newValue === 'number' && isNaN(newValue)) {
                        message.error(`${col.title}必须是有效的数字`);
                        return state;
                    }
                    // 如果值是数组且为空，显示错误提示并返回当前状态
                    if (Array.isArray(newValue) && newValue.length === 0) {
                        message.error(`${col.title}至少选择一项`);
                        return state;
                    }
                }

                // 验证最小长度/值/数量
                // 如果有最小长度要求且值是字符串且长度不足，显示错误提示
                if (validation[key]?.min && typeof newValue === 'string' && newValue.length < validation[key].min) {
                    message.error(`${col.title}长度至少${validation[key].min}位`);
                    return state;
                }
                // 如果有最小值要求且值是数字且小于要求，显示错误提示
                if (validation[key]?.min && typeof newValue === 'number' && newValue < validation[key].min) {
                    message.error(`${col.title}值必须大于或等于${validation[key].min}`);
                    return state;
                }
                // 如果有最小数量要求且值是数组且数量不足，显示错误提示
                if (validation[key]?.min && Array.isArray(newValue) && newValue.length < validation[key].min) {
                    message.error(`${col.title}至少选择${validation[key].min}项`);
                    return state;
                }
                // 如果列类型是日期且值为空，显示错误提示
                if (col.type === 'date' && !newValue) {
                    message.error(`${col.title}必须选择一个有效日期`);
                    return state;
                }

                // 验证下拉选项是否有效
                if ((col.type === 'select' || col.type === 'multipleSelect' || col.type === 'autocompleteSelect') && col.options) {
                    // 如果值是数组，检查每个值是否在选项中
                    if (Array.isArray(newValue)) {
                        if (!newValue.every(val => col.options!.some(opt => opt.value === val))) {
                            message.error(`${col.title}必须选择有效选项`);
                            return state;
                        }
                        // 如果值是单个值，检查是否在选项中
                    } else if (!col.options.some(opt => opt.value === newValue)) {
                        message.error(`${col.title}必须选择有效选项`);
                        return state;
                    }
                }

                // 验证日期格式
                if (col.type === 'date' && newValue) {
                    // 如果日期值无效，显示错误提示
                    if (!dayjs(newValue, col.format || 'YYYY-MM-DD', true).isValid()) {
                        message.error(`${col.title}必须是有效的日期格式`);
                        return state;
                    }
                }
            }

            // 更新表格数据：将临时数据保存到指定行
            const newTableData = [...state.tableData];
            newTableData[rowIndex] = state.tempRowData;
            // 如果启用了自动保存，调用 onSave 回调
            if (autoSave) onSave(newTableData);
            // 返回新状态，重置编辑相关字段
            return {
                ...state, // 保留其他状态字段
                tableData: newTableData, // 更新表格数据
                editingRowIndex: -1, // 退出编辑模式
                tempRowData: null, // 清空临时数据
                lastCopiedRowIndex: null, // 清空复制行索引
                currentOptions: [], // 清空自动补全选项
            };
        }

        // CANCEL_EDIT: 取消编辑操作
        case 'CANCEL_EDIT': {
            // 解构 action.payload 获取必要参数
            const { onSave, autoSave } = action.payload;
            // 默认保留当前表格数据
            let newTableData = state.tableData;
            // 如果有复制的行，移除该行
            if (state.lastCopiedRowIndex !== null) {
                newTableData = state.tableData.filter((_, index) => index !== state.lastCopiedRowIndex);
                // 如果启用了自动保存，调用 onSave 回调
                if (autoSave) onSave(newTableData);
            }
            // 返回新状态，重置编辑相关字段
            return {
                ...state, // 保留其他状态字段
                tableData: newTableData, // 更新表格数据
                editingRowIndex: -1, // 退出编辑模式
                tempRowData: null, // 清空临时数据
                lastCopiedRowIndex: null, // 清空复制行索引
                currentOptions: [], // 清空自动补全选项
            };
        }

        // ADD_ROW: 新增一行数据
        case 'ADD_ROW': {
            // 解构 action.payload 获取必要参数
            const { columns, onAdd } = action.payload;
            // 创建新行，初始化 id
            const newRow: TData = { id: (state.tableData.length + 1).toString() } as TData;
            // 为每一列设置默认值
            columns.forEach(col => {
                newRow[col.key] = col.defaultValue !== undefined ? col.defaultValue // 使用列定义的默认值
                    : col.type === 'multipleSelect' ? [] // 多选类型初始化为空数组
                        : (col.type === 'select' || col.type === 'autocompleteSelect') ? '' // 单选或自动补全类型初始化为空字符串
                            : ''; // 其他类型初始化为空字符串
            });
            // 将新行添加到表格数据
            const newTableData = [...state.tableData, newRow];
            // 调用 onAdd 回调通知外部
            onAdd?.(newTableData);
            // 返回新状态，更新表格数据
            return { ...state, tableData: newTableData };
        }

        // DELETE_ROW: 删除指定行
        case 'DELETE_ROW': {
            // 解构 action.payload 获取必要参数
            const { rowIndex, onDelete, onSave } = action.payload;
            // 过滤掉指定索引的行
            const newTableData = state.tableData.filter((_, index) => index !== rowIndex);
            // 调用 onDelete 回调通知外部
            onDelete?.(rowIndex);
            // 调用 onSave 回调更新外部数据
            onSave(newTableData);
            // 返回新状态，更新表格数据
            return { ...state, tableData: newTableData };
        }

        // COPY_ROW: 复制指定行并进入编辑模式
        case 'COPY_ROW': {
            // 解构 action.payload 获取必要参数
            const { rowIndex, rowKey, copyToEnd, tempRowData, onCopy, onSave, autoSave } = action.payload;
            // 复制当前表格数据
            const newTableData = [...state.tableData];
            // 计算新行的插入位置（末尾或开头）
            const newRowIndex = copyToEnd ? newTableData.length : 0;
            // 将复制的行插入到表格数据
            const updatedData = copyToEnd ? [...newTableData, tempRowData] : [tempRowData, ...newTableData];

            // 如果启用了自动保存，调用 onSave 回调
            if (autoSave) onSave(updatedData);
            // 调用 onCopy 回调通知外部
            onCopy?.(state.tableData, rowIndex);
            // 显示复制成功的提示
            message.success('行复制成功');
            // 返回新状态，更新表格数据并进入编辑模式
            return {
                ...state, // 保留其他状态字段
                tableData: updatedData, // 更新表格数据
                editingRowIndex: newRowIndex, // 设置新行索引为编辑状态
                tempRowData, // 设置复制的行数据为临时数据
                lastCopiedRowIndex: newRowIndex, // 记录复制的行索引
                loading: false, // 重置加载状态
            };
        }

        // SET_CURRENT_OPTIONS: 设置自动补全的下拉选项
        case 'SET_CURRENT_OPTIONS':
            // 返回新状态，更新 currentOptions
            return { ...state, currentOptions: action.payload };

        // SET_DYNAMIC_OPTIONS: 设置依赖列的动态下拉选项
        case 'SET_DYNAMIC_OPTIONS':
            // 返回新状态，更新 dynamicOptions 中指定 key 的选项
            return {
                ...state,
                dynamicOptions: {
                    ...state.dynamicOptions, // 保留其他动态选项
                    [action.payload.key]: action.payload.options // 更新指定列的选项
                },
            };

        // SET_LOADING: 设置加载状态
        case 'SET_LOADING':
            // 返回新状态，更新 loading 字段
            return { ...state, loading: action.payload };

        // 默认情况：返回当前状态
        default:
            return state;
    }
}

// 导出 tableReducer 函数
export default tableReducer;