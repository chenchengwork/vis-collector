/**
 * Created by chencheng on 2017/8/28.
 */
import {checkType, helper} from 'utils/T';
import { permission } from 'services/auth';
import { EnumDefaultMenus, EnumCollapsedLeftMenuUrls } from './constants/EnumDefaultMenus';

/**
 * url和分类值的对应关系
 * @type {{}}
 */
export const UrlToExtraInfoMap = {};

/**
 * 配置菜单文件
 */
const EnumMenus = (() => {
    /**
     * 获取url对应额外信息的Item
     * @param url
     */
    const getUrlToExtraInfoMapItem = (url, icon) => ({ icon, isCollapsedLeftMenu: EnumCollapsedLeftMenuUrls.indexOf(url) !== -1 });

    const formatMenus = (menus, urls = []) => {
        menus.forEach(menu => {
            if (checkType.isUndefined(menu.children)) menu.children = [];

            if (Array.isArray(menu.url)) {
                urls = urls.concat(menu.url);
                menu.url.forEach(url => UrlToExtraInfoMap[url] = getUrlToExtraInfoMapItem(url,menu.icon));

            } else if (checkType.isString(menu.url)) {
                urls.push(menu.url);
                UrlToExtraInfoMap[menu.url] = getUrlToExtraInfoMapItem(menu.url,menu.icon)
            }

            if (Array.isArray(menu.children) && menu.children.length > 0) {
                if(menu.url){
                    if(checkType.isString(menu.url)){
                        menu.url = [menu.url];
                    }
                } else {
                    menu.url = [];
                }

                const result = formatMenus(menu.children);

                menu.url = helper.uniq(menu.url.concat(result.urls));
                urls = helper.uniq(urls.concat(menu.url));
            }
        });

        return {
            menus,
            urls
        };
    };


    let menus = formatMenus(helper.deepClone(EnumDefaultMenus)).menus;

    // ------------权限过滤菜单--------------
    // TODO 需要权限过滤将其开启
    // const permissionKeys = Object.keys(permission.get());
    //
    // function difference(array, values){
    //     if(!array || !Array.isArray(array) || array.length<=0){
    //         return [];
    //     }
    //
    //     const except=Array.from(arguments).slice(1);
    //     if(!except || except.length<=0) return array.concat();
    //
    //     return array.filter(function(value){
    //         return except.indexOf(value) < 0;
    //     });
    // }
    //
    // const permissionMenus = (menus) => {
    //     let newMenus = [];
    //     for (let i = 0; i < menus.length; i++){
    //         let menu = menus[i];
    //         let childrenPermission = [];
    //         if (Array.isArray(menu.children) && menu.children.length > 0) {
    //             childrenPermission = menu.children.map(item => item.uniqueIdentity);
    //             menu.children = permissionMenus(menu.children);
    //         }
    //
    //         if (!(!permission.can(menu.uniqueIdentity) && difference(childrenPermission, permissionKeys).length === childrenPermission.length)) {
    //             newMenus.push(menu);
    //         }
    //     }
    //
    //     return newMenus;
    // };
    //
    // menus = permissionMenus(menus);

    return menus;
})();

/**
 * 是否移除左侧菜单
 * @param url
 * @return {boolean}
 */
export const isRemoveLeftMenu = (url) => {

    for (let j = 0; j < EnumMenus.length; j++) {
        const menu = EnumMenus[j];
        let isCheck = false;

        if (menu.url){
            if (Array.isArray(menu.url) && menu.url.indexOf(url) !== -1){
                isCheck = true;
            } else if(checkType.isString(menu.url) && menu.url == url) {
                isCheck = true;
            }
        }

        if (isCheck){
            if (!menu.children || menu.children.length < 1) {
                return true;
            }else {
                return false;
            }
        }
    }

    return false;
};

/**
 * 获取菜单的类别
 * @returns {Array}
 */
export const getMenus = () => EnumMenus;

/**
 * 获取左侧菜单
 * @param url
 * @returns {Array}
 */
export const getLeftMenu = (url) => {
    const menu = EnumMenus;

    for (let i = 0; i < menu.length; i++) {
        if ((Array.isArray(menu[i].url) && menu[i].url.indexOf(url) !== -1) ||
            (checkType.isString(menu[i].url) && menu[i].url === url)
        ) {
            return menu[i].children;
        }
    }

    return [];
};
