import React, {Suspense, useMemo, useState} from 'react';
import { Layout, Menu, Spin } from 'antd';
import { Link, RouteObject, useRoutes } from 'react-router-dom';
import EditProTable, {Column, EditableTableProps} from "./pages/Table/EditProTable";
import TableTest from "./pages/Table/TableTest";
// import EditProTable, {Column, EditableTableProps} from "./pages/Table/EditProTable";
const { Header, Content } = Layout;

const Home = React.lazy(() => import('./pages/Home'));
const ReTable = React.lazy(() => import('./pages/ReTable'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const CommonSelector = React.lazy(() => import('./pages/CommonSelector'));
// 懒加载会导致泛型组件的泛型丢失
// const EditProTable = React.lazy(() => import('./pages/Table/EditProTable'));



const App = () => {

  const routes = useMemo<RouteObject[]>(() => ([
    { path: '/', element: <Home /> },
    { path: '/retable', element: <ReTable /> },
    { path: '/edit-proTable', element: <TableTest />},
    { path: '/selector', element: <CommonSelector options={[]} defaultValue={undefined} onChange={undefined} /> },
    { path: '*', element: <NotFound /> },
  ]), []);

  const element = useRoutes(routes);

  return (
      <div style={{width: '100vw', height: '100vh', overflow: 'hidden', padding: '2vmin'}}>

          <Header>
              <Menu theme="dark" mode="horizontal" selectable={false} items={[
                  {key: 'home', label: <Link to="/">首页</Link>},
                  {key: 'retable', label: <Link to="/retable">ReTable</Link>},
                  {key: 'selector', label: <Link to="/selector">CommonSelector</Link>},
                  {key: 'table', label: <Link to="/edit-proTable">EditProTable</Link>},
              ]}/>
          </Header>
          <Content>
              <Suspense fallback={<div style={{padding: 24}}><Spin/> 页面加载中...</div>}>
                  {element}
              </Suspense>
          </Content>
      </div>
  );
};

export default App;