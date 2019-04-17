import React from 'react';
import {Input, Icon} from 'antd';
import styles from './index.scss';

const map = {
    UserName: {
        component: Input,
        props: {
            size: 'large',
            prefix: <Icon type="user" className={styles.prefixIcon}/>,
            placeholder: '用户名',
        },
        rules: [
            {
                required: true,
                message: '请输入用户名',
            },
        ],
    },
    UserEmail: {
        component: Input,
        props: {
            size: 'large',
            prefix: <Icon type="mail" className={styles.prefixIcon}/>,
            placeholder: 'email',
        },
        rules: [
            {
                required: true,
                message: '请输入email',
            },
            {
                type: 'email',
                message: '请输入正确的email',
            }
        ],
    },
    Password: {
        component: Input,
        props: {
            size: 'large',
            prefix: <Icon type="lock" className={styles.prefixIcon}/>,
            type: 'password',
            placeholder: '密码',
        },
        rules: [
            {
                required: true,
                message: '请输入密码',
            },
        ],
    },
    Mobile: {
        component: Input,
        props: {
            size: 'large',
            prefix: <Icon type="mobile" className={styles.prefixIcon}/>,
            placeholder: '手机号',
        },
        rules: [
            {
                required: true,
                message: '请输入手机号',
            },
            {
                pattern: /^1\d{10}$/,
                message: '手机号格式错误',
            },
        ],
    },
    Captcha: {
        component: Input,
        props: {
            size: 'large',
            prefix: <Icon type="mail" className={styles.prefixIcon}/>,
            placeholder: '验证码',
        },
        rules: [
            {
                required: true,
                message: '请输入验证码',
            },
        ],
    },
};

export default map;
