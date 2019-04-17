import { request } from 'utils/T';
import {proxyAPI} from 'services/proxyAPI';
const { get, postJSON, put, del } = request;

// TODO 测试使用
import * as mockData from './mockData';

/**
 * 获取分页列表
 * @param {Object} params
 * @param {Number} params.page
 * @param {Number} params.pageSize
 * @param {Object} params.search
 * @param {String} [params.search.name]
 * @return {Promise}
 */
export const getPageList =  (params) => {
    params.page = params.page || 1;
    params.pageSize = params.pageSize || 15;
    params.search = params.search || {};

    return mockData.getPageList();

    return get(proxyAPI("/screen/getPageList"), params);
}

/**
 * 获取单个元素
 * @param {String} screen_id
 * @return {Promise}
 */
export const getScreen = (screen_id) => {
    return mockData.getItem(screen_id);

    return get(proxyAPI("/screen/getScreen"), {screen_id})
}

/**
 * 创建元素
 * @param {Object} params
 * @param {String} params.name
 * @return {Promise}
 */
export const createScreen = (params = {}) => {

    return mockData.createItem(params);

    return postJSON(proxyAPI("/screen/createScreen"), params)
}

/**
 * 更新元素
 * @param {String} screen_id
 * @param {Object} params
 * @param {String} [params.name]
 * @param {String} [params.config]
 * @return {Promise}
 */
export const updateScreen = (screen_id, params = {}) => {

    return mockData.updateItem(screen_id, params);

    return put(proxyAPI(`/screen/updateScreen?screen_id=${screen_id}`), params)
}

/**
 * 删除元素
 * @param {Array} screen_ids
 * @return {Promise}
 */
export const deleteScreen =(screen_ids = []) => {

    return mockData.deleteItem(screen_ids);

    return del(proxyAPI("/screen/deleteScreen"), {screen_ids});
}


