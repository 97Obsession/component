import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { debounce } from 'lodash';
import LineChart from "./LineChart";
/**
 * 自定义的 ECharts 包装组件，类似于 echarts-for-react。
 * 这个组件封装了 ECharts 的初始化、更新和销毁逻辑，以实现高性能。
 * 它使用 useRef 来管理 DOM 和图表实例，避免不必要的重新渲染。
 * 支持主题切换和选项更新时的高效合并。
 * 为性能优化：
 * - 只在组件挂载时初始化图表。
 * - 在选项变化时使用 setOption 更新，而不重新初始化。
 * - 添加窗口 resize 监听器，确保图表响应式调整大小。
 * - 在卸载时销毁图表实例，释放资源。
 * @param {Object} props
 * @param {Object} props.option - ECharts 的配置选项。
 * @param {Object} [props.style={ height: '400px', width: '100%' }] - 图表的样式。
 * @param {string} [props.theme='light'] - ECharts 主题。
 */
const EChartsWrapper = ({ option, style = { height: '400px', width: '100%'}, theme = 'light' }) => {
    // 使用 useRef 保存 DOM 引用和图表实例，避免状态变化导致重新渲染
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 初始化图表和 resize 监听器（仅在 theme 变化时重新初始化）
    useEffect(() => {
        if (chartRef.current) {
            // 初始化 ECharts 实例
            chartInstance.current = echarts.init(chartRef.current, theme);
            // 设置初始选项
            chartInstance.current.setOption(option);
        }

        // 防抖处理：避免窗口resize时频繁触发
        const debounceResize = debounce(() => {
            if (chartInstance.current) {
                // 先获取容器最新尺寸，再执行resize
                const container = chartRef.current;
                if (container) {
                    const { width, height } = container.getBoundingClientRect();
                    console.log("resize",width, height);
                    // 只有尺寸变化时才执行resize（避免无效操作）
                    if (width > 0 && height > 0) {
                        chartInstance.current.resize({ width, height });
                    }
                }
            }
        }, 100); // 100ms防抖延迟
        // offsetWidth是 dom元素属性 = 内容+内边距+边框，transform不影响它的值，且它是整数值，且受box-sizing的影响
        // getBoundingClientRect 是 dom元素方法 = 元素相对于视口的位置和尺寸信息  width 和 height 会包含 transform 缩放后的实际显示尺寸（例如 transform: scale(0.5) 会使返回的宽高为原尺寸的一半），且是浮点数（更精确）
        window.addEventListener('resize', debounceResize);

        // 清理函数：在组件卸载时销毁图表并移除监听器，防止内存泄漏
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
            window.removeEventListener('resize', debounceResize);
        };
    }, [theme]); // 依赖 theme，如果 theme 变化则重新初始化

    // 当 option 变化时，更新图表（不重新初始化整个实例，提高性能）
    useEffect(() => {
        if (chartInstance.current) {
            // 使用 notMerge: true 来完全替换选项，避免旧数据残留
            // 如果需要合并旧选项，可以设置为 false
            chartInstance.current.setOption(option, { notMerge: true });
        }
    }, [option]); // 仅依赖 option 变化

    // 返回 DOM 容器
    return <div ref={chartRef} style={style} />;
};
export default EChartsWrapper;