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

const shaderLoader = (config) => depend.merge({
    module: {
        rules: [
            {
                test: /\.glsl$/i,
                loader: 'shader-loader',
            },
        ]
    }
}, config);


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
        shaderLoader,
        // pipe.babelAntd,
        pipe.babelReact,

        pipe.miniCssExtractPlugin,
        pipe.provideReactPlugin,
        pipe.autoDllReactPlugin,
        pipe.webpackbarPlugin,

        resolve,
        output,
        entry,

    ]);
    // console.log(config.rules);
    return config;
};
