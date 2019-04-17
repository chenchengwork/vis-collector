import deepmergeOrigin from "deepmerge";

/**
 * 验证是否是对象
 * @param val
 * @returns {boolean}
 */
const isObject = (val) => val != null && typeof val === 'object' && Array.isArray(val) === false;

/**
 * 验证是否是朴素对象
 * @param o
 * @returns {boolean}
 */
const isPlainObject = (o) => {
    const isObjectObject = () => isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';

    if (isObjectObject(o) === false) return false;

    let ctor = o.constructor,
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
 * 深度合并, 并且可以只能的合并数组的元素
 * @param rest
 * @return {*|Object}
 *
 * usage:
    deepmerge(
         {
            a: 1,
            b: [
                {x: 1},
                {
                    y: [
                        {a: 1}
                    ]
                },
                {z: 1},
                {w: 1}
            ]

            // b: [1,2]
        },
        {
                a: 2,
                b: [
                    {x: 2},
                    {
                        a: [2],
                        y:[
                            {
                                a: () => 1
                            },
                            3
                        ]
                    },
                    {nb: 23}
                ]

                // b: [2,3,4]
        })
 */
const deepmerge = (...rest) => deepmergeOrigin.all(rest, {
    arrayMerge: (destArray, sourceArray, options) => {
        if(destArray.length < 1) return sourceArray;

        if(sourceArray.length >= destArray.length){
            return sourceArray.map((item, index) => {
                if(isPlainObject(item) && isPlainObject(destArray[index])){
                    return deepmerge(destArray[index], item);
                }

                return item;
            });
        }else {
            return destArray.map((item, index) => {
                if(isPlainObject(item) && isPlainObject(sourceArray[index])){
                    return deepmerge(item, sourceArray[index]);
                }

                return sourceArray[index]? sourceArray[index] : item;
            });
        }
    }
});

// 直接覆盖数组, 不在数组中进一步merge
// const deepmerge = (...rest) => deepmergeOrigin.all(rest, {arrayMerge: (destinationArray, sourceArray, options) => sourceArray});

export default deepmerge;
