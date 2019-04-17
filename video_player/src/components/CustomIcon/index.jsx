import React from 'react';
import {Icon} from 'antd';
import PropTypes from 'prop-types';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: require("./iconfont"), // 在 iconfont.cn 上生成, 下载到本地icon.js中
});

/**
 * 自定义icon
 * @param type
 * @param rest
 * @return {*}
 * @constructor
 */
const CustomIcon = ({ type,  ...rest }) => {

    return <MyIcon type={`icon-${type}`} {...rest} />;
};
CustomIcon.propTypes = {
    type: PropTypes.string.isRequired,      // icon类型
};

export default CustomIcon;
