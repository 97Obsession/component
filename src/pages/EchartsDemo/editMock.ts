// 模拟延迟函数（如果未定义）
const simulateAsyncDelay = (data: any, delay: number = 500) => new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
});

// 模拟获取非连接项目详情
export const getUnLinkProject = (params: { id: number }) => simulateAsyncDelay({
    id: params.id || 1,
    name: '客户A',
    areaCode: '440000',
    subProjectInfo: [
        {
            id: 1,
            name: '子项目1',
            areaCode: '440000',
            firstTime: '2023-01-01',
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
            businessType: ['1'],
            linkAccountPeriod: '1',
            linkId: 'LINK001',
            planRange: '0',
            copyFlag: '1',
            installmentInfo: [{ time: '2023-01-01', instalmentAmount: 833 }],
        },
        // 添加更多模拟数据...
    ],
});

// 模拟保存/更新非连接项目
export const saveUnLinkProject = (data: any) => simulateAsyncDelay({ success: true });
export const updateUnLinkProject = (data: any) => simulateAsyncDelay({ success: true });

// 模拟获取字典列表
export const getDictList = (params: { type: string }) => simulateAsyncDelay({
    data: params.type === 'UNLINK_PROJECT_TYPE'
        ? [{ value: '1', name: '类型1' }, { value: '2', name: '类型2' }]
        : params.type === 'UNLINK_BUSINESS_TYPE'
            ? [{ value: '1', name: '业务类型1' }, { value: '2', name: '业务类型2' }]
            : [{ value: '1', name: '账期1' }, { value: '2', name: '账期2' }],
});

// 模拟获取类别字典
export const getCategoryDict = () => simulateAsyncDelay([
    { value: '1', name: '类别1' },
    { value: '2', name: '类别2' },
]);

// 模拟获取产品类别列表
export const getProductCategoryList = (params: any) => simulateAsyncDelay({
    data: params.level === '1'
        ? [{ id: 1, name: '产品A' }, { id: 2, name: '产品B' }]
        : params.parentId === 1
            ? [{ id: 11, name: '子产品A1' }, { id: 12, name: '子产品A2' }]
            : [{ id: 21, name: '子产品B1' }, { id: 22, name: '子产品B2' }],
});

// 模拟获取客户列表
export const getCustomerList = (params: { name?: string }) => simulateAsyncDelay({
    data: params.name
        ? [{ id: 1, name: `客户${params.name}`, areaCode: '440000' }]
        : [
            { id: 1, name: '客户A', areaCode: '440000' },
            { id: 2, name: '客户B', areaCode: '440100' },
        ],
});

// 模拟通过客户ID获取项目
export const getProjectByCustomerId = (params: { name: string }) => simulateAsyncDelay({
    id: 1,
    name: params.name,
    areaCode: '440000',
    subProjectInfo: [
        {
            id: 1,
            name: '子项目1',
            // ... 类似以上模拟数据
        },
    ],
});

// 常量和工具函数（从原组件导入或复用）
export const ENUM_GD_CITY = { '440000': '全省', '440100': '广州' };
export const listToOptions = (data: any[], valueKey: string, labelKey: string) => data.map(item => ({ value: item[valueKey], label: item[labelKey] }));
export const listToValueEnum = (data: any[], valueKey: string, labelKey: string) => data.reduce((acc, item) => ({ ...acc, [item[valueKey]]: item[labelKey] }), {});
export const getEnumValue = (enumObj: any, key: string) => enumObj[key] || '';
export const isValid = (val: any) => val !== null && val !== undefined && val !== '';
export const syncOperationModel = (msg: string) => console.log(`Mock: ${msg}`); // 模拟日志

// 其他常量
export const COPY_FLAG = { '0': '集成', '1': '可复制' };
export const RANGE_FLAG = { '0': '省', '1': '市' };
export const RULES = { NUMBS: { type: 'number', message: '请输入数字' } };
export const COLUMNS_STYLE = { shortTextWidth: 120, defaultWidth: 150 };
export const subProjectColumns = {
    name: '子项目名称',
    areaCode: '地市',
    firstTime: '首列时间',
    supplierName: '供应商',
    subprojectId: '子项目ID',
    type: '类型',
    category: '归属类别',
    firstProductCategory: '一级产品类别',
    secondProductCategory: '二级产品类别',
    product: '产品',
    taxPoint: '税点',
    installment: '分期期数',
    number: '数量',
    income: '收入',
    cost: '成本',
    incomePrice: '收入单价',
    costPrice: '成本单价',
    businessType: '业务类型',
    linkAccountPeriod: '连接账期',
    linkId: '关联连接ID',
    planRange: '省/市统筹',
    copyFlag: '集成/可复制',
};