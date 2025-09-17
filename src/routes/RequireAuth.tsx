import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export interface RequireAuthProps {
    requiredRoles?: string[];
    redirectTo?: string;
    children: React.ReactElement;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ requiredRoles = [], redirectTo = '/', children }) => {
    const location = useLocation();
    const { roles, loading } = useAuth();

    if (loading) {
        return null; // 可替换为全局 Loading
    }

    const hasAccess = requiredRoles.length === 0 || requiredRoles.some(r => roles.includes(r));
    if (!hasAccess) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return children;
};

export default RequireAuth;


