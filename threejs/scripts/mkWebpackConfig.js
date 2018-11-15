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
        ]
    }
}, config);

const threejsProvidePlugin = (config) => {
    return depend.merge({
        plugins: [
            // 自动加载赋值模块
            new depend.webpack.ProvidePlugin({
                THREE: 'three'
            }),
        ],
    }, config || {})
};


/**
 * 组装webpack config
 * @return {*}
 */
module.exports = (pipeNodes = []) => {
    const config = assemble([
        ...pipeNodes,
        pipe.base,
        pipe.staticResource,
        pipe.css,
        pipe.scss,
        // pipe.babelAntd,
        pipe.babelReact,

        pipe.miniCssExtractPlugin,
        pipe.provideReactPlugin,
        pipe.autoDllReactPlugin,
        pipe.webpackbarPlugin,
        threejsProvidePlugin,

        resolve,
        output,
        entry,
    ]);

    return config;
};
