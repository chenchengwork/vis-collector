import React, { PureComponent } from 'react';
import {  Alert } from 'antd';
import { withRouter } from 'react-router-dom';
import prompt from 'utils/prompt';

import Login from './lib';
import styles from './index.scss';
const { Tab, UserEmail, Password, Submit } = Login;
import EnumEnv from 'constants/EnumEnv';
import { login } from 'services/auth';

@withRouter
export default class LoginPage extends PureComponent {
    static defaultProps = {
        login: {
            status: "success",
            type: ""
        },
        submitting: false,
    };

    state = {
        type: 'account',
    };

    onTabChange = type => this.setState({ type });

    handleSubmit = (err, values) => {
        if(err) return false;
        const { user_email, password } = values;

        this.setState({submitting: true}, () => {
            login(user_email, password).then(resp => {
                prompt.success("登录成功");
                this.setState({submitting: false});
                this.props.history.push(EnumEnv.login.defaultRedirectUrl);
            }, resp => {
                prompt.error(resp.msg);
                this.setState({submitting: false});
            })
        })
    };

    renderMessage = content => {
        return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
    };

    render() {
        const { login, submitting } = this.props;
        const { type } = this.state;

        return (
            <div className={styles.main}>
                <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
                    <Tab key="account" tab="登录">
                        {
                            login.status === 'error' &&
                            login.type === 'account' &&
                            !submitting &&
                            this.renderMessage('账户或密码错误')
                        }
                        <UserEmail name="user_email" placeholder="邮箱" />
                        <Password name="password" placeholder="密码" />
                    </Tab>

                    <Submit loading={submitting}>登录</Submit>
                </Login>
            </div>
        );
    }
}

