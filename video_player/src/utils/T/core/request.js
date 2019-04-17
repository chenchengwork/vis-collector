/**
 * Created by chencheng on 2017/6/14.
 */

import axios from 'axios';
import * as checkType from './checkType';
import Cookies from 'js-cookie';
import EnumRouter from 'constants/EnumRouter'
import EnumEnv from 'constants/EnumEnv';

// TODO 解决IE报warning Unhandled Rejections Error 参数书不正确的问题
Promise._unhandledRejectionFn = function (rejectError) {};

const { apiDomain, respCode } = EnumEnv;

class Csrf{
    // 校验是否是安全方法
    safeMethod = (method) => (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method));

    // 设置安全认证token
    setToken = (options) => {
        let { method } = options;
        const csrfToken = Cookies.get("csrfToken");
        if(!this.safeMethod(method) && csrfToken){
            options.headers["x-csrf-token"] = csrfToken;
        }

        return options;
    }
}

const csrf = new Csrf();


const Singleton = (function () {
    let instantiated;

    function init() {

        return axios.create({
            baseURL: apiDomain,

            // `withCredentials`指示是否跨站点访问控制请求
            withCredentials: true,

            // “responseType”表示服务器将响应的数据类型
            // 包括 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
            responseType: 'json',

            // headers`是要发送的自定义 headers
            headers: {
                // 'X-Requested-With': 'XMLHttpRequest'
            },

        });
    }

    return {
        getInstance: function () {

            if (!instantiated) {
                instantiated = init();
            }

            return instantiated;
        }
    };
})();

/**
 * 处理下载
 * @param resp
 */
const processDownload = (resp) => {
    if(!resp.headers['content-disposition']){
        throw new Error("response header中缺少content-disposition属性");
    }
    const matchFilename = resp.headers['content-disposition'].match(/filename=['"](.*)["']/);
    let filename = null;
    if (matchFilename) filename = matchFilename[1];
    // const blob = new Blob([resp.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'}); // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet这里表示xlsx类型
    // const blob = new Blob([resp.data], {type: 'application/zip;charset=utf-8'}); // application/zip
    const blob = new Blob([resp.data]);
    let downloadElement = document.createElement('a');
    const href = window.URL.createObjectURL(blob);      //创建下载的链接
    downloadElement.href = href;
    downloadElement.download = filename;                //下载后文件名
    document.body.appendChild(downloadElement);
    downloadElement.click();                            //点击下载
    document.body.removeChild(downloadElement);         //下载完成移除元素
    window.URL.revokeObjectURL(href);                   //释放掉blob对象
};


/**
 *
 * @param options
 * @return {Promise}
 * @private
 */
const _request = (options = {}, isDownload = false) => {
    return new Promise((resolve, reject) => {
        options = csrf.setToken(options);

        const {  apiSuccessCode, errorCode, noLoginCode, invalidParamCode } = respCode;
        Singleton.getInstance().request(options).then((resp) => {
            // 处理下载
            if(isDownload){
                processDownload(resp);
                resolve({code: apiSuccessCode, data: [], msg: "download success"});
            }else {
                if(resp.status === 200){
                    if (checkType.isPlainObject(resp.data)){
                        const {data, code, msg} = resp.data;
                        if (apiSuccessCode === code) {
                            return resolve({code, data, msg});

                        }else if(code == noLoginCode){  // 未登录
                            window.location.href = EnumRouter.login;
                            reject({code: noLoginCode, data: resp.data, msg});

                        }else if(code == invalidParamCode){ // 参数校验失败
                            reject({code: invalidParamCode, data, msg});

                        }else { // 系统内部错误
                            return reject({code: errorCode, data: null, msg});
                        }
                    }

                    resolve({code: apiSuccessCode, data: resp.data, msg: "请求成功"});
                }else {
                    reject({code: errorCode, data: null, msg: resp.message});
                }
            }
        }).catch((error) => {
            reject({
                code: errorCode,
                data: null,
                msg: error.message
            });
        });

    });
};


/**
 * get请求
 * @param {string} url
 * @param {object} params
 * @param {object} options
 * @returns {Promise}
 */
export function get(url, params = {}, options = {}) {
    Object.assign(options, {
        url,
        method: 'get',
        params: params,
    });

    return _request(options);
}

/**
 * post请求
 * @param {string} url
 * @param {object} params
 * @param {object} options
 * @returns {Promise}
 */
export function post(url, params = {}, options = {}) {
    let requestParams = new URLSearchParams();
    for (let [k, v] of Object.entries(params)) {
        requestParams.append(k, v);
    }

    options = Object.assign({
        url,
        method: 'post',
        data: requestParams,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, options);

    return _request(options);
}


/**
 * post json请求
 * @param {string} url
 * @param {object} params
 * @param {object} options
 * @returns {Promise}
 */
export function postJSON(url, params = {}, options = {}) {
    options = Object.assign({
        url,
        method: 'post',
        data: params,
        headers: {
            'Content-Type': 'application/json'
        }
    }, options);

    return _request(options);
}


/**
 * 请求上传文件
 * @param {String} url
 * @param {Object} params
 * @param {Function} onUploadProgress
 * @param {Object} options
 * @returns {Promise}
 */
export function upload(url, params = {}, onUploadProgress = (progressEvent) => {}, options = {}) {
    if (!(params instanceof FormData)) {
        let formData = new FormData();
        for (let [k, v] of Object.entries(params)) {
            if(Array.isArray(v)){
                v.forEach((item) => formData.append(`${k}[]`, item));
            }else {
                formData.append(k, v);
            }
        }
        params = formData;
    }

    options = Object.assign({
        url,
        method: 'post',
        data: params,
        // `onUploadProgress`允许处理上传的进度事件
        onUploadProgress: onUploadProgress,

        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }, options);

    return _request(options);
}

/**
 * restful delete
 * @param {String} url
 * @param {Object} params
 * @param {Object} options
 * @returns {Promise}
 */
export function del(url, params = {}, options = {}) {
    options = Object.assign({
        url,
        method: 'delete',
        data: params,
        headers: {
            'Content-Type': 'application/json'
        }
    }, options);

    return _request(options);
}


/**
 * restful put
 * @param {String} url
 * @param {Object} params
 * @param {Object} options
 * @returns {Promise}
 */
export function put(url, params = {}, options = {}) {
    options = Object.assign({
        url,
        method: 'put',
        data: params,
        headers: {
            'Content-Type': 'application/json'
        }
    }, options);

    return _request(options);
}


/**
 * 并发执行多个请求
 * @returns {Promise.<*>}
 */
export function all(args = null) {

    return Array.isArray(args) ? Promise.all(args) : Promise.all([...arguments]);
}


/**
 * 格式化URL参数
 * @param url
 * @param params
 * @returns {*}
 */
export function formatUrlParams(url, params = {}) {
    Object.keys(params).forEach((key, index) => {
        if (index === 0 && url.indexOf('?') === -1) {
            url += '?' + key + '=' + params[key];
        } else {
            url += '&' + key + '=' + params[key];
        }
    });

    return url;
}


/**
 * 模拟响应数据
 * @param {Any} data
 * @return {Promise<any>}
 */
export function mockRespData(data) {
    const {  apiSuccessCode } = respCode;
    return new Promise((resolve) => {
        setTimeout(() => resolve({
            code: apiSuccessCode,
            msg: "success",
            data
        }), 500);
    })
}
