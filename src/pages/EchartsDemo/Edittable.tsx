// UnlinkProjectDayList.tsx
import React, { useRef, useState, useEffect } from "react";
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { FormInstance } from "antd";
import {
    Tag,
    AutoComplete,
    Card,
    Col,
    Dropdown,
    Form,
    Input,
    Row,
    Space,
    Tooltip,
    Button,
    Drawer,
    Modal,
    Typography,
    Badge,
    message,
    Select,
} from 'antd';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import {
    CloseOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    RedoOutlined,
} from "@ant-design/icons";
import ProForm, { ModalForm, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-form";
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

// 导入mock
import {
    getProductCategoryList,
    getDictList,
    getCategoryDict,
    getCustomerList,
    getCustomerListPage,
    getProjectPageByDay,
    getUnlinkSubProject,
    updateUnlinkSubProject,
    batchAdd,
    getProjectIncomeInfo,
    exportUnLinkProjectFile,
    downloadUnlinkProjectFileByCity,
    downloadUnlinkProjectFileByCost,
    updateDeleteFlagBySubProject,
    ENUM_GD_CITY,
    OPTION_GD_CITY,
    RANGE_FLAG,
    COPY_FLAG,
    ENUM_COMMON_STATUS,
    RULES,
    listToOptions,
    listToValueEnum,
    getCityOptions,
} from './mock';
import {useNavigate} from "react-router-dom";

const { Option } = Select;

// Badge 渲染
const renderBadge = (count: number, active = false) => (
    <Badge
        count={count}
        style={{
            marginTop: -2,
            marginLeft: 4,
            color: active ? '#1890FF' : '#999',
            backgroundColor: active ? '#E6F7FF' : '#eee',
        }}
    />
);

// 标红样式
const TagStyle = { color: '#FF0000', background: '#FEEEEB', borderColor: '#ffbb96', borderRadius: 3, border: 0 };

const UnlinkProjectDayList = () => {
    const formRef = useRef<FormInstance>();
    const actionRef = useRef<ActionType>();
    const tableRef = useRef<ActionType>();
    const [showDetail, setShowDetail] = useState(false);
    const [currentRow, setCurrentRow] = useState<any>({});
    const [activeTab, setActiveTab] = useState<React.Key>('process');
    const [requestData, setRequestData] = useState({});
    const [batchVisible, setBatchVisible] = useState(false);
    const [installmentInfoForm] = Form.useForm();
    const [productIncomeInfoForm] = Form.useForm();
    const [cityIncomeInfoForm] = Form.useForm();
    const [form] = Form.useForm();
    const defaultDate = dayjs();
    const [businessData, setBusinessData] = useState<any[]>([]);
    const [subBusinessData, setSubBusinessData] = useState<any[]>([]);
    const [formSubBusinessData, setFormSubBusinessData] = useState<any[]>([]);
    const [timeStatus, setTimeStatus] = useState(false);
    const [incomeStatus, setIncomeStatus] = useState('');
    const [helpStatus, setHelpStatus] = useState(0);
    const [allInstallmentIncome, setAllInstallmentIncome] = useState(0);
    const [installmentInfo, setInstallmentInfo] = useState([]);
    const [businessValue, setBusinessValue] = useState<any>(null);
    const [subBusinessValue, setSubBusinessValue] = useState<any>(null);
    const [exportLoading, setExportLoading] = useState<boolean>(false);
    const [modalVisit, setModalVisit] = useState(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);
    const [incomeVisible, setIncomeVisible] = useState<boolean>(false);
    const [options, setOptions] = useState<any[]>([]);
    const [unlinkProjectType, setUnlinkProjectType] = useState<any>({});
    const [unlinkProjectCategory, setUnlinkProjectCategory] = useState<any>({});
    const [businessTypeState, setBusinessTypeState] = useState<any>({});
    const [linkAccountPeriodState, setLinkAccountPeriodState] = useState<any>({});
    const [allowEdit, setAllowEdit] = useState<boolean>(true);
    const [manual, setManual] = useState(false);
    const [errorDetails, setErrorDetails] = useState<any[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        const initData = async () => {
            const productCategoryList = await getProductCategoryList({ gpId: 2, level: '1' });
            setBusinessData(listToOptions(productCategoryList.data, 'id', 'name'));
            const secondProductCategoryList = await getProductCategoryList({ gpId: 2, level: '2' });
            setFormSubBusinessData(listToOptions(secondProductCategoryList.data, 'id', 'name'));
            setSubBusinessData(listToOptions(secondProductCategoryList.data, 'id', 'name'));
            setUnlinkProjectType(listToValueEnum((await getDictList({ type: 'UNLINK_PROJECT_TYPE' })).data, 'value', 'name'));
            setUnlinkProjectCategory(listToValueEnum(await getCategoryDict(), 'value', 'name'));
            setLinkAccountPeriodState(listToValueEnum((await getDictList({ type: 'UNLINK_LINK_ACCOUNT_PERIOD' })).data, 'value', 'name'));
            setBusinessTypeState(listToValueEnum((await getDictList({ type: 'UNLINK_BUSINESS_TYPE' })).data, 'value', 'name'));
            const { data } = await getCustomerListPage();
            setOptions(listToOptions(data, 'name', 'name'));
            setManual(true);
        };
        initData();
    }, []);

    // 清理内存泄漏
    useEffect(() => {
        return () => {
            form.resetFields();
            installmentInfoForm.resetFields();
            productIncomeInfoForm.resetFields();
            cityIncomeInfoForm.resetFields();
            setOptions([]);
            setBusinessData([]);
            setSubBusinessData([]);
            setFormSubBusinessData([]);
            setErrorDetails([]);
            // 其他状态重置
        };
    }, []);

    const tabList = [
        { key: '1', tab: '产品维度收入' },
        { key: '2', tab: '地市维度收入' },
    ];
    const [activeTabKey, setActiveTabKey] = useState<string>('1');

    const handleSearch = async (value: string) => {
        let searchResult;
        if (!!value) {
            searchResult = listToOptions((await getCustomerList({ name: value })).data, 'name', 'name');
        } else {
            const { data } = await getCustomerListPage();
            searchResult = listToOptions(data, 'name', 'name');
        }
        setOptions(searchResult);
        formRef.current?.setFieldsValue({ customerName: value });
    };

    const onSelect = (value: string) => {
        formRef.current?.setFieldsValue({ customerName: value });
    };

    const onCustomerNameChange = (value: string) => {
        formRef.current?.setFieldsValue({ customerName: value || '' });
    };

    const handleChange = async (value: any) => {
        if (!value) {
            formRef.current?.setFieldsValue({ firstProductCategory: '', secondProductCategory: '' });
            setSubBusinessValue(value);
        }
        const productCategoryList = await getProductCategoryList({ gpId: 2, level: '2', parentId: value });
        setSubBusinessData(listToOptions(productCategoryList.data, 'id', 'name'));
        setBusinessValue(value);
    };

    const resetInstallmentInfo = async (record: any) => {
        if (record.firstTime != null && record.installment != null) {
            record.installmentInfo = [];
            const dateFormat = 'YYYY-MM-DD';
            for (let i = 0; i < record.installment; i++) {
                record.installmentInfo.push({
                    time: dayjs(record.firstTime, dateFormat).subtract(-i, 'months').startOf('month').format('YYYY-MM-DD'),
                    instalmentAmount: 0,
                });
            }
            installmentInfoForm.setFieldsValue({
                key: record.key,
                firstTime: record.firstTime,
                installment: record.installment,
                installmentInfo: record.installmentInfo,
            });
            setTimeStatus(false);
            setIncomeStatus('');
            setAllInstallmentIncome(0);
        }
    };

    const handleUnlinkSubProject = async (value: any) => {
        setModalVisit(false);
        setEditVisible(false);
        setTimeStatus(false);
        setIncomeStatus('');
        setHelpStatus(0);
        if (value == 'installmentInfoForm') {
            const installmentInfoFormData = installmentInfoForm.getFieldsValue().installmentInfo;
            if (!!installmentInfoFormData && installmentInfoFormData.length > 0) {
                for (let i = 0; i < installmentInfoFormData.length; i++) {
                    const element = installmentInfoFormData[i];
                    if (!element.instalmentAmount || element.instalmentAmount.trim() == '') {
                        element.instalmentAmount = 0;
                    }
                }
            }
            await updateUnlinkSubProject(installmentInfoForm.getFieldsValue());
        }
        if (value == 'form') {
            const planRange = form.getFieldValue('planRange');
            const copyFlag = form.getFieldValue('copyFlag');
            if (!planRange) form.setFieldsValue({ planRange: null });
            if (!copyFlag) form.setFieldsValue({ copyFlag: null });
            form.setFieldsValue({ firstTime: dayjs(form.getFieldValue('firstTime')).format('YYYY-MM-DD') });
            await updateUnlinkSubProject(form.getFieldsValue());
            actionRef.current?.reload();
        }
        message.success('保存成功');
    };

    const handleCancel = async () => {
        setModalVisit(false);
        setEditVisible(false);
        setTimeStatus(false);
        setIncomeStatus('');
    };

    const exportUnlinkProject = async (data: any) => {
        setExportLoading(true);
        let res;
        if (data.key == '1') res = await exportUnLinkProjectFile(requestData);
        if (data.key == '2') res = await downloadUnlinkProjectFileByCity(requestData);
        if (data.key == '3') res = await downloadUnlinkProjectFileByCost(requestData);
        setExportLoading(false);
        if (res) {
            message.success('导出任务已建立');
        } else {
            message.error('导出任务建立失败');
        }
    };

    const getCalculateData = async () => {
        if (activeTabKey === '1' && (!productIncomeInfoForm.getFieldValue('month') || !productIncomeInfoForm.getFieldValue('category'))) {
            message.warning('时间和归属类别为必填！');
            return { data: [], total: 0, success: true };
        }
        if (activeTabKey === '2' && (!cityIncomeInfoForm.getFieldValue('month') || cityIncomeInfoForm.getFieldValue('category').length == 0)) {
            message.warning('时间和归属类别为必填！');
            return { data: [], total: 0, success: true };
        }
        const params: { calculateType: string } = { calculateType: activeTabKey };
        if (activeTabKey == '1') {
            params.category = productIncomeInfoForm.getFieldValue('category').split(',');
            params.installmentTime = [
                productIncomeInfoForm.getFieldValue('month')[0].format('YYYY-MM'),
                productIncomeInfoForm.getFieldValue('month')[1].format('YYYY-MM'),
            ];
        }
        if (activeTabKey == '2') {
            params.areaCode = cityIncomeInfoForm.getFieldValue('areaCode');
            params.category = cityIncomeInfoForm.getFieldValue('category');
            params.installmentTime = [
                cityIncomeInfoForm.getFieldValue('month')[0].format('YYYY-MM'),
                cityIncomeInfoForm.getFieldValue('month')[1].format('YYYY-MM'),
            ];
        }
        const data = await getProjectIncomeInfo(params);
        if (data && data.data) {
            data.data.forEach((item: any, index: number) => {
                data.data[index].incomeBeforeTax = item.incomeBeforeTax ? item.incomeBeforeTax.toFixed(0) : item.incomeBeforeTax;
                data.data[index].incomeAfterTax = item.incomeAfterTax ? item.incomeAfterTax.toFixed(0) : item.incomeAfterTax;
                data.data[index].cost = item.cost ? item.cost.toFixed(0) : item.cost;
                data.data[index].costAfterTax = item.costAfterTax ? item.costAfterTax.toFixed(0) : item.costAfterTax;
                data.data[index].grossProfitAfterTax = item.grossProfitAfterTax ? item.grossProfitAfterTax.toFixed(0) : item.grossProfitAfterTax;
                data.data[index].grossProfitRateBeforeTax = item.grossProfitRateBeforeTax ? Number(item.grossProfitRateBeforeTax.replace('%', '')).toFixed(2) + '%' : item.grossProfitRateBeforeTax;
            });
            return { data: data.data, total: data.data.length, success: true };
        }
        return { data: [], total: 0, success: true };
    };

    const handleReset = async () => {
        setBusinessValue(null);
        setSubBusinessValue(null);
    };

    const instalmentAmountChange = async (e: any) => {
        const { value } = e.target;
        const installmentInfo = installmentInfoForm.getFieldValue('installmentInfo');
        if (installmentInfo.length > 0 && !!value) {
            const valueBN = new BigNumber(value);
            const incomeBN = new BigNumber(installmentInfoForm.getFieldValue('income'));
            installmentInfo.forEach((element: any) => { element.instalmentAmount = valueBN.toNumber(); });
            const totalAmount = valueBN.multipliedBy(installmentInfo.length);
            if (!totalAmount.isEqualTo(incomeBN)) {
                setIncomeStatus(totalAmount.isGreaterThan(incomeBN) ? 'more' : 'less');
            } else {
                setIncomeStatus('');
            }
            setAllInstallmentIncome(totalAmount.toNumber());
            installmentInfoForm.setFieldsValue({ installmentInfo });
        }
    };

    const instalmentAmountChangeSingle = async (e: any) => {
        let valueBN = new BigNumber(0);
        const installmentInfo = installmentInfoForm.getFieldValue('installmentInfo');
        const incomeBN = new BigNumber(installmentInfoForm.getFieldValue('income'));
        if (installmentInfo.length > 0) {
            installmentInfo.forEach((element: any) => {
                if (!!element.instalmentAmount) valueBN = valueBN.plus(new BigNumber(element.instalmentAmount));
            });
            if (!valueBN.isEqualTo(incomeBN)) {
                setIncomeStatus(valueBN.isGreaterThan(incomeBN) ? 'more' : 'less');
            } else {
                setIncomeStatus('');
            }
            setAllInstallmentIncome(valueBN.toNumber());
            installmentInfoForm.setFieldsValue({ installmentInfo });
        }
    };

    const getUnlinkSubProjectDetail = async (id: any) => {
        setModalVisit(true);
        const data = await getUnlinkSubProject({ id });
        if (data) {
            form.setFieldsValue(data);
            setInstallmentInfo(data.installmentInfo);
            setHelpStatus(0); // 简化
        }
    };

    const handleChangeNumber = async () => {
        if (form.getFieldValue('income') && form.getFieldValue('income') > 0 && form.getFieldValue('incomePrice') && form.getFieldValue('incomePrice') > 0) {
            const newNumberValue = (form.getFieldValue('income') / form.getFieldValue('incomePrice')).toFixed(2);
            form.setFieldsValue({
                number: newNumberValue,
                cost: (Number(newNumberValue) * form.getFieldValue('costPrice')).toFixed(2),
            });
        }
    };

    const handleChangeCost = async () => {
        if (form.getFieldValue('costPrice') && form.getFieldValue('costPrice') >= 0 && form.getFieldValue('number') && form.getFieldValue('number') >= 0) {
            form.setFieldsValue({
                cost: (form.getFieldValue('number') * form.getFieldValue('costPrice')).toFixed(2),
            });
        }
    };

    const handleDelete = async (item: any) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: (
                <>
                    请确认是否删除[
                    <Typography.Text strong>
                        {!item.subprojectName ? item.id : item.subprojectName}
                    </Typography.Text>
                    ].
                </>
            ),
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                await updateDeleteFlagBySubProject({ id: item.id, unlinkProjectId: item.unlinkProjectId });
                actionRef.current?.reload();
                message.success('操作成功.');
            },
        });
    };

    const handleSaveOrUpdate = async (values: { orderInfo: string }) => {
        try {
            const { orderInfo } = values;
            const rows = orderInfo.split('\n').filter(row => row.trim());
            if (rows.length > 50) {
                message.error(`提交失败，最多可复制50行数据`);
                return;
            }
            const result = [];
            const errors: string[] = [];
            rows.forEach((row, index) => {
                const cols = row.split('\t');
                if (cols.length < 18) {
                    errors.push(`第${index + 1}行数据不完整`);
                    return;
                }
                const item = {
                    customerName: cols[0].trim(),
                    firstTime: cols[1].trim(),
                    areaCode: cols[2].trim(),
                    name: cols[3].trim(),
                    supplierName: cols[4].trim(),
                    subprojectId: cols[5].trim(),
                    type: cols[6].trim(),
                    category: cols[7].trim(),
                    firstProductCategoryName: cols[8].trim(),
                    secondProductCategoryName: cols[9].trim(),
                    productName: cols[10].trim(),
                    taxPoint: parseFloat(cols[11]) || 0,
                    installment: parseInt(cols[12], 10) || 0,
                    number: parseFloat(cols[13]) || 0,
                    income: parseFloat(cols[14]) || 0,
                    cost: parseFloat(cols[15]) || 0,
                    incomePrice: parseFloat(cols[16]) || 0,
                    costPrice: parseFloat(cols[17]) || 0
                };
                const numFields = ['taxPoint', 'installment', 'number', 'income', 'cost', 'incomePrice', 'costPrice'];
                if (numFields.some(field => isNaN(item[field]))) {
                    errors.push(`第${index + 1}行数值格式错误`);
                    return;
                }
                result.push(item);
            });
            if (errors.length > 0) {
                message.error(`数据校验失败：\n${errors.join('\n')}`);
                return;
            }
            const res = await batchAdd(result);
            if (res?.successCount === result?.length) {
                message.success(`成功导入${res?.successCount}条数据`);
                actionRef.current?.reload();
                setBatchVisible(false);
                setErrorDetails([]);
            } else {
                message.error(`导入失败`);
                setErrorDetails(res?.failureDetails || []);
            }
        } catch (err) {
            message.error('数据处理异常，请检查数据格式');
            setErrorDetails([]);
        }
    };

    const items: any[] = [
        { key: '1', label: '批量导出(时间顺序)' },
        { key: '2', label: '批量导出(地市顺序)' },
        { key: '3', label: '批量导出(成本)' }
    ];

    const getUnLinkProjectColumnsColumns = (): ProColumns<any>[] => [
        {
            title: '客户名称',
            dataIndex: 'customerName',
            valueType: 'text',
            hideInTable: true,
            renderFormItem: (_, fieldConfig, formData) => {
                if (fieldConfig.type === 'form') return null;
                return (
                    <AutoComplete
                        dropdownMatchSelectWidth={252}
                        style={{ width: '100%' }}
                        options={options}
                        onSelect={onSelect}
                        onSearch={handleSearch}
                        onChange={onCustomerNameChange}
                        allowClear
                    >
                        <Input name="customerName" size="middle" placeholder="请输入" />
                    </AutoComplete>
                );
            },
        },
        {
            title: '项目名称',
            dataIndex: 'projectName',
            valueType: 'text',
            ellipsis: true,
            width: 150,
            hideInSearch: true,
            copyable: true,
        },
        {
            title: '首列时间',
            dataIndex: 'firstTime',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 120,
        },
        {
            title: '地市',
            dataIndex: 'areaCode',
            valueType: 'text',
            valueEnum: ENUM_GD_CITY,
            hideInSearch: true,
            ellipsis: true,
            width: 100,
        },
        {
            title: '子项目名称',
            dataIndex: 'subprojectName',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: '供应商',
            dataIndex: 'supplierName',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: '子项目ID',
            dataIndex: 'subProjectId',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 120,
        },
        {
            title: '类型',
            dataIndex: 'type',
            valueType: 'text',
            hideInSearch: true,
            valueEnum: unlinkProjectType,
            ellipsis: true,
            width: 100,
        },
        {
            title: '归属类别',
            dataIndex: 'category',
            valueType: 'text',
            hideInSearch: true,
            valueEnum: unlinkProjectCategory,
            ellipsis: true,
            width: 120,
        },
        {
            title: '一级产品类别',
            dataIndex: 'firstProductCategoryName',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: '二级产品类别',
            dataIndex: 'secondProductCategoryName',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: '产品',
            dataIndex: 'productName',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 120,
        },
        {
            title: '税点',
            dataIndex: 'taxPoint',
            valueType: 'percent',
            hideInSearch: true,
            ellipsis: true,
            width: 100,
        },
        {
            title: '分期期数',
            dataIndex: 'installment',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 100,
        },
        {
            title: '数量',
            dataIndex: 'number',
            valueType: 'text',
            ellipsis: true,
            width: 100,
            hideInSearch: true,
            render: (_, row) => <span>{row.number ? Number(row.number).toFixed(2) : ''}</span>,
        },
        {
            title: '收入',
            dataIndex: 'income',
            valueType: 'text',
            ellipsis: true,
            width: 120,
            hideInSearch: true,
            render: (_, row) => {
                const value = row.income ? Number(row.income).toFixed(2) : '';
                if (row.income < row.cost) {
                    return <Tag color="#FF0000" style={TagStyle}>{value}</Tag>;
                }
                return <span>{value}</span>;
            },
        },
        {
            title: '成本',
            dataIndex: 'cost',
            valueType: 'text',
            ellipsis: true,
            width: 120,
            hideInSearch: true,
            render: (_, row) => {
                const value = row.cost ? Number(row.cost).toFixed(2) : '';
                if (row.income < row.cost) {
                    return <Tag color="#FF0000" style={TagStyle}>{value}</Tag>;
                }
                return <span>{value}</span>;
            },
        },
        {
            title: '毛利率',
            dataIndex: 'grossMargin',
            valueType: 'text',
            ellipsis: true,
            width: 100,
            hideInSearch: true,
        },
        {
            title: '收入单价',
            dataIndex: 'incomePrice',
            valueType: 'text',
            ellipsis: true,
            width: 100,
            hideInSearch: true,
            render: (_, row) => <span>{row.incomePrice ? Number(row.incomePrice).toFixed(2) : ''}</span>,
        },
        {
            title: '收入无毛利',
            dataIndex: 'incomeNoGross',
            valueType: 'text',
            ellipsis: true,
            width: 120,
            hideInSearch: true,
        },
        {
            title: '成本无毛利',
            dataIndex: 'costNoMargin',
            valueType: 'text',
            ellipsis: true,
            width: 120,
            hideInSearch: true,
        },
        {
            title: '无税毛利率',
            dataIndex: 'grossMarginNoTax',
            valueType: 'text',
            ellipsis: true,
            width: 100,
            hideInSearch: true,
        },
        {
            title: '成本单价',
            dataIndex: 'costPrice',
            valueType: 'text',
            ellipsis: true,
            width: 100,
            hideInSearch: true,
            render: (_, row) => <span>{row.costPrice ? Number(row.costPrice).toFixed(2) : ''}</span>,
        },
        {
            title: '业务类型',
            dataIndex: 'businessType',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 120,
            valueEnum: businessTypeState,
        },
        {
            title: '连接账期',
            dataIndex: 'linkAccountPeriod',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 120,
            valueEnum: linkAccountPeriodState,
        },
        {
            title: '关联连接ID',
            dataIndex: 'linkId',
            valueType: 'text',
            hideInSearch: true,
            ellipsis: true,
            width: 120,
        },
        {
            title: '备注',
            dataIndex: 'remark',
            valueType: 'text',
            ellipsis: true,
            width: 120,
            hideInSearch: true,
        },
        {
            title: '产品类别备注',
            dataIndex: 'productCategoryRemark',
            valueType: 'text',
            ellipsis: true,
            width: 120,
            hideInSearch: true,
        },
        {
            title: '时间',
            dataIndex: 'time',
            valueType: 'dateRange',
            hideInTable: true,
        },
        {
            title: '产品',
            dataIndex: 'product',
            valueType: 'text',
            hideInTable: true,
        },
        {
            title: '归属类别',
            dataIndex: 'category',
            valueType: 'select',
            valueEnum: unlinkProjectCategory,
            fieldProps: { mode: 'multiple' },
            hideInTable: true,
        },
        {
            title: '分期时间',
            dataIndex: 'installmentTime',
            valueType: 'dateRange',
            fieldProps: { picker: 'month', format: 'YYYY-MM' },
            width: 200,
            hideInTable: true,
        },
        {
            title: '一级产品类别',
            dataIndex: 'firstProductCategory',
            valueType: 'text',
            hideInTable: true,
            renderFormItem: (_, fieldConfig, formData) => {
                if (fieldConfig.type === 'form') return null;
                return (
                    <Select
                        placeholder="重点领域"
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        onChange={handleChange}
                        options={businessData}
                    />
                );
            },
        },
        {
            title: '二级产品类别',
            dataIndex: 'secondProductCategory',
            valueType: 'text',
            hideInTable: true,
            renderFormItem: (_, fieldConfig, formData) => {
                if (fieldConfig.type === 'form') return null;
                return (
                    <Select
                        placeholder="产品细类"
                        value={subBusinessValue}
                        style={{ width: '100%' }}
                        allowClear
                        disabled={businessValue == null}
                        onChange={setSubBusinessValue}
                        options={subBusinessData}
                    />
                );
            },
        },
        {
            title: '省/市统筹',
            dataIndex: 'planRange',
            valueType: 'text',
            width: 82,
            hideInSearch: true,
            valueEnum: RANGE_FLAG,
        },
        {
            title: '集成/可复制',
            dataIndex: 'copyFlag',
            valueType: 'text',
            width: 82,
            hideInSearch: true,
            valueEnum: COPY_FLAG,
        },
        {
            title: '分期金额',
            dataIndex: 'instalmentAmount',
            tooltip: '默认为已列收总金额，如选择具体的列收时间，则列收金额仅计算所选时间段内的金额',
            valueType: 'text',
            width: 82,
            hideInSearch: true,
        },
        {
            title: '存在风险(标红)',
            dataIndex: 'riskFlag',
            valueType: 'radio',
            hideInTable: true,
            valueEnum: ENUM_COMMON_STATUS,
        },
    ];

    const getIncomeOfCategoryColumns = (): ProColumns<any>[] => [
        { title: '产品细类', dataIndex: 'secondProductCategoryName', valueType: 'text', ellipsis: true },
        { title: '税前收入(元)', dataIndex: 'incomeBeforeTax', valueType: 'text', ellipsis: true },
        { title: '税后收入(元)', dataIndex: 'incomeAfterTax', valueType: 'text', ellipsis: true },
        { title: '税前成本', dataIndex: 'cost', valueType: 'text', ellipsis: true },
        { title: '税后成本', dataIndex: 'costAfterTax', valueType: 'text', ellipsis: true },
        { title: '税后毛利', dataIndex: 'grossProfitAfterTax', valueType: 'text', ellipsis: true },
        { title: '毛利率', dataIndex: 'grossProfitRateBeforeTax', valueType: 'text', ellipsis: true },
        { title: '省统筹收入占比', dataIndex: 'planRangeProportion', valueType: 'text', ellipsis: true },
        { title: '可复制收入占比', dataIndex: 'copyFlagProportion', valueType: 'text', ellipsis: true },
    ];

    const getIncomeOfCityColumns = (): ProColumns<any>[] => [
        { title: '地市', dataIndex: 'areaCode', valueType: 'text', valueEnum: ENUM_GD_CITY, ellipsis: true },
        { title: '归属类别', dataIndex: 'category', valueType: 'text', valueEnum: { all: '总体', ...unlinkProjectCategory }, ellipsis: true },
        { title: '税前收入(元)', dataIndex: 'incomeBeforeTax', valueType: 'text', ellipsis: true },
        { title: '税后收入(元)', dataIndex: 'incomeAfterTax', valueType: 'text', ellipsis: true },
        { title: '税前成本', dataIndex: 'cost', valueType: 'text', ellipsis: true },
        { title: '税后成本', dataIndex: 'costAfterTax', valueType: 'text', ellipsis: true },
        { title: '税后毛利', dataIndex: 'grossProfitAfterTax', valueType: 'text', ellipsis: true },
        { title: '毛利率', dataIndex: 'grossProfitRateBeforeTax', valueType: 'text', ellipsis: true },
        { title: '省统筹收入占比', dataIndex: 'planRangeProportion', valueType: 'text', ellipsis: true },
        { title: '可复制收入占比', dataIndex: 'copyFlagProportion', valueType: 'text', ellipsis: true },
    ];

    return (
        <>
            <ProTable<any>
                formRef={formRef}
                actionRef={actionRef}
                rowKey="id"
                debounceTime={20}
                sticky={{ offsetHeader: 45, offsetScroll: 10 }}
                onReset={handleReset}
                search={{ labelWidth: 100, defaultCollapsed: false }}
                bordered
                scroll={{ x: 2100 }}
                columns={getUnLinkProjectColumnsColumns().concat([
                    {
                        title: '操作',
                        valueType: 'option',
                        width: 200,
                        fixed: 'right',
                        render: (_: any, r: any) => [
                            r.id && r.projectName !== '合计' && (
                                <a key="update" onClick={() => { setAllowEdit(true); getUnlinkSubProjectDetail(r.id); }}>编辑</a>
                            ),
                            r.id && r.projectName !== '合计' && (
                                <a key="part-update" onClick={() => { setAllowEdit(false); getUnlinkSubProjectDetail(r.id); }}>单个编辑</a>
                            ),
                            r.id && r.projectName !== '合计' && r.installment > 0 && (
                                <a key="editInstallment" onClick={async () => {
                                    const data = await getUnlinkSubProject({ id: r.id });
                                    setEditVisible(true);
                                    installmentInfoForm.setFieldsValue(data);
                                    let value = 0;
                                    if (data.installmentInfo && data.installmentInfo.length > 0) {
                                        data.installmentInfo.forEach((element: any) => {
                                            if (!!element.instalmentAmount && Number(element.instalmentAmount) !== 0) value += Number(element.instalmentAmount);
                                        });
                                        setAllInstallmentIncome(value);
                                        setIncomeStatus(value !== data.income ? (value > data.income ? 'more' : 'less') : '');
                                    } else {
                                        resetInstallmentInfo(data);
                                    }
                                }}>设置分期</a>
                            ),
                            r.id && r.projectName !== '合计' && (
                                <a key="delete" onClick={() => handleDelete(r)}>删除子项目</a>
                            ),
                        ],
                    },
                ])}
                toolbar={{
                    menu: {
                        type: 'tab',
                        activeKey: activeTab,
                        onChange: (key) => setActiveTab(key as string),
                    },
                    actions: [
                        <Button key="import" onClick={() => setBatchVisible(true)}>批量导入</Button>,
                        <Button key="calculate" type="primary" onClick={() => setIncomeVisible(true)}>收入测算</Button>,
                        <Button key="add" type="primary" onClick={() => navigate('/protable-edit')}><PlusOutlined /> 添加项目</Button>,
                        <Button key="statistics" type="primary" onClick={() => message.info('统计分期合计功能模拟')}>统计分期合计</Button>,
                        <Dropdown menu={{ items, onClick: exportUnlinkProject }}>
                            <Button loading={exportLoading}>批量导出<DownOutlined /></Button>
                        </Dropdown>,
                        <Button key="fragment" onClick={() => { setErrorDetails([]); setBatchVisible(true); }}><PlusOutlined /> 导入本地台帐片段</Button>,
                    ],
                }}
                request={async (params: any, sort) => {
                    const newParams = { ...params, sort };
                    if (newParams.time) {
                        newParams.time[0] = dayjs(newParams.time[0]).format('YYYY-MM-DD 00:00:00');
                        newParams.time[1] = dayjs(newParams.time[1]).format('YYYY-MM-DD 23:59:59');
                    }
                    if (businessValue) newParams.firstProductCategory = businessValue;
                    if (subBusinessValue) newParams.secondProductCategory = subBusinessValue;
                    newParams.pageSize = newParams.pageSize - 1;
                    setRequestData(newParams);
                    const dataList = await getProjectPageByDay(newParams);
                    if (dataList && dataList.data && dataList.data.length > 0) {
                        if (dataList.data[0].projectName == '合计') {
                            dataList.data[0].id = Date.now();
                        }
                        // 业务类型转换
                        const businessTypeValueEnum = listToValueEnum((await getDictList({ type: 'UNLINK_BUSINESS_TYPE' })).data, 'value', 'name');
                        dataList.data.forEach((item: any, index: number) => {
                            const result = item.businessType;
                            if (result && Array.isArray(result)) {
                                let businessTypeStr = '';
                                result.forEach((bt: string) => {
                                    businessTypeStr += businessTypeValueEnum[Number(bt)] + '，';
                                });
                                dataList.data[index].businessType = businessTypeStr.slice(0, -1);
                            }
                        });
                    }
                    return dataList || { data: [], total: 0, success: true };
                }}
            />

            {/* 详情抽屉 */}
            <Drawer width={600} open={showDetail} onClose={() => { setCurrentRow(undefined); setShowDetail(false); }}>
                {currentRow?.id && (
                    <ProDescriptions<any> column={2} title="详情页" request={async () => ({ data: currentRow })} params={{ id: currentRow.id }} columns={getUnLinkProjectColumnsColumns() as any} />
                )}
            </Drawer>

            {/* 编辑弹窗 */}
            <ModalForm<any>
                title="非连接子项目编辑"
                layout="horizontal"
                width={'70%'}
                form={form}
                onFinish={() => handleUnlinkSubProject('form')}
                open={modalVisit}
                modalProps={{ footer: false, closeIcon: <CloseOutlined onClick={handleCancel} /> }}
                submitter={{ render: () => [] }}
            >
                <Form.Item name="id" style={{ display: 'none' }} />
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
                            <Input disabled={!allowEdit} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="areaCode" label="地市" rules={[{ required: true }]}>
                            <Select options={OPTION_GD_CITY} disabled={!allowEdit} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="firstTime" label="首列时间" rules={[{ required: true }]}>
                            <Input type="date" disabled={!allowEdit} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="supplierName" label="供应商">
                            <Input disabled={!allowEdit} />
                        </Form.Item>
                    </Col>
                </Row>
                {/* 其他字段类似，省略以保持简洁 */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="number" label="数量">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="income" label="收入" rules={[{ required: true }]} onChange={handleChangeNumber}>
                            <Input disabled={!allowEdit} />
                        </Form.Item>
                    </Col>
                </Row>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type="primary" onClick={() => handleUnlinkSubProject('form')}>保存</Button>
                    </Space>
                </div>
            </ModalForm>

            {/* 分期设置弹窗 */}
            <ModalForm
                form={installmentInfoForm}
                title="设置分期金额"
                width={900}
                open={editVisible}
                onFinish={handleCancel}
                submitter={{ render: () => [] }}
                modalProps={{ footer: false, closeIcon: <CloseOutlined onClick={handleCancel} /> }}
                layout="horizontal"
            >
                <Form.Item name="id" style={{ display: 'none' }} />
                <Space style={{ width: '100%' }}>
                    <span>非连接收入 (含税) {installmentInfoForm.getFieldValue('income')}元，当前分期总金额：{allInstallmentIncome}元，首列时间：{installmentInfoForm.getFieldValue('firstTime')}</span>
                </Space>
                <Space style={{ width: '100%' }}>
          <span style={{ color: '#FF6600' }}>
            {(incomeStatus !== '' || helpStatus !== 0) && <ExclamationCircleOutlined style={{ color: '#FF6600' }} />}
          </span>
                    <span style={{ color: '#FF6600' }}>
            {incomeStatus == 'more' && '当前设置分期金额总和比收入多' || (incomeStatus == 'less' && '当前设置分期金额总和比收入少')}
          </span>
                    <span style={{ color: '#FF6600' }}>{incomeStatus !== '' && helpStatus !== 0 && ','}</span>
                    <span style={{ color: '#FF6600' }}>
            {helpStatus == 1 && '当前分期第一期时间早于首列时间' || (helpStatus == 2 && '当前分期第一期时间晚于首列时间')}
          </span>
                </Space>
                <Input.Group compact style={{ marginTop: 20 }}>
                    <span>每期分期金额：</span>
                    <Form.Item name="initInstallmentIncome" rules={RULES.NUMBS}>
                        <Input style={{ width: 200, marginLeft: 10 }} placeholder="请输入" type="number" onChange={instalmentAmountChange} />
                    </Form.Item>
                    <Button style={{ width: 150, marginLeft: 15 }} type="primary" onClick={() => resetInstallmentInfo(installmentInfoForm.getFieldsValue())} block>
                        <RedoOutlined style={{ transform: 'rotate(-90deg)' }} /> 重置分期数据
                    </Button>
                </Input.Group>
                <Form.List name="installmentInfo">
                    {(fields) => (
                        <Row gutter={16} style={{ marginTop: 20 }}>
                            {fields.map(({ key, name }) => (
                                <Col span={8} key={key}>
                                    <Form.Item label={key + 1 + '期'}>
                                        <Input.Group>
                                            <Form.Item name={[name, 'time']} noStyle><Input style={{ width: '40%' }} disabled /></Form.Item>
                                            <Form.Item name={[name, 'instalmentAmount']} noStyle rules={[{ type: 'number' }]}>
                                                <Input style={{ width: '40%' }} type="number" onChange={instalmentAmountChangeSingle} placeholder="请输入" />
                                            </Form.Item>
                                        </Input.Group>
                                    </Form.Item>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Form.List>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                    <Button onClick={handleCancel}>取消</Button>
                    <Button type="primary" onClick={() => handleUnlinkSubProject('installmentInfoForm')} style={{ marginLeft: 12 }}>保存</Button>
                </Card>
            </ModalForm>

            {/* 收入测算弹窗 */}
            <ModalForm
                width={'60%'}
                open={incomeVisible}
                onFinish={handleCancel}
                submitter={{ render: () => [] }}
                modalProps={{ footer: false, closeIcon: <CloseOutlined onClick={() => setIncomeVisible(false)} /> }}
                layout="horizontal"
            >
                <Card tabList={tabList} activeTabKey={activeTabKey} onTabChange={setActiveTabKey}>
                    {activeTabKey == '1' && (
                        <ProForm form={productIncomeInfoForm} layout="horizontal" submitter={{ render: () => [] }}>
                            <Row gutter={[12, 16]}>
                                <Col span={24}>
                                    <ProFormDateRangePicker
                                        initialValue={[defaultDate, defaultDate]}
                                        label="月份"
                                        name="month"
                                        rules={[{ required: true, message: '必填!' }]}
                                        fieldProps={{ format: 'YYYY-MM', picker: 'month' }}
                                    />
                                    <Form.Item label="归属类别" name="category" rules={[{ required: true }]} initialValue={Object.keys(unlinkProjectCategory)[0]}>
                                        <Select options={Object.entries(unlinkProjectCategory).map(([k, v]) => ({ value: k, label: v }))} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </ProForm>
                    )}
                    {activeTabKey == '2' && (
                        <ProForm form={cityIncomeInfoForm} layout="horizontal" submitter={{ render: () => [] }}>
                            <Row gutter={[12, 16]}>
                                <Col span={24}>
                                    <ProFormDateRangePicker
                                        initialValue={[defaultDate, defaultDate]}
                                        label="月份"
                                        name="month"
                                        rules={[{ required: true, message: '必填!' }]}
                                        fieldProps={{ format: 'YYYY-MM', picker: 'month' }}
                                    />
                                    <ProFormSelect
                                        name="category"
                                        label="归属类别"
                                        valueEnum={{ all: '总体', ...unlinkProjectCategory }}
                                        required
                                        mode="multiple"
                                        initialValue={[Object.keys(unlinkProjectCategory)[0]]}
                                    />
                                    <ProFormSelect
                                        label="地市"
                                        name="areaCode"
                                        initialValue={'all'}
                                        valueEnum={{ all: '不限', ...ENUM_GD_CITY }}
                                        allowClear={false}
                                    />
                                </Col>
                            </Row>
                        </ProForm>
                    )}
                    <Card bordered={false} style={{ textAlign: 'center' }}>
                        <Button type="primary" onClick={() => tableRef.current?.reload()}>计算</Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => {
                            setIncomeVisible(false);
                            if (activeTabKey == '1') {
                                productIncomeInfoForm.resetFields();
                                productIncomeInfoForm.setFieldsValue({ month: [defaultDate, defaultDate], category: Object.keys(unlinkProjectCategory)[0] });
                            } else {
                                cityIncomeInfoForm.resetFields();
                                cityIncomeInfoForm.setFieldsValue({ month: [defaultDate, defaultDate], category: [Object.keys(unlinkProjectCategory)[0]], areaCode: 'all' });
                            }
                        }}>取消</Button>
                    </Card>
                </Card>
                <Card>
                    <span style={{ color: 'blue' }}>说明：税后收入=项目已列收/(1+税点)</span>
                    <span style={{ color: 'blue', paddingLeft: 20 }}>税后毛利=税后收入-税后成本</span>
                    <span style={{ color: 'blue', paddingLeft: 20 }}>毛利率=税后毛利/税后收入</span>
                    <ProTable
                        actionRef={tableRef}
                        search={false}
                        columns={activeTabKey == '1' ? getIncomeOfCategoryColumns() : getIncomeOfCityColumns()}
                        request={getCalculateData}
                        pagination={false}
                    />
                </Card>
            </ModalForm>

            {/* 批量导入片段 */}
            <Modal
                title="导入本地台帐片段"
                open={batchVisible}
                onCancel={() => setBatchVisible(false)}
                footer={null}
                width={600}
            >
                <Form onFinish={handleSaveOrUpdate}>
                    <Form.Item name="orderInfo" rules={[{ required: true, message: '请输入数据' }]}>
                        <Input.TextArea
                            rows={10}
                            placeholder="请复制excel一行或多行数据（最多50行）粘贴到此处"
                            maxLength={5000}
                        />
                    </Form.Item>
                    {errorDetails.length > 0 && (
                        <div>
                            <h4>错误详情：</h4>
                            {errorDetails.map((err: any, idx: number) => (
                                <p key={idx}>{err.rowNum}: {err.reason} - {err.data}</p>
                            ))}
                        </div>
                    )}
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">导入</Button>
                            <Button onClick={() => setBatchVisible(false)}>取消</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UnlinkProjectDayList;