import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import App from './App';
import './styles.less';  // 导入 Less
import './index.css';  // 导入 css
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { AuthProvider } from './routes/AuthContext';
import {Provider} from "react-redux";
import {store} from "./redux/store";
import 'antd/dist/reset.css';
import './mock/index';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Provider store={store}> {/* 使用 Provider 包裹应用并传入 store */}
        <div className="bg-blue-500 text-white p-4 text-2xl">
            测试 Tailwind：如果蓝色背景出现，则生效。
        </div>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </Provider>
);