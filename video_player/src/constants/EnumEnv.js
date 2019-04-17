import { deepmerge } from 'utils/T/core/helper';

const rootPath = window.ENV ? window.ENV.rootPath || "/" : "/";

const EnumEnv = deepmerge({
    rootPath,                                      // 根路由前缀
    apiDomain: "",                                 // api域名
    apiPrefix: '/',                                // api前缀
    respCode:{
        apiSuccessCode: "success",                          // 请求成功响应code
        errorCode: "error",                                 // 请求失败响应code
        noLoginCode: "noLogin",                             // 未登录的code
        invalidParamCode: "invalid_param",                  // 参数校验失败code
    },

    login: {
        isStartLoginCheck: true,                        // 是否开启登录验证
        cookieKey: "vis_sess",                          // 登录验证的cookie
        defaultRedirectUrl: rootPath + "video",        // 默认跳转页面
        loginUrl: rootPath + "login",                   // 登录页面路由
    }
}, window.ENV || {});

export default EnumEnv;
