// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../redux/counterSlice';

// 使用 configureStore 创建 store
export const store = configureStore({
    reducer: {
        counter: counterReducer, // 将我们的 counterReducer 添加到 store 中
        // 可以在这里添加更多的 reducer
    },
});

// 可选：导出在应用中使用的类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;