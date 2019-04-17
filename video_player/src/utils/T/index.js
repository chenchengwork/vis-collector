import locallyjs from 'locallyjs';
import * as helper from './core/helper';
import * as checkType from './core/checkType';
import * as request from './core/request';

export queryString from 'query-string';
export Cookies from 'js-cookie';
export { helper }
export { checkType }
export { request }
export const localStore = new locallyjs.Store({
    compress: true,     // 开启压缩
});

