import ScreenLoading from './ScreenLoading';
import lazy from './lazyCore';

/**
 * 首屏默认加载效果
 * @param rest
 * @return {*}
 */
const lazyCom = (...rest) => {
    if(!rest[1]){
        rest[1] = [ScreenLoading, {}];
    }

    return lazy(...rest);
};

lazyCom.Loading = ScreenLoading

export default lazyCom;
