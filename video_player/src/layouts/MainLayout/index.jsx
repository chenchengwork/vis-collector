import styles from './index.scss';
import { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, BackTop } from 'antd';

import prompt from 'utils/prompt';

import { UrlToExtraInfoMap, getLeftMenu, getMenus, isRemoveLeftMenu } from './menuUtil';
import { logout } from 'services/auth';
import EnumRouter from 'constants/EnumRouter';

import MenuHeader from './MenuHeader';
import MenuLeft from './MenuLeft';

export MainHeader from './MainHeader';
export MainContent from "./MainContent"

@withRouter
export default class MainLayout extends PureComponent {
    state = {
        collapsed: !UrlToExtraInfoMap[this.props.match.path],
        appMenuLeftWidth: this.getLeftMenuWidth(!UrlToExtraInfoMap[this.props.match.path]),		// 左侧菜单的宽度
        openKeys: []
    };

    /**
     * 退出登录
     */
    logout = () => prompt.confirm(
        () =>  logout().then(() => this.props.history.push(EnumRouter.login), resp => prompt.error(resp.msg)),
        {title: "确定退出登录?"}
    );

    /**
	 * 获取左侧菜单宽度
     * @param {bool} collapsed
     * @return {number}
     */
    getLeftMenuWidth(collapsed) {
        // 是否移除左侧菜单
        const currentUrl = this.props.match.path;
        if(isRemoveLeftMenu(currentUrl)) return 0;

        return collapsed ? 80 : 200;
    }

    /**
	 * 左侧菜单的收起和关闭
     * @param collapsed
     */
     onLeftMenuCollapse = (collapsed) => this.setState({ collapsed, appMenuLeftWidth: this.getLeftMenuWidth(collapsed) });

    render() {
        const currentUrl = this.props.match.path;
        const { appMenuLeftWidth, collapsed } = this.state;
        return (
            <Layout className={styles["main-layout"]}>
                <MenuHeader
                    currentUrl={currentUrl}
                    menus={getMenus()}
                    logout={this.logout}
                />

                <Layout className={styles["main-content"]}>
                    <MenuLeft
                        currentUrl={currentUrl}
                        leftMenu={getLeftMenu(currentUrl)}
                        leftWidth={appMenuLeftWidth}
                        collapsed={collapsed}
                        onLeftMenuCollapse={this.onLeftMenuCollapse}
                    />

                    <Layout className={styles["app-content"]}>
                        <BackTop style={{ right: 100 }} />
                        {this.props.children}
                    </Layout>

                </Layout>

            </Layout>
        );

    }
}
