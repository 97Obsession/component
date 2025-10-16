// UnlinkProjectDetail.tsx
import type {
    ActionType,
    EditableFormInstance,
    ProColumns,
    ProFormInstance,
} from '@ant-design/pro-components';
import {
    EditableProTable,
    ProForm,
} from '@ant-design/pro-components';
import React, {useEffect, useRef, useState} from 'react';
import { Button, Card, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Tooltip } from "antd";
import { CloseOutlined, ExclamationCircleOutlined, PlusOutlined, RedoOutlined } from "@ant-design/icons";
import { ModalForm, ProFormSelect, ProFormText } from "@ant-design/pro-form";
import dayjs from "dayjs";
import { PageContainer } from "@ant-design/pro-layout";
import BigNumber from 'bignumber.js';

// 导入mock
import {
    getCategoryDict as mockGetCategoryDict,
    getCustomerList as mockGetCustomerList,
    getDictList as mockGetDictList,
    getProductCategoryList as mockGetProductCategoryList,
    getProjectByCustomerId as mockGetProjectByCustomerId,
    getUnLinkProject as mockGetUnLinkProject,
    saveUnLinkProject as mockSaveUnLinkProject,
    updateUnLinkProject as mockUpdateUnLinkProject,
    ENUM_GD_CITY as mockENUM_GD_CITY,
    listToOptions as mockListToOptions,
    listToValueEnum as mockListToValueEnum,
    getEnumValue as mockGetEnumValue,
    isValid as mockIsValid,
    syncOperationModel as mockSyncOperationModel,
    RULES as mockRULES,
    COLUMNS_STYLE as mockCOLUMNS_STYLE,
    subProjectColumns as mockSubProjectColumns,
    COPY_FLAG as mockCOPY_FLAG,
    RANGE_FLAG as mockRANGE_FLAG,
} from './editMock';

// 覆盖原导入
const getCategoryDict = mockGetCategoryDict;
const getCustomerList = mockGetCustomerList;
const getDictList = mockGetDictList;
const getProductCategoryList = mockGetProductCategoryList;
const getProjectByCustomerId = mockGetProjectByCustomerId;
const getUnLinkProject = mockGetUnLinkProject;
const saveUnLinkProject = mockSaveUnLinkProject;
const updateUnLinkProject = mockUpdateUnLinkProject;
const ENUM_GD_CITY = mockENUM_GD_CITY;
const listToOptions = mockListToOptions;
const listToValueEnum = mockListToValueEnum;
const getEnumValue = mockGetEnumValue;
const isValid = mockIsValid;
const syncOperationModel = mockSyncOperationModel;
const RULES = mockRULES;
const COLUMNS_STYLE = mockCOLUMNS_STYLE;
const subProjectColumns = mockSubProjectColumns;
const COPY_FLAG = mockCOPY_FLAG;
const RANGE_FLAG = mockRANGE_FLAG;

type DataSourceType = {
    id: React.Key;
    name: string,
    areaCode: string,
    firstTime: string,
    supplierName: string,
    subprojectId: number,
    type: string,
    category: string,
    firstProductCategory: string,
    secondProductCategory: string,
    product: string,
    taxPoint: number,
    installment: number,
    number: number,
    income: number,
    cost: number,
    incomePrice: number,
    costPrice: number,
    businessType: string,
    linkAccountPeriod: string,
    linkId: string,
    planRange: string,
    copyFlag: string,
};

const defaultData: DataSourceType[] = [];

export default (props: any) => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
    const formRef = useRef<ProFormInstance<any>>();
    const actionRef = useRef<ActionType>();
    const editableFormRef = useRef<EditableFormInstance>();
    const [installmentInfoForm] = Form.useForm();
    //非连接项目管理_类型
    const [unlinkProjectType, setUnlinkProjectType] = useState<any>([]);
    //非连接项目管理_归属类别
    const [unlinkProjectCategory, setUnlinkProjectCategory] = useState<any>([]);
    const [unlinkProjectCategoryValueEnum, setUnlinkProjectCategoryValueEnum] = useState<any>([]);
    const [subBusinessData, setSubBusinessData] = useState<any[]>([]);
    const [subBusinessStatus, setSubBusinessStatus] = useState<any>(true);
    const [businessData, setBusinessData] = useState<any[]>([]);
    const [allCategory, setAllCategory] = useState<any[]>([]);
    const [businessTypeList, setBusinessTypeList] = useState({});
    const [businessTypeValue, setBusinessTypeValue] = useState<object[]>([]);
    const [helpStatus, setHelpStatus] = useState(0);
    const [timeStatus, setTimeStatus] = useState(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);
    const [incomeStatus, setIncomeStatus] = useState('');
    const [allInstallmentIncome, setAllInstallmentIncome] = useState(0);
    const [allSubProjectData, setAllSubProjectData] = useState(defaultData);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const getNewCustomerKey = (id: any, areaCode?: string | null): string | undefined => {
        return id + ',' + (isValid(areaCode) ? areaCode : '');
    };
    // 初始化编辑数据
    useEffect(
        async () => {
            // 表单数据
            let data: any;
            if (!!props.location.state && isValid(props.location.state.id)) {
                syncOperationModel('查询非连接项目详情');
                data = await getUnLinkProject({ id: props.location.state.id });
                data.subProjectInfo.forEach((element: any, index: any) => {
                    element.key = Date.now() + index;
                });
            }
            if (!!data) {
                if(data.subProjectInfo.length > 5){
                    setHasMore(true);
                }
                setAllSubProjectData(data.subProjectInfo);
                formRef.current?.setFieldsValue({
                    id: data.id,
                    name: getNewCustomerKey(data.name, data.areaCode),
                    subProjectInfo: data.subProjectInfo.slice(0, 5),
                });
            } else {
                formRef.current?.setFieldsValue({
                    id: null,
                    subProjectInfo: [],
                });
            }
        },
        {
            refreshDeps: [!!props.location.state && props.location.state.id],
        },
    );
    useEffect(async() => {
        setUnlinkProjectType(
            listToValueEnum(await getDictList({ type: 'UNLINK_PROJECT_TYPE' }), 'value', 'name'),
        );
        setUnlinkProjectCategory(
            listToOptions(await getCategoryDict(), 'value', 'name'),
        );
        setUnlinkProjectCategoryValueEnum(
            listToValueEnum(await getCategoryDict(), 'value', 'name'),
        );
        setSubBusinessData(
            listToOptions(await getProductCategoryList({ gpId: 2, level: '2' }), 'id', 'name'),
        );
        setBusinessData(
            listToOptions(await getProductCategoryList({ gpId: 2, level: '1' }), 'id', 'name'),
        );
        setAllCategory(listToValueEnum(await getProductCategoryList({ gpId: 2 }), 'id', 'name'));
        const businessTypeRes = await getDictList({ type: 'UNLINK_BUSINESS_TYPE' });
        if (businessTypeRes) {
            setBusinessTypeList(listToValueEnum(businessTypeRes, 'value', 'name'));
            setBusinessTypeValue(listToOptions(businessTypeRes, 'value', 'name'));
        }
    }, [])
    const handleChange = async (value: any) => {
        syncOperationModel('查询产品类别子类列表');

        const newProductCategoryList = await getProductCategoryList({
            gpId: 2,
            level: '2',
            parentId: value,
        });
        setSubBusinessData(listToOptions(newProductCategoryList, 'id', 'name'));
        setSubBusinessStatus(false);
    };
    const CategorySelect = ({ value, onChange }) => {
        return (
            <Select
                showSearch
                value={value}
                style={{ width: 100 }}
                optionFilterProp="label"
                onChange={async(e) => {
                    onChange(e);
                    handleChange(e);
                }}
                options={unlinkProjectCategory}
            />
        );
    };
    const MySelect = ({ value, onChange }) => {
        return (
            <Select
                showSearch
                value={value}
                style={{ width: 100 }}
                optionFilterProp="label"
                onChange={(e) => {
                    onChange(e);
                    handleChange(e);
                }}
                options={businessData}
            />
        );
    };
    const MySecondSelect = ({ value, onChange }) => {
        return (
            <Select
                value={value}
                showSearch
                style={{ width: 100 }}
                onChange={(e) => {
                    // do something
                    onChange(e);
                }}
                disabled={subBusinessStatus}
                optionFilterProp="label"
                options={subBusinessData}
            />
        );
    };
    const BusinessTypeSelect = ({ value, onChange }) => {
        return (
            <Select
                value={value}
                mode={'multiple'}
                onChange={(e) => {
                    onChange(e);
                }}
                maxTagCount={'responsive'}
                maxTagPlaceholder={(omittedValues) => (
                    <Tooltip title={omittedValues.map(({ label }) => label).join(', ')}>
            <span>
              {omittedValues && omittedValues.length > 0 ? `${omittedValues[0].label}...` : ''}
            </span>
                    </Tooltip>
                )}
                options={businessTypeValue}
            />
        );
    };
    const columns: ProColumns<DataSourceType>[] = [
        {
            title: subProjectColumns.name,
            dataIndex: 'name',
            valueType: 'text',
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.areaCode,
            dataIndex: 'areaCode',
            valueType: 'select',
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            valueEnum: ENUM_GD_CITY,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.firstTime,
            dataIndex: 'firstTime',
            valueType: 'date',
            ellipsis: true,
            width: COLUMNS_STYLE.defaultWidth,
            className: 'col-title',
            fieldProps: (_, { rowIndex,entity }) => {
                return {
                    onChange: (_, value) => {
                    },
                };
            },
        },
        {
            title: subProjectColumns.supplierName,
            dataIndex: 'supplierName',
            valueType: 'text',
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        message: '请输入供应商',
                        whitespace: true,
                        transform(value) {
                            if (value) {
                                return value.trim();
                            }
                        },
                    },
                ],
            },
        },
        {
            title: subProjectColumns.subprojectId,
            dataIndex: 'subprojectId',
            valueType: 'text',
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.type,
            dataIndex: 'type',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            valueEnum: unlinkProjectType,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.category,
            dataIndex: 'category',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            renderFormItem: () => <CategorySelect />,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
            render: (_, row) => <span>{getEnumValue(unlinkProjectCategoryValueEnum, row.category)}</span>,
        },
        {
            title: subProjectColumns.firstProductCategory,
            dataIndex: 'firstProductCategory',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            renderFormItem: () => <MySelect />,
            render: (_, row) => <span>{getEnumValue(allCategory, row.firstProductCategory)}</span>,
        },
        {
            title: subProjectColumns.secondProductCategory,
            dataIndex: 'secondProductCategory',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            renderFormItem: () => <MySecondSelect />,
            render: (_, row) => <span>{getEnumValue(allCategory, row.secondProductCategory)}</span>,
        },
        {
            title: subProjectColumns.product,
            dataIndex: 'productName',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.taxPoint,
            dataIndex: 'taxPoint',
            valueType: 'percent',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.installment,
            dataIndex: 'installment',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        message: '请输入数字或小数',
                        type: 'number',
                        whitespace: true,
                        transform: (value) => {
                            if (value) {
                                return Number(value);
                            }
                            return '-';
                        },
                    },
                ],
            },
            fieldProps: (_, { rowIndex }) => {
                return {
                    onChange: (e) => {
                        editableFormRef.current?.setRowData?.(rowIndex, {
                            installmentInfo: null
                        });
                    }
                };
            },
        },
        {
            title: subProjectColumns.number,
            dataIndex: 'number',
            valueType: 'text',
            width: COLUMNS_STYLE.defaultWidth,
            hideInSearch: true,
            className: 'col-title',
            fieldProps: {
                disabled: true,
                placeholder: ""
            },
        },
        {
            title: subProjectColumns.income,
            dataIndex: 'income',
            valueType: 'text',
            width: COLUMNS_STYLE.defaultWidth,
            hideInSearch: true,
            className: 'col-title',
            fieldProps: (_, { rowIndex,entity }) => {
                return {
                    onInput: (e) => {
                        const value = e.target.value;
                        if (value != null && entity.incomePrice != null && value!= 0 && entity.incomePrice != 0) {
                            const number = Number(value) / Number(entity.incomePrice);
                            editableFormRef.current?.setRowData?.(rowIndex, {
                                number: number.toFixed(2),
                                cost: (number * (entity.costPrice || 0)).toFixed(2),
                            });
                        }
                    },
                };
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: subProjectColumns.cost,
            dataIndex: 'cost',
            valueType: 'text',
            width: COLUMNS_STYLE.defaultWidth,
            hideInSearch: true,
            className: 'col-title',
            fieldProps: {
                disabled: true,
            },
        },
        {
            title: subProjectColumns.incomePrice,
            dataIndex: 'incomePrice',
            valueType: 'text',
            width: COLUMNS_STYLE.defaultWidth,
            hideInSearch: true,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
            fieldProps: (_, { rowIndex,entity }) => {
                return {
                    onInput: (e) => {
                        const value = e.target.value;
                        if (value != null && entity.income != null && value!= 0 && entity.income != 0) {
                            const number = Number(entity.income) / Number(value);
                            editableFormRef.current?.setRowData?.(rowIndex, {
                                number: number.toFixed(2),
                                cost: (number * (entity.costPrice || 0)).toFixed(2),
                            });
                        }
                    },
                };
            },
        },
        {
            title: subProjectColumns.costPrice,
            dataIndex: 'costPrice',
            valueType: 'text',
            width: COLUMNS_STYLE.defaultWidth,
            hideInSearch: true,
            className: 'col-title',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
            fieldProps: (_, { rowIndex,entity }) => {
                return {
                    onInput: (e) => {
                        const value = e.target.value;
                        if (value != null && entity.number != null && value!= 0 && entity.number != 0) {
                            editableFormRef.current?.setRowData?.(rowIndex, {
                                cost: (Number(entity.number) * Number(value)).toFixed(2),
                            });
                        }
                    },
                };
            },
        },
        {
            title: subProjectColumns.businessType,
            dataIndex: 'businessType',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.defaultWidth,
            className: 'col-title',
            renderFormItem: () => <BusinessTypeSelect />,
            render: (_, row) => {
                if (Array.isArray(row.businessType)) {
                    return row.businessType.map(bt => businessTypeList[bt]).join(', ');
                }
                return <span>{businessTypeList[row.businessType]}</span>;
            },
        },
        {
            title: subProjectColumns.linkAccountPeriod,
            dataIndex: 'linkAccountPeriod',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.shortTextWidth,
            className: 'col-title',
            valueEnum: businessTypeList, // 复用业务类型字典模拟账期
        },
        {
            title: subProjectColumns.linkId,
            dataIndex: 'linkId',
            valueType: 'textArea',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.defaultWidth,
            className: 'col-title',
            formItemProps: {
                rules: [RULES.BUSI_IDS],
                fieldProps: {
                    maxLength: 1024,
                },
            },
        },
        {
            title: subProjectColumns.remark,
            dataIndex: 'remark',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.defaultWidth,
            className: 'col-title',
        },
        {
            title: subProjectColumns.productCategoryRemark,
            dataIndex: 'productCategoryRemark',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: COLUMNS_STYLE.defaultWidth,
            className: 'col-title',
        },
        {
            title: '省/市统筹',
            dataIndex: 'planRange',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: 82,
            className: 'col-title',
            valueEnum: RANGE_FLAG,
        },
        {
            title: '集成/可复制',
            dataIndex: 'copyFlag',
            valueType: 'select',
            hideInSearch: true,
            ellipsis: true,
            width: 82,
            className: 'col-title',
            valueEnum: COPY_FLAG,
        },
        {
            title: '分期金额',
            dataIndex: 'instalmentAmount',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 82,
            className: 'col-title',
            tooltip: '默认为已列收总金额，如选择具体的列收时间，则列收金额仅计算所选时间段内的金额',
        },
        {
            title: '存在风险(标红)',
            dataIndex: 'riskFlag',
            valueType: 'radio',
            hideInSearch: true,
            ellipsis: true,
            width: 100,
            className: 'col-title',
            valueEnum: { '0': '否', '1': '是' },
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            fixed: 'right',
            render: (_, row, index, action) => {
                const actionList = [
                    <a key="setInstallment" onClick={() => {
                        const rowData = editableFormRef.current?.getRowData?.(index);
                        if (rowData.installment > 0) {
                            setEditVisible(true);
                            installmentInfoForm.setFieldsValue(rowData);
                            let total = 0;
                            if (rowData.installmentInfo && rowData.installmentInfo.length > 0) {
                                rowData.installmentInfo.forEach((item: any) => {
                                    total += Number(item.instalmentAmount || 0);
                                });
                                setAllInstallmentIncome(total);
                                setIncomeStatus(total !== rowData.income ? (total > rowData.income ? 'more' : 'less') : '');
                            } else {
                                resetInstallmentInfo(rowData);
                            }
                        }
                    }}>
                        设置分期金额
                    </a>,
                ];
                return actionList;
            },
        },
    ];
    const handleChangeCity = async (idAreaCode: string) => {
        syncOperationModel('查询客户详情');
        if (!!idAreaCode) {
            const idAreaCodeArr = idAreaCode.split(',');
            syncOperationModel('通过客户查询非连接项目详情');
            const unlinkProjectInfo = await getProjectByCustomerId({ name: idAreaCodeArr[0] });
            if (!!unlinkProjectInfo && unlinkProjectInfo.id != null) {
                unlinkProjectInfo.subProjectInfo.forEach((element: any, index: any) => {
                    element.key = Date.now() + index;
                });
                if(unlinkProjectInfo.subProjectInfo.length > 5){
                    setHasMore(true);
                }
                setAllSubProjectData(unlinkProjectInfo.subProjectInfo);
                formRef.current?.setFieldsValue({
                    id: unlinkProjectInfo.id,
                    subProjectInfo: unlinkProjectInfo.subProjectInfo.slice(0, 5),
                });
            }else {
                formRef.current?.setFieldsValue({
                    id: null,
                    subProjectInfo: [],
                });
            }
        }
    };
    // 分期相关方法
    const instalmentAmountChange = async (e: any) => {
        const { value } = e.target;
        const installmentInfo = installmentInfoForm.getFieldValue('installmentInfo');

        if (installmentInfo.length > 0) {
            const valueBN = new BigNumber(value);
            installmentInfo.forEach((element: any) => {
                element.instalmentAmount = valueBN.toNumber();
            });

            const totalAmount = valueBN.multipliedBy(installmentInfo.length).toNumber();
            const income = Number(installmentInfoForm.getFieldValue('income'));

            if (totalAmount !== income) {
                if (totalAmount > income) {
                    setIncomeStatus('more');
                } else {
                    setIncomeStatus('less');
                }
            } else {
                setIncomeStatus('');
            }
            setAllInstallmentIncome(totalAmount);
            installmentInfoForm.setFieldsValue({ installmentInfo: installmentInfo });
        }
    };
    const instalmentAmountChangeSingle = async (e: any) => {
        let valueBN = new BigNumber(0);
        const installmentInfo = installmentInfoForm.getFieldValue('installmentInfo');

        if (installmentInfo.length > 0) {
            installmentInfo.forEach((element: any) => {
                valueBN = valueBN.plus(new BigNumber(element.instalmentAmount));
            });
            const value = valueBN.toNumber();
            const income = Number(installmentInfoForm.getFieldValue('income'));

            if (value !== income) {
                if (value > income) {
                    setIncomeStatus('more');
                } else {
                    setIncomeStatus('less');
                }
            } else {
                setIncomeStatus('');
            }
            setAllInstallmentIncome(value);
            installmentInfoForm.setFieldsValue({ installmentInfo: installmentInfo });
        }
    };
    const resetInstallmentInfo = async (record: any) => {
        if (record.firstTime != null && record.installment != null) {
            record.installmentInfo = [];
            const dateFormat = 'YYYY-MM-DD';
            for (let i = 0; i < record.installment; i++) {
                record.installmentInfo.push({
                    time: dayjs(record.firstTime, dateFormat)
                        .subtract(-i, 'months')
                        .startOf('month')
                        .format('YYYY-MM-DD'),
                    instalmentAmount: 0,
                });
            }
            installmentInfoForm.setFieldsValue({
                key: record.key,
                firstTime: record.firstTime,
                installment: record.installment,
                income: record.income,
                installmentInfo: record.installmentInfo,
            });
        }
    };
    const handleCancel = async (value: any) => {
        setEditVisible(false);
    };
    const modalFormChange = async (e: any) => {
        const subProjectInfo = formRef.current?.getFieldValue('subProjectInfo');
        subProjectInfo.forEach((element: any) => {
            if (element.key == installmentInfoForm.getFieldValue('key')) {
                element.installmentInfo = installmentInfoForm.getFieldValue('installmentInfo');
            }
        });
        formRef.current?.setFieldsValue({
            subProjectInfo: subProjectInfo,
        })
        setEditVisible(false);
    };
    let changeInstalmentTime = 0;
    const handleInstalment = async () => {
        if (changeInstalmentTime == 0) {
            changeInstalmentTime = 1;
            Modal.info({
                content: <>与当前分期数据冲突，需要到设置分期金额的弹窗重置并重新修改金额</>,
            });
        }
    };

    const handleSubmit = async() => {
        const values = formRef.current?.getFieldsValue('subProjectInfo');
        values.name = values.name.split(',')[0];
        values.subProjectInfo.forEach((element) => {
            if(typeof(element.id) === 'string') {
                element.id = null
            }
        })
        // 合并 allSubProjectData 和 values.subProjectInfo
        // 1. 保留 allSubProjectData 中未被表单修改的数据
        const mergedSubProjectData = allSubProjectData.map((initialItem) => {
            const formItem = values.subProjectInfo.find(
                (item) => item.id === initialItem.id // 假设 id 是唯一标识
            );
            return formItem ? { ...initialItem, ...formItem } : initialItem;
        });

        // 2. 追加表单中新增的项（不在 allSubProjectData 中的数据）
        const newItems = values.subProjectInfo.filter(
            (formItem) => !allSubProjectData.some((initialItem) => initialItem.id === formItem.id)
        );

        // 3. 合并初始数据和新增数据
        values.subProjectInfo = [...mergedSubProjectData, ...newItems];
        let res: any;
        if (!!values && isValid(values.id)) {
            syncOperationModel('修改非连接项目');
            // 修改保存
            res = await updateUnLinkProject(values);
        } else {
            syncOperationModel('新增非连接项目');
            // 新增保存
            res = await saveUnLinkProject(values);
        }

        if (!!res && res.success) {
            message.success('保存成功.');
        }
    }
    // 查看更多子项目
    const handleMoreSubProject = () => {
        if(currentPage * 10 + 5 >= allSubProjectData.length){
            setHasMore(false);
        }
        const result = formRef.current?.getFieldValue('subProjectInfo');
        formRef.current?.setFieldsValue({
            subProjectInfo: result.concat(allSubProjectData.slice(result.length, currentPage * 10 + 5)),
        })
        setCurrentPage((prevState) => prevState + 1);
    }
    return (
        <PageContainer>
            <ProForm<{
                subProjectInfo: DataSourceType[];
            }>
                formRef={formRef}
                initialValues={{
                    subProjectInfo: defaultData,
                }}
                submitter={false}
                layout="horizontal" // 设置为水平布局
            >
                <div className={"titleBlueBar"} style={{marginBottom: '20px'}}>基础信息</div>
                <ProFormText name="id" hidden />
                <ProFormSelect
                    name="name"
                    label="客户名称"
                    showSearch
                    debounceTime={200}
                    width={"md"}
                    fieldProps={{
                        onChange: (val) => {
                            if (!!val) {
                                handleChangeCity(val);
                            }
                        },
                    }}
                    request={async ({keyWords = ""}) => {
                        syncOperationModel("模糊查询客户");
                        const dataList = await getCustomerList({name: keyWords});
                        dataList.forEach((it) => (it.idAreaCode = getNewCustomerKey(it.id, it.areaCode)));
                        return listToOptions(dataList, "idAreaCode", "name");
                    }}
                    placeholder="请输入客户名称"
                    rules={[{required: true, message: "请输入客户名称"}]}
                    disabled={!!props.location.state && isValid(props.location.state.id)}
                />
                <Divider />
                <div className={"titleBlueBar"} style={{margin: '20px 0px'}}>子项目信息</div>
                <Button
                    type="primary"
                    onClick={() => {
                        actionRef.current?.addEditRecord?.({
                                key: (Math.random() * 1000000).toFixed(0),
                                firstTime: dayjs().format("YYYY-MM-DD"),
                                installment: 1,
                                number: null,
                                cost: null,
                                id: (Math.random() * 1000000).toFixed(0),
                            },
                            {newRecordType: "dataSource", position: "top"});
                    }}
                    icon={<PlusOutlined />}
                    style={{marginBottom: 20}}
                >
                    添加子项目
                </Button>
                <EditableProTable<DataSourceType>
                    rowKey="key"
                    scroll={{
                        x: 600,
                    }}
                    sticky={{
                        offsetHeader: 45,
                        offsetScroll: 10,
                    }}
                    editableFormRef={editableFormRef}
                    controlled
                    actionRef={actionRef}
                    name="subProjectInfo"
                    columns={columns}
                    recordCreatorProps={false}
                    editable={{
                        type: "multiple",
                        editableKeys,
                        onChange: setEditableRowKeys,
                        actionRender: (row, config, defaultDom) => [
                            defaultDom.save,
                            defaultDom.delete,
                        ],
                        onSave: async (rowKey, data, row) => {
                            if (data.installmentInfo != null) {
                                if (data.installment !== row.installment) {
                                    handleInstalment();
                                }
                            }
                        },
                    }}
                />
                <div style={{textAlign: "center", color: "#2f54eb", marginBottom: "20px"}}>
                    <Button type={"primary"} ghost onClick={handleMoreSubProject} disabled={!hasMore}>
                        {hasMore ? "查看更多子项目" : "没有更多了"}
                    </Button>
                </div>
                <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                    <Space size={10}>
                        <Button type={"primary"} onClick={handleSubmit}>提交</Button>
                    </Space>
                </div>
            </ProForm>
            {/*设置分期金额弹窗*/}
            <ModalForm
                form={installmentInfoForm}
                title="设置分期金额"
                width={900}
                onOpenChange={setEditVisible}
                open={editVisible}
                layout="horizontal"
                onFinish={handleCancel}
                modalProps={{
                    footer: false,
                    closeIcon: (
                        <CloseOutlined
                            onClick={() => {
                                setEditVisible(false);
                                setTimeStatus(false);
                                setIncomeStatus('');
                                setHelpStatus(0);
                            }}
                        />
                    ),
                }}
                submitter={{
                    render: () => [],
                }}
            >
                <Space style={{ width: '100%' }}>
          <span>
            非连接收入 (含税) {installmentInfoForm.getFieldValue('income')}元，当前分期总金额：
              {allInstallmentIncome}元，首列时间：{installmentInfoForm.getFieldValue('firstTime')}
          </span>
                    <br />
                </Space>
                <Space style={{ width: '100%' }}>
          <span style={{ color: '#FF6600' }}>
            {(incomeStatus !== '' || helpStatus !== 0) && (
                <ExclamationCircleOutlined style={{ color: '#FF6600' }} />
            )}
          </span>
                    <span style={{ color: '#FF6600' }}>
            {(incomeStatus == 'more' && '当前设置分期金额总和比收入多') ||
                (incomeStatus == 'less' && '当前设置分期金额总和比收入少')}
          </span>
                    <span style={{ color: '#FF6600' }}>{incomeStatus !== '' && helpStatus !== 0 && ','}</span>
                    <span style={{ color: '#FF6600' }}>
            {helpStatus == 1 && '当前分期第一期时间早于首列时间'}
                        {helpStatus == 2 && '当前分期第一期时间晚于首列时间'}
          </span>
                </Space>

                <Input.Group compact style={{ marginTop: 20 }}>
                    <span>每期分期金额：</span>
                    <Form.Item
                        noStyle
                        name="initInstallmentIncome"
                        rules={[RULES.NUMBS]}
                    >
                        <Input
                            style={{ width: 200, marginLeft: 10 }}
                            placeholder="请输入"
                            type="number"
                            onChange={instalmentAmountChange}
                        />
                    </Form.Item>
                    <Button
                        style={{ width: 150, marginLeft: 15 }}
                        type="primary"
                        onClick={() => {
                            resetInstallmentInfo({
                                key: installmentInfoForm.getFieldValue('key'),
                                firstTime: installmentInfoForm.getFieldValue('firstTime'),
                                installment: installmentInfoForm.getFieldValue('installment'),
                                income: installmentInfoForm.getFieldValue('income'),
                                installmentInfo: installmentInfoForm.getFieldValue('installmentInfo'),
                            });
                        }}
                        block
                    >
                        <RedoOutlined style={{ transform: 'rotate(-90deg)' }} />
                        重置分期数据
                    </Button>
                </Input.Group>

                <Form.List name="installmentInfo">
                    {(fields, {}) => (
                        <>
                            <Row gutter={16} style={{ marginTop: 20 }}>
                                {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <Col span={8} style={{ marginTop: 20 }} key={key}>
                                        <Form.Item style={{ marginBottom: 0 }} label={key + 1 + '期'}>
                                            <Input.Group>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'time']}
                                                    noStyle
                                                    fieldKey={[fieldKey, 'time']}
                                                >
                                                    <Input
                                                        style={{ width: '40%', marginTop: '0' }}
                                                        placeholder="请输入"
                                                        disabled
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'instalmentAmount']}
                                                    noStyle
                                                    fieldKey={[fieldKey, 'instalmentAmount']}
                                                    rules={[
                                                        {
                                                            message: '请输入数字或小数',
                                                            type: 'number',
                                                            whitespace: true,
                                                            transform: (value) => {
                                                                if (value) {
                                                                    return Number(value);
                                                                }
                                                            },
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        style={{ width: '40%', marginTop: '0' }}
                                                        type="number"
                                                        onChange={instalmentAmountChangeSingle}
                                                        placeholder="请输入"
                                                    />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Form.List>
                <Card bordered={false} style={{ alignContent: 'center', textAlign: 'center' }}>
                    <Button key="cancel" style={{ marginLeft: 8 }} onClick={handleCancel}>
                        取消
                    </Button>
                    <Button
                        type="primary"
                        key="submit"
                        onClick={() => {
                            modalFormChange('installmentInfoForm');
                        }}
                        style={{ marginLeft: 12 }}
                    >
                        保存
                    </Button>
                </Card>
            </ModalForm>
        </PageContainer>
    );
};