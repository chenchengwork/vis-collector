import React, { Fragment } from 'react';
import { BrowserRouter,Route,Switch,Redirect,Link, HashRouter } from 'react-router-dom';
import loadable from 'utils/loadable';

import MainLayout from 'layouts/MainLayout';
const Exception = loadable(import("components/Exception"));
const ErrorBoundary = loadable(import("components/ErrorBoundary"));

import EnumRouter from 'constants/EnumRouter';
import EnumEnv from 'constants/EnumEnv';
import { permission } from "services/auth";

// 懒加载组件
const lazy = (uri, component, isMainLayout, store, props ) => {
    if(!permission.isLogin() && uri !== EnumEnv.login.loginUrl) return () => <Redirect to={EnumEnv.login.loginUrl} />;

    const LazyComponent = loadable(component);
    props = {store, ...props};
    if(!props.store) delete props.store;
    const Layout = isMainLayout ? MainLayout : Fragment;

    return () => <Layout><LazyComponent {...props} /></Layout>
};

/**
 * 检测是否登录
 * @return {*}
 */
const checkLoginRedirect = () => <Redirect to={permission.isLogin() ? EnumEnv.login.defaultRedirectUrl : EnumEnv.login.loginUrl} />;

/**
 * 路由配置
 * @param {Array} routes
 * @return {Function}
 *
 * usage:
 *  routes = [
         {
             uri: "/",                                          // 该字段必填
             component: import("./components/CodeEditor"),      // 该字段必填
             props: "传入组件的props"                             // 该字段可选, 必须是对象
             isMainLayout: true,                                // 该字段可选, 是否开启MainLayout布局, 默认是true
         },
    ];
 */
const transformRouter = (routes) => () => (
    <ErrorBoundary>
        <BrowserRouter
            forceRefresh={!('pushState' in window.history)}
            keyLength={12}
        >
            <Switch>
                <Route exact path={EnumRouter.rootRoute} render={() => checkLoginRedirect()} />
                <Route exact path="/" render={() => checkLoginRedirect()}  />

                {
                    routes.map((item, index) => {
                        // exact关键字表示对path进行完全匹配
                        let {uri, component, isMainLayout, store, props} = item;
                        props = props || {};
                        isMainLayout = typeof isMainLayout === 'undefined' ? true : isMainLayout;

                        return <Route
                            key={index}
                            path={uri}
                            exact={true}
                            component={lazy(uri, component, isMainLayout, store, props)}
                        />
                    })
                }

                {/*404页面*/}
                <Route component={() => <Exception type="404" style={{ minHeight: 500, height: '100%' }} linkElement={Link} />} />

            </Switch>

        </BrowserRouter>
    </ErrorBoundary>
);

export default transformRouter;


