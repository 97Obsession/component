// mock.ts
// 模拟接口函数
const simulateAsyncDelay = (data: any, delay: number = 500) => new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
});

// 模拟获取产品类别
export const getProductCategoryList = (params: any) => simulateAsyncDelay({
    data: params.level === '1'
        ? [{ id: 1, name: '产品A' }, { id: 2, name: '产品B' }]
        : params.parentId === 1
            ? [{ id: 11, name: '子产品A1' }, { id: 12, name: '子产品A2' }]
            : [{ id: 21, name: '子产品B1' }, { id: 22, name: '子产品B2' }]
});

// 模拟获取字典列表
export const getDictList = (params: { type: string }) => simulateAsyncDelay({
    data: params.type === 'UNLINK_PROJECT_TYPE'
        ? [{ value: '1', name: '类型1' }, { value: '2', name: '类型2' }]
        : params.type === 'UNLINK_LINK_ACCOUNT_PERIOD'
            ? [{ value: '1', name: '账期1' }, { value: '2', name: '账期2' }]
            : [{ value: '1', name: '业务类型1' }, { value: '2', name: '业务类型2' }]
});

// 模拟获取归属类别
export const getCategoryDict = () => simulateAsyncDelay([{ value: '1', name: '类别1' }, { value: '2', name: '类别2' }]);

// 模拟客户列表
export const getCustomerList = (params?: { name: string }) => simulateAsyncDelay({
    data: params?.name
        ? [{ name: `客户${params.name}` }]
        : [{ name: '客户A' }, { name: '客户B' }, { name: '客户C' }]
});

export const getCustomerListPage = () => simulateAsyncDelay({ data: [{ name: '客户1' }, { name: '客户2' }, { name: '客户3' }] });

// 模拟分页查询项目列表
export const getProjectPageByDay = (params: any) => simulateAsyncDelay({
    data: [
        { id: 1, customerName: '客户A', projectName: '项目1', firstTime: '2023-01-01', areaCode: '440000', subprojectName: '子项目1', supplierName: '供应商1', subProjectId: 'SP001', type: '1', category: '1', firstProductCategoryName: '产品A', secondProductCategoryName: '子产品A1', productName: '产品1', taxPoint: 0.06, installment: 12, number: 100, income: 10000, cost: 8000, grossMargin: 20, incomePrice: 100, incomeNoGross: 9000, costNoMargin: 7000, grossMarginNoTax: 22, costPrice: 80, businessType: ['1'], linkAccountPeriod: '1', linkId: 'LINK001', remark: '备注1', productCategoryRemark: '产品备注1', planRange: '0', copyFlag: '1', instalmentAmount: 833 },
        { id: 2, customerName: '客户B', projectName: '项目2', firstTime: '2023-02-01', areaCode: '440100', subprojectName: '子项目2', supplierName: '供应商2', subProjectId: 'SP002', type: '2', category: '2', firstProductCategoryName: '产品B', secondProductCategoryName: '子产品B1', productName: '产品2', taxPoint: 0.05, installment: 6, number: 50, income: 5000, cost: 4500, grossMargin: 10, incomePrice: 100, incomeNoGross: 4500, costNoMargin: 4000, grossMarginNoTax: 12, costPrice: 90, businessType: ['2'], linkAccountPeriod: '2', linkId: 'LINK002', remark: '备注2', productCategoryRemark: '产品备注2', planRange: '1', copyFlag: '0', instalmentAmount: 833 },
        { projectName: '合计', income: 15000, cost: 12500, grossMargin: 16.67 },
    ],
    total: 2,
    success: true
});

// 模拟获取子项目详情
export const getUnlinkSubProject = (params: { id: number }) => simulateAsyncDelay({
    id: params.id,
    name: '子项目1',
    areaCode: '440000',
    firstTime: '2023-01-01',
    customerId: 1,
    supplierName: '供应商1',
    subprojectId: 'SP001',
    type: '1',
    category: '1',
    firstProductCategory: 1,
    secondProductCategory: 11,
    productName: '产品1',
    taxPoint: 0.06,
    installment: 12,
    number: 100,
    income: 10000,
    cost: 8000,
    incomePrice: 100,
    costPrice: 80,
    remark: '备注1',
    planRange: '0',
    copyFlag: '1',
    businessType: ['1'],
    linkAccountPeriod: '1',
    linkId: 'LINK001',
    installmentInfo: [{ time: '2023-01-01', instalmentAmount: 833 }, { time: '2023-02-01', instalmentAmount: 833 }],
});

// 模拟更新子项目
export const updateUnlinkSubProject = (data: any) => simulateAsyncDelay({ success: true });

// 模拟批量添加
export const batchAdd = (data: any[]) => simulateAsyncDelay({
    successCount: data.length,
    failureDetails: []
});

// 模拟收入计算
export const getProjectIncomeInfo = (params: any) => simulateAsyncDelay({
    data: [
        {
            secondProductCategoryName: '子产品A1',
            incomeBeforeTax: 10000,
            incomeAfterTax: 9434,
            cost: 8000,
            costAfterTax: 7550,
            grossProfitAfterTax: 1884,
            grossProfitRateBeforeTax: '18.84%',
            planRangeProportion: '50%',
            copyFlagProportion: '30%',
        },
    ]
});

// 模拟导出等操作
export const exportUnLinkProjectFile = () => simulateAsyncDelay(true);
export const downloadUnlinkProjectFileByCity = () => simulateAsyncDelay(true);
export const downloadUnlinkProjectFileByCost = () => simulateAsyncDelay(true);
export const updateDeleteFlagBySubProject = (params: any) => simulateAsyncDelay({ success: true });

// 常量模拟
export const ENUM_GD_CITY = { '440000': '全省', '440100': '广州' };
export const OPTION_GD_CITY = [{ value: '440000', label: '全省' }, { value: '440100', label: '广州' }];
export const RANGE_FLAG = { '0': '省', '1': '市' };
export const COPY_FLAG = { '0': '集成', '1': '可复制' };
export const ENUM_COMMON_STATUS = { '0': '否', '1': '是' };
export const RULES = { NUMBS: { required: true, message: '请输入数字' }, BUSI_IDS: { pattern: /^\d+$/, message: '请输入ID' } };

// 工具函数
export const listToOptions = (data: any[], valueKey: string, labelKey: string) => data.map(item => ({ value: item[valueKey], label: item[labelKey] }));
export const listToValueEnum = (data: any[], valueKey: string, labelKey: string) => data.reduce((acc, item) => ({ ...acc, [item[valueKey]]: item[labelKey] }), {});
export const getCityOptions = () => simulateAsyncDelay(OPTION_GD_CITY);