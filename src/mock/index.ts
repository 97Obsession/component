import Mock from 'mockjs';
import axios from 'axios';

// 设置模拟响应时间
Mock.setup({
    timeout: '200-600'
});

Mock.mock('/api/categories', 'get', () => {
    return {
        code: 200,
        message: 'success',
        data: [
            { value: 'electronics', label: '电子产品' },
            { value: 'clothing', label: '服装' },
            { value: 'books', label: '图书' },
            { value: 'food', label: '食品' }
        ]
    };
});

// 模拟获取重点领域的接口
Mock.mock(/\/api\/focus-areas\?category=.+/, 'get', (options: {url:string}) => {
    const url = new URLSearchParams(options.url.split('?')[1]);
    const category = url.get('category');

    // 根据归属类别返回不同的重点领域
    let focusAreas = [];
    switch (category) {
        case 'electronics':
            focusAreas = [
                { value: 'smartphones', label: '智能手机' },
                { value: 'laptops', label: '笔记本电脑' },
                { value: 'tablets', label: '平板电脑' }
            ];
            break;
        case 'clothing':
            focusAreas = [
                { value: 'shirts', label: '衬衫' },
                { value: 'pants', label: '裤子' },
                { value: 'jackets', label: '夹克' }
            ];
            break;
        case 'books':
            focusAreas = [
                { value: 'fiction', label: '小说' },
                { value: 'non-fiction', label: '非小说' },
                { value: 'textbooks', label: '教材' }
            ];
            break;
        case 'food':
            focusAreas = [
                { value: 'snacks', label: '零食' },
                { value: 'beverages', label: '饮料' },
                { value: 'frozen', label: '冷冻食品' }
            ];
            break;
        default:
            focusAreas = [
                { value: 'general', label: '通用领域' },
                { value: 'other', label: '其他' }
            ];
    }

    return {
        code: 200,
        message: 'success',
        data: focusAreas
    };
});


// 模拟用户列表接口
Mock.mock('/api/users', 'get', () => {
    return {
        code: 200,
        message: 'success',
        data: Mock.mock({
            'list|10-20': [{
                'id|+1': 1,
                name: '@cname',
                age: '@integer(18, 60)',
                email: '@email',
                'gender|1': ['male', 'female']
            }]
        })
    };
});

// 模拟登录接口
Mock.mock('/api/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body);

    // 简单验证逻辑
    if (username === 'admin' && password === '123456') {
        return {
            code: 200,
            message: '登录成功',
            data: {
                token: Mock.Random.string(32),
                userInfo: {
                    id: 1,
                    username: 'admin',
                    role: 'admin'
                }
            }
        };
    } else {
        return {
            code: 401,
            message: '用户名或密码错误'
        };
    }
});

export default Mock;