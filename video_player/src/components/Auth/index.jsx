import React from "react";
import PropTypes from 'prop-types';
import { permission } from 'services/auth';

/**
 * 权限验证组件
 * @param {String} mark 标记
 * @param children
 * @return {null}
 */
const Auth = ({ mark, children }) => (Auth.can(mark) ? children : null);

// 验证是否具有可写权限
Auth.can = (mark) => permission.can(mark);

Auth.propTypes = {
    mark: PropTypes.string.isRequired
};

export default Auth;
