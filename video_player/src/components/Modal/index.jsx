import React from "react";
import styles from "./index.scss";
import { Modal } from 'antd';

/**
 * Modal
 * @param rest
 * @returns {*}
 * @constructor
 */
const T_Modal = ({...rest}) => <Modal className={styles["t-modal"]} {...rest} />;

export default T_Modal;
