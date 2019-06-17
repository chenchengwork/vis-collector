const { assemble, pipe, depend } = require("webpack-pipe");

// 入口配置
const entry = (config) => depend.merge({
    entry:{
        app: ["./src"],
    }
}, config);


// 输出配置
const output = (config) => depend.merge({
    output:{
        publicPath: "/public/",
        path: depend.tool.resolveAppPath("public/build"),
    }
}, config);


const resolve = (config) => depend.merge({
    resolve: {
        "modules": [
            // "node_modules",
            "web_modules",
            "src"
        ],
        extensions: [ '.tsx', '.ts', '.js', ".jsx" ],
    }
}, config);

/**
 * babel支持国际化配置
 * @param config
 * @return {*}
 */
const intl =  (config) => {
    config.module.rules = config.module.rules.map(rule => {
        if (rule.loader === "babel-loader"){
            // 使用的babel插件是: babel-plugin-react-intl
            rule.options.cacheDirectory = false; // 保证提取的信息是最新的
            // rule.options.plugins.push(['react-intl', {"messagesDir": "./i18n-messages"}]);

            return rule;
        }

        return rule;
    });

    return config;
};

/**
 * 组装webpack config
 * @return {*}
 */
module.exports = (pipeNodes = []) => {
    const config = assemble([
        ...pipeNodes,
        intl,
        pipe.base,
        // pipe.staticResource,
        // pipe.css,
        // pipe.scss,
        // pipe.babelReact,
        pipe.babelTsReact,
        // pipe.miniCssExtractPlugin,
        pipe.provideReactPlugin,
        pipe.webpackbarPlugin,

        resolve,
        // typescript,
        output,
        entry,

    ]);

    return config;
};
