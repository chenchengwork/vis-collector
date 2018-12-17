import AntdSpin from './AntdSpin';
import lazy from './lazyCore';

/**
 * 默认使用antd spin
 * @param rest
 * @return {*}
 */
const lazyCom = (...rest) => {
    if(!rest[1]){
        rest[1] = [AntdSpin, {}];
    }

    return lazy(...rest);
};

lazyCom.Loading = AntdSpin;

export default lazyCom;
