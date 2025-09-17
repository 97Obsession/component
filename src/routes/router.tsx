import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';

const Home = React.lazy(() => import('../pages/Home'));
const ReTable = React.lazy(() => import('../pages/ReTable'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const Admin = React.lazy(() => import('../pages/Admin'));
const CommonSelector = React.lazy(() => import('../pages/CommonSelector'));
import RequireAuth from './RequireAuth';
// import CommonSelector from "../pages/CommonSelector";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'retable', element: <ReTable /> },
      { path: 'selector', element: <CommonSelector /> },
      {
        path: 'admin',
        element: (
          <RequireAuth requiredRoles={["admin"]} redirectTo="/">
            <Admin />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);


