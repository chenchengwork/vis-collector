/**
 * Created by chencheng on 2017/6/10.
 */

window.ENV = (function () {
    var rootPath = '/';     // 路由的根路径

    return {
        apiDomain: 'http://localhost:8360',         // api请求接口   测试服务器
        rootPath: rootPath,                       	// 路由的根路径
        apiSuccessCode: 0,                          // api响应成功的code

        login: {
            errorCode: 900,                                 // 未登录的error code
            isCheckLogin: false,                            // web端是否验证登录
            cookieKey: '__login_user_info__',               // 登录成功的cookie key, 用于验证当前页面是否登录
            defaultRedirectUrl: rootPath + 'login',  // 登录成功默认重定向的url
            loginUrl: rootPath + 'login',                   // 登录页面url

            // 不需要验证是否登录的路由配置
            noCheckIsLoginRoutes: [
                rootPath + 'login',
            ]
        },

        socket: {
            etl: {
                isStart: true,                          // 是否开启etl websocket服务
                domain: 'ws://10.0.3.179:9091',         // etl websocket domain地址
                opts: {
                    path: '/pubsub',
                }
            }
        },

        mock: {
            apiDomain: 'http://localhost:8180',     // mockApi请求接口
            isStart: false,                         // 是否开启mock
        },
    }
})();
