import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Layout, Menu } from 'antd';

import AppIcon from "../AppIcon";
import styles from "./index.scss";

// 获取默认展开的菜单keys
const recursionOpenKeys = (menus, currentUrl, openKeys = []) => {
    for (let i = 0; i < menus.length; i++) {
        const item = menus[i];
        if (item.url.indexOf(currentUrl) !== -1) {
            if(Array.isArray(item.url)){
                openKeys.push(item.url.join('-'))
            }

            if(item.children && item.children.length > 0){
                recursionOpenKeys(item.children, currentUrl, openKeys);
            }
        }
    }

    return openKeys;
};

// 递归获取菜单
const formatLeftMenu = (menus, currentUrl) => menus.map((val) => {
    if (val.children.length > 0) {
        return (
            <Menu.SubMenu
                key={val.url.join('-')}
                title={<span>{ val.icon ? <AppIcon {...val.icon} style={{ fontSize: 14, marginRight: 10 }} /> : null}<span>{val.label}</span></span>}
            >
                {formatLeftMenu(val.children, currentUrl)}

            </Menu.SubMenu>
        );
    } else {
        let realUrl = (() => {
            if (Array.isArray(val.url)) {
                if (val.url.indexOf(currentUrl) !== -1) {
                    return currentUrl;
                }

                return val.url[0];
            }

            return val.url;
        })();

        const linkTo = Array.isArray(val.url) ? val.url[0] : val.url;
        const target = val.target || "";
        const RouteLink = target === "_blank" ? ({children, to,  ...rest}) => (<a href={to} {...rest}>{children}</a>) : Link;

        return (
            <Menu.Item key={realUrl}>
                <RouteLink to={linkTo} target={target}>
                    {val.icon ? <AppIcon {...val.icon} style={{ fontSize: 14, marginRight: 10 }} /> : null}
                    <span>{val.label}</span>
                </RouteLink>
            </Menu.Item>
        );
    }
});

const MenuLeft = ({leftMenu, currentUrl, leftWidth, collapsed, onLeftMenuCollapse}) => {
    if (leftMenu.length < 1) return null;

    return (
        <Layout.Sider
            theme="dark"
            className={styles["menu-left"]}
            width={leftWidth}
            collapsible
            collapsed={collapsed}
            onCollapse={onLeftMenuCollapse}
        >
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[currentUrl]}
                defaultOpenKeys={recursionOpenKeys(leftMenu, currentUrl)}
                style={{ borderRight: 0, overflow: 'hidden' }}
            >
                {formatLeftMenu(leftMenu, currentUrl)}
            </Menu>
        </Layout.Sider>
    );
};

MenuLeft.propTypes = {
    leftMenu: PropTypes.array.isRequired,
    currentUrl: PropTypes.string.isRequired,
    leftWidth: PropTypes.number.isRequired,
    collapsed: PropTypes.bool.isRequired,
    onLeftMenuCollapse: PropTypes.func.isRequired,
};

export default MenuLeft;
