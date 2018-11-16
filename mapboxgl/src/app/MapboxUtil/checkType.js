const neginf = Number.NEGATIVE_INFINITY;
const posinf = Number.POSITIVE_INFINITY;
const has = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

/**
 * 验证是否是对象
 * @param val
 * @returns {boolean}
 */
export const isObject = (val) => val != null && typeof val === 'object' && Array.isArray(val) === false;

/**
 * 验证是否是朴素对象
 * @param o
 * @returns {boolean}
 */
export const isPlainObject = (o) => {
    const isObjectObject = () => isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';

    if (isObjectObject(o) === false) return false;

    const ctor = o.constructor,
        prot = ctor.prototype;

    // If has modified constructor
    if (typeof ctor !== 'function') return false;

    // If has modified prototype
    if (isObjectObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false)  return false;

    // Most likely a plain Object
    return true;
};

/**
 * 是否是数字
 * @param data
 * @returns {boolean}
 */
export const isNumber = (data) => typeof data === 'number' && data > neginf && data < posinf;

/**
 * 是否是整型
 * @param data
 * @returns {boolean}
 */
export const isInteger = (data) => typeof data === 'number' && data % 1 === 0;

/**
 * 是否是字符串
 * @param data
 * @returns {boolean}
 */
export const isString = (data) => typeof data === 'string';

/**
 * 是否是数组
 * @param arr
 * @returns {boolean}
 */
export const isArray = (arr) => Array.isArray(arr);

/**
 * 是否是boolean
 * @param bool
 * @returns {boolean}
 */
export const isBoolean = (bool) => bool === false || bool === true;

/**
 * 是否是undefined
 * @param data
 * @returns {boolean}
 */
export const isUndefined = (data) => data === undefined;

/**
 * 是否是null
 * @param data
 * @returns {boolean}
 */
export const isNull = (data) => data === null;

/**
 * 是否是函数
 * @param data
 * @returns {boolean}
 */
export const isFunction = (data) => typeof data === 'function';

/**
 * 验证是否是错误对象
 * @param value
 * @returns {boolean}
 */
export const isError = (value) => {
    switch (Object.prototype.toString.call(value)) {
        case '[object Error]': return true;
        case '[object Exception]': return true;
        case '[object DOMException]': return true;
        default: return value instanceof Error;
    }
}

/**
 * 验证是否为空
 * @param val
 * @returns {boolean}
 */
export const isEmpty = (val) => {
    // Null and Undefined...
    if (val == null) return true;

    // Booleans...
    if ('boolean' === typeof val) return false;

    // Numbers...
    if ('number' === typeof val) return val === 0;

    // Strings...
    if ('string' === typeof val) return val.length === 0;

    // Functions...
    if ('function' === typeof val) return val.length === 0;

    // Arrays...
    if (Array.isArray(val)) return val.length === 0;

    // Errors...
    if (val instanceof Error) return val.message === '';

    // Objects...
    if (val.toString === toString) {
        switch (val.toString()) {

            // Maps, Sets, Files and Errors...
            case '[object File]':
            case '[object Map]':
            case '[object Set]': {
                return val.size === 0
            }

            // Plain objects...
            case '[object Object]': {
                for (let key in val) {
                    if (has.call(val, key)) return false
                }
                return true
            }
        }
    }

    return false
};
