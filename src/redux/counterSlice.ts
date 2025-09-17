// features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

// 使用 createSlice 创建 counterSlice
const counterSlice = createSlice({
    name: 'counter', // Slice 的名称
    initialState: { // 初始状态
        value: 0
    },
    reducers: { // 定义 reducer 函数，它们会生成对应的 actions
        increment: (state) => {
            state.value += 1; // 使用了 Immer，可以直接“修改”状态
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload; // 通过 action.payload 获取传递的参数
        }
    }
});

// 导出自动生成的 action creators
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 导出默认的 reducer
export default counterSlice.reducer