/**
 * Created by chencheng on 2017/6/16.
 */
import * as checkType from './checkType';
import { render as reactDomRender, unmountComponentAtNode } from 'react-dom';
const mountDomId = 'tj-render-dom';

/**
 * 验证是否相等
 * 文档说明: https://github.com/ljharb/is-equal
 */
export isEqual from 'is-equal';

/**
 * 深度合并对象
 * 文档说明: https://github.com/KyleAMathews/deepmerge
 */
export deepmerge from './deepmerge';

/**
 * 深度clone
 */
export deepClone from './deepClone';

/**
 * 模拟数据
 * @param data
 * @param isMockError
 * @return {Promise<any>}
 */
export const mockData = (data = null, isMockError = false) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(!isMockError) {
                resolve({
                    code: "success",
                    data,
                    msg: "success"
                })
            } else {
                reject({code: "error", data, msg: "error"});
            }
        }, 500);
    });
};


/**
 * 挂载react组件
 * @param component //reactElement react组件
 */
export const mountReact = (component) => {
    const domId = mountDomId;

    let domObject = document.querySelector('#' + domId);
    if(!domObject){
        const el = document.createElement('div');
        el.setAttribute('id', domId);
        document.querySelector('body').appendChild(el);
        domObject = el;
    }

    unmountComponentAtNode(domObject);

    reactDomRender(component, domObject);
};

/**
 * 销毁react组件
 */
export const unmountReact = () => {
    const domObject = document.querySelector('#' + mountDomId);
    if(domObject) unmountComponentAtNode(domObject);
}


/**
 * 跳转页面
 * @param url
 * @param timeout
 */
export const redirect = (url, timeout) => {
    if (checkType.isNumber(url) && typeof timeout === 'undefined') {
        timeout = url;
        url = null;
    }

    setTimeout(function () {
        location.href = url || location.href;
    }, timeout || 0);
};


/**
 * 时间格式化
 * @param {number} timestamp
 * @param {string} fmt
 * @return {string}
 */
export const dateFormat = (timestamp, fmt = "yyyy-MM-dd hh:mm:ss") => {
    const date = new Date(timestamp);

    const o = {
        "y+": date.getFullYear(),
        "M+": date.getMonth() + 1,                  //月份
        "d+": date.getDate(),                       //日
        "h+": date.getHours(),                      //小时
        "m+": date.getMinutes(),                    //分
        "s+": date.getSeconds(),                    //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S+": date.getMilliseconds()                 //毫秒
    };

    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)){
            if(k == "y+"){
                fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
            }
            else if(k=="S+"){
                var lens = RegExp.$1.length;
                lens = lens==1?3:lens;
                fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1,lens));
            }
            else{
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
    }

    return fmt;
};


/**
 * 数组去重
 * @param {Array} data
 * @return {*[]}
 */
export const uniq = (data) => Array.from(new Set(data));


/**
 * 减速节流函数
 * @param {Function} fn 需要延迟执行的函数
 * @param {Number} time 延迟时间毫秒
 * @param {Object} context
 * @return {wrapperFn}
 *
 * usage:
     const a_fn = (params) => {}
     const render = throttle(a_fn, 16, null);
     render(1);
     render(2); // 将延迟16毫秒执行
 */
export const throttle = (fn, time, context) => {
    let lock, args;

    function later () {
        // reset lock and call if queued
        lock = false;
        if (args) {
            wrapperFn.apply(context, args);
            args = false;
        }
    }

    function wrapperFn () {
        if (lock) {
            // called too soon, queue to call later
            args = arguments;

        } else {
            // lock until later then call
            lock = true;
            fn.apply(context, arguments);
            setTimeout(later, time);
        }
    }

    return wrapperFn;
};


/**
 * 防抖函数
 * @param {Function} fn     回调函数
 * @param {Number} delay    延迟事件
 * @param {Object} [context]  回调函数上下文
 * @returns {Function}
 */
export const debounce = (fn, delay, context) => {
    let timeout;

    return function(e){

        clearTimeout(timeout);

        context = context || this;
        let args = arguments

        timeout = setTimeout(function(){

            fn.apply(context, args);

        },delay)

    };
};


/**
 * 将Blod转成String
 * @param {Blob} blob       // Blob对象
 * @param {String} [characterSet]  // 字符集
 * @returns {Promise<any>}
 */
export const blobToString = (blob, characterSet = 'utf-8') => new Promise((resolve, reject)=> {
    const reader = new FileReader();
    reader.readAsText(blob, characterSet);
    reader.onload = function (e) {
        resolve(reader.result);
    };

    reader.onerror = (e) => {
        reject(e);
    };
});

/**
 * 下载文件
 * @param {String} content 下载内容
 * @param {String} fileName 文件名称
 */
export const downloadFile = (content = "", fileName = "") => {
    const blob = new Blob([content]);

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;

    document.querySelector('body').appendChild(a);
    a.click();
    document.querySelector('body').removeChild(a)
};


