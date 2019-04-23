import React from 'react';
import { BrowserRouter,Route,Switch,Redirect, Link, HashRouter } from 'react-router-dom';
import loadable from './lazyCore';

// 懒加载组件
const lazy = (uri, component, props ) => {
    const LazyComponent = loadable(component);

    return () => <LazyComponent {...props} />
};

/**
 * 检测是否登录
 * @return {*}
 */
const checkLoginRedirect = () => <Redirect to="/windy" />;

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
    <BrowserRouter
        forceRefresh={!('pushState' in window.history)}
        keyLength={12}
    >
        <Switch>
            <Route exact path="/" render={() => checkLoginRedirect()}  />

            {
                routes.map((item, index) => {
                    // exact关键字表示对path进行完全匹配
                    let {uri, component, props} = item;
                    props = props || {};

                    return <Route
                        key={index}
                        path={uri}
                        exact={true}
                        component={lazy(uri, component, props)}
                    />
                })
            }

            {/*404页面*/}
            <Route component={() => <div>未找到对应的页面</div>} />

        </Switch>

    </BrowserRouter>
);

export default transformRouter;


