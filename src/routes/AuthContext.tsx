import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthState {
    roles: string[];
    loading: boolean;
}

interface AuthContextValue extends AuthState {}

const AuthContext = createContext<AuthContextValue>({ roles: [], loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // 模拟首屏请求：获取用户角色
        const timer = setTimeout(() => {
            // 这里模拟返回 ['user'] 或 ['admin']；你可以接入真实接口
            const fetchedRoles = ['admin'];
            setRoles(fetchedRoles);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const value = useMemo(() => ({ roles, loading }), [roles, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


