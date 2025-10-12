import React, {
    useState,
    useRef,
    useEffect,
    ReactNode,
    useCallback
} from 'react';
import { createPortal } from 'react-dom';
import './Dropdown.css'; // 样式文件

// 定义触发方式类型
type TriggerType = 'click' | 'hover';
// 定义浮层位置类型
type PlacementType = 'top' | 'bottom' | 'left' | 'right' | 'top-auto' | 'bottom-auto' | 'left-auto' | 'right-auto';

// 组件Props类型定义
interface DropdownProps {
    /** 触发下拉的元素（必传） */
    children: ReactNode;
    /** 下拉浮层内容（必传，函数返回JSX） */
    renderDropdown: () => ReactNode;
    /** 触发方式：click/hover，默认click */
    trigger?: TriggerType;
    /** 浮层位置，默认bottom */
    placement?: PlacementType;
    /** 是否禁用，默认false */
    disabled?: boolean;
    /** 点击菜单项后是否自动关闭，默认true */
    autoClose?: boolean;
    /** hover触发时的延迟（毫秒），默认150 */
    delay?: number;
    /** 浮层显示/隐藏时的回调 */
    onVisibleChange?: (visible: boolean) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
                                               children,
                                               renderDropdown,
                                               trigger = 'click',
                                               placement = 'bottom',
                                               disabled = false,
                                               autoClose = true,
                                               delay = 150,
                                               onVisibleChange
                                           }) => {
    // 状态管理：浮层显示/隐藏
    const [visible, setVisible] = useState(false);
    // DOM引用：触发元素、浮层元素
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // 定时器引用：处理hover延迟
    const enterTimer = useRef<NodeJS.Timeout | null>(null);
    const leaveTimer = useRef<NodeJS.Timeout | null>(null);

    // 切换浮层显示状态
    const toggleVisible = useCallback((newVisible: boolean) => {
        if (disabled) return;
        setVisible(newVisible);
        onVisibleChange?.(newVisible);
    }, [disabled, onVisibleChange]);

    // 点击触发元素（trigger=click时）
    const handleTriggerClick = () => {
        if (trigger !== 'click') return;
        toggleVisible(!visible);
    };

    // 鼠标进入触发元素（trigger=hover时）
    const handleTriggerMouseEnter = () => {
        if (trigger !== 'hover' || disabled) return;
        // 清除之前的离开定时器，避免快速切换冲突
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = null;
        }
        // 延迟显示，防止误触
        enterTimer.current = setTimeout(() => {
            toggleVisible(true);
        }, delay);
    };

    // 鼠标离开触发元素（trigger=hover时）
    const handleTriggerMouseLeave = () => {
        if (trigger !== 'hover' || disabled) return;
        // 清除之前的进入定时器
        if (enterTimer.current) {
            clearTimeout(enterTimer.current);
            enterTimer.current = null;
        }
        // 延迟隐藏，提升体验
        leaveTimer.current = setTimeout(() => {
            toggleVisible(false);
        }, delay);
    };

    // 鼠标进入浮层（hover时保持显示）
    const handleDropdownMouseEnter = () => {
        if (trigger !== 'hover' || disabled) return;
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = null;
        }
    };

    // 鼠标离开浮层（hover时隐藏）
    const handleDropdownMouseLeave = () => {
        if (trigger !== 'hover' || disabled) return;
        leaveTimer.current = setTimeout(() => {
            toggleVisible(false);
        }, delay);
    };

    // 点击下拉菜单项（自动关闭逻辑）
    const handleItemClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 避免触发外部点击关闭
        if (autoClose) {
            toggleVisible(false);
        }
    };

    // 计算浮层位置（避免溢出可视区）
    const calculatePosition = useCallback(() => {
        if (!visible || !triggerRef.current || !dropdownRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // 基础位置（基于触发元素）
        let finalPlacement = placement;
        let style = {
            top: '0px',
            left: '0px',
            visibility: 'visible' // 先显示才能计算尺寸，后续根据位置调整
        };

        // 处理垂直方向溢出（top/bottom）
        if (finalPlacement.includes('bottom')) {
            const bottomY = triggerRect.bottom + dropdownRect.height;
            // 若底部溢出，自动切换到top
            if (finalPlacement === 'bottom-auto' && bottomY > viewport.height) {
                finalPlacement = 'top';
            }
        }
        if (finalPlacement.includes('top')) {
            const topY = triggerRect.top - dropdownRect.height;
            // 若顶部溢出，自动切换到bottom
            if (finalPlacement === 'top-auto' && topY < 0) {
                finalPlacement = 'bottom';
            }
        }

        // 处理水平方向溢出（left/right）
        if (finalPlacement.includes('right')) {
            const rightX = triggerRect.right + dropdownRect.width;
            if (finalPlacement === 'right-auto' && rightX > viewport.width) {
                finalPlacement = 'left';
            }
        }
        if (finalPlacement.includes('left')) {
            const leftX = triggerRect.left - dropdownRect.width;
            if (finalPlacement === 'left-auto' && leftX < 0) {
                finalPlacement = 'right';
            }
        }

        // 根据最终位置计算坐标（基于视口定位）
        switch (finalPlacement) {
            case 'top':
                style.top = `${triggerRect.top - dropdownRect.height}px`;
                style.left = `${triggerRect.left}px`;
                break;
            case 'bottom':
                style.top = `${triggerRect.bottom}px`;
                style.left = `${triggerRect.left}px`;
                break;
            case 'left':
                style.top = `${triggerRect.top}px`;
                style.left = `${triggerRect.left - dropdownRect.width}px`;
                break;
            case 'right':
                style.top = `${triggerRect.top}px`;
                style.left = `${triggerRect.right}px`;
                break;
        }

        // 应用样式
        Object.assign(dropdownRef.current.style, style);
    }, [visible, placement]);

    // 监听visible变化，计算位置
    useEffect(() => {
        calculatePosition();
        // 窗口大小变化时重新计算
        const handleResize = () => calculatePosition();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [visible, calculatePosition]);

    // 点击外部关闭浮层
    useEffect(() => {
        if (!visible) return;

        const handleClickOutside = (e: MouseEvent) => {
            const isTrigger = triggerRef.current?.contains(e.target as Node);
            const isDropdown = dropdownRef.current?.contains(e.target as Node);
            if (!isTrigger && !isDropdown) {
                toggleVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [visible, toggleVisible]);

    // 键盘交互（ESC关闭、上下键导航）
    useEffect(() => {
        if (!visible) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // ESC键关闭
            if (e.key === 'Escape') {
                toggleVisible(false);
                return;
            }

            // 上下键导航（需下拉项有类名.dropdown-item）
            const items = dropdownRef.current?.querySelectorAll('.dropdown-item');
            if (!items || items.length === 0) return;

            const currentIndex = Array.from(items).findIndex(
                item => item === document.activeElement
            );

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
                (items[nextIndex] as HTMLElement).focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = currentIndex === -1
                    ? items.length - 1
                    : (currentIndex - 1 + items.length) % items.length;
                (items[prevIndex] as HTMLElement).focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [visible, toggleVisible]);

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (enterTimer.current) clearTimeout(enterTimer.current);
            if (leaveTimer.current) clearTimeout(leaveTimer.current);
        };
    }, []);

    // 获取浮层容器（优先用body下的dropdown-container，没有则用body）
    const getDropdownContainer = () => {
        return document.getElementById('dropdown-container') || document.body;
    };

    return (
        <div
            ref={triggerRef}
            className="dropdown-trigger"
            onClick={handleTriggerClick}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            style={{ display: 'inline-block' }} // 避免触发元素占满整行
        >
            {children}

            {/* 浮层通过Portal挂载到body，避免样式隔离问题 */}
            {visible && createPortal(
                <div
                    ref={dropdownRef}
                    className="dropdown-menu"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                    onClick={handleItemClick} // 点击菜单项时触发自动关闭
                    style={{
                        position: 'fixed',
                        visibility: 'hidden', // 初始隐藏，计算位置后再显示
                        zIndex: 1000 // 确保浮层在最上层
                    }}
                >
                    {/* 箭头指示器（可选） */}
                    <div className="dropdown-arrow"></div>
                    {/* 下拉内容 */}
                    {renderDropdown()}
                </div>,
                getDropdownContainer()
            )}
        </div>
    );
};

export default Dropdown;