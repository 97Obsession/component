import React, {useEffect} from 'react';
import { Form, Select, Button, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { Rule } from 'antd/lib/form';
// 定义选择框的配置类型
interface SelectConfig {
    name: string; // 字段名，例如 'type' 或 'aggregation'
    placeholder: string; // 占位符
    options: { value: string; label: string }[]; // 下拉选项
    rules?: Rule[]; // 验证规则
    width?: number; // 选择框宽度
}

// 定义组件的 Props 类型
export interface DynamicSelectListProps {
    form: FormInstance; // 表单实例
    label: string; // 表单项标签，例如“选择过滤条件”
    name: string; // Form.List 的字段名，例如 'conditions'
    selectConfigs: SelectConfig[]; // 每个选择框的配置
    initialValues?: any[]; // 初始值
    addButtonText?: string; // 添加按钮的文本
    allowDelete?: boolean; // 是否允许删除
}

const DynamicSelectList: React.FC<DynamicSelectListProps> = ({
                                                                 form,
                                                                 label,
                                                                 name,
                                                                 selectConfigs,
                                                                 initialValues = [{ ...selectConfigs.reduce((acc, config) => ({ ...acc, [config.name]: '' }), {}) }],
                                                                 addButtonText = '增加项',
                                                                 allowDelete = true,
                                                             }) => {
    return (
        <Form.List name={name} initialValue={initialValues}>
            {(fields, { add, remove }) => (
                <>
                    <Form.Item label={label}>
                        {fields.map(({ key, name: fieldName, ...restField }) => (
                            <Space key={key} align="baseline" style={{ marginBottom: 16 }}>
                                {selectConfigs.map((config) => (
                                    <Form.Item
                                        {...restField}
                                        name={[fieldName, config.name]}
                                        rules={config.rules || [{ required: true, message: `请选择${config.placeholder}` }]}
                                        key={`${key}-${config.name}`}
                                    >
                                        <Select
                                            style={{ width: config.width || 200 }}
                                            placeholder={config.placeholder}
                                            options={config.options}
                                        />
                                    </Form.Item>
                                ))}
                                {allowDelete && fields.length > 1 && (
                                    <Button type="link" onClick={() => remove(fieldName)}>
                                        删除
                                    </Button>
                                )}
                            </Space>
                        ))}
                    </Form.Item>
                    <Form.Item>
                        {/*Ant Design 的 Form.Item 组件默认会将内容包裹在一个块级元素中（通常是 <div>），其 CSS 属性可能包含 display: block 或 width: 100%，导致其子元素（例如 Button）独占一行。*/}
                        <Button
                            type="dashed"
                            onClick={() => add()}
                            // block 会导致占满父容器的100%
                            style={{ marginBottom: 16 }}
                        >
                            {addButtonText}
                        </Button>
                    </Form.Item>
                </>
            )}
        </Form.List>
    );
};

export default DynamicSelectList;