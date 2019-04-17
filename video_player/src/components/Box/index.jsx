import PropTypes from 'prop-types';
import styles from './index.scss';
import React, { Fragment } from 'react';
import BoxSpin from '../BoxSpin';

/**
 * 盒子内容
 * @param loading
 * @param isNoData
 * @param className
 * @param style
 * @param children
 * @returns {*}
 * @constructor
 */
const Box = ({loading = false, isNoData = false, className = "", style = {}, children = null}) => {
    const defaultStyle = {
        width: "100%",
        height: "100%",
    };

    return (
        <Fragment>
            {
                loading
                    ? (
                        <div className={`${styles.box} ${className}`.trim()} style={Object.assign(defaultStyle, style)}>
                            <BoxSpin />
                        </div>
                    )
                    : (
                        isNoData
                            ? <span>暂无数据</span>
                            : children
                    )
            }
        </Fragment>
    );
};

Box.propTypes = {
    loading: PropTypes.bool,
    isNoData: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object
};

export default Box;
