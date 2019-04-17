import { configure } from 'mobx';
/**
 * mobx的配置
 */
configure({
    enforceActions: "observed",     // 强制使用action
});

export default {
    screen: require("./pages/Screen/models").default
};
