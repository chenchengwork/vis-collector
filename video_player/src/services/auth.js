import { request, localStore, checkType, Cookies } from 'utils/T';
import {proxyAPI} from 'services/proxyAPI';
import EnumEnv from 'constants/EnumEnv';
const { get, postJSON } = request;

/**
 * 权限管理
 */
class Permission {
    constructor() {
        this.localPermissioKey = "sk_permission";
    }

    /**
     * 是否已经登录
     * @return {boolean}
     */
    isLogin = () => {
        if(EnumEnv.login.isStartLoginCheck){
            const isLogined = !!Cookies.get(EnumEnv.login.cookieKey);
            // 清空缓存
            if(!isLogined) this.clear();
console.log('111')
            return isLogined;
        }
        console.log('222')
        return true;
    }

    /**
     * 验证是否有权限
     */
    can(mark) {
        const permissions = this.get();

        return Reflect.has(permissions, mark) ? permissions[mark] : false;
    }

    /**
     * 保存权限
     * @param permissions
     */
    set(permissions = {}) {
        if(!checkType.isPlainObject(permissions)) throw new Error("权限格式不正确");

        localStore.set(this.localPermissioKey, permissions);
    }

    /**
     * 获取权限
     * @return {*}
     */
    get(){
        return localStore.get(this.localPermissioKey) || {};
    }

    /**
     * 清除权限
     */
    clear(){
        localStore.remove(this.localPermissioKey);
    }
}

/**
 * 导出权限
 * @type {Permission}
 */
export const permission = new Permission();


/**
 * 登录
 * @param {String} user_email
 * @param {String} password
 * @return {Promise}
 */
export const login = (user_email, password) => {
    return postJSON(proxyAPI("login"), {user_email, password}).then((resp) => {
        // 用于保存当前登录者的权限信息
        permission.set({});

        return resp;
    });
};

/**
 * 退出登录
 * @return {Promise}
 */
export const logout = () => get(proxyAPI("logout")).then(resp => {
    // 清空权限信息
    permission.clear();

    return resp;
});


/**
 * 注册
 * @param {Object} params
 * @return {Promise}
 */
export const register = (params = {}) => postJSON(proxyAPI("register"), params);


