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


/**
 * webpack 处理cesium
 * @param config
 */
const cesium = (config) => {
    const path = require("path");
    const CopywebpackPlugin = require("copy-webpack-plugin");
    const { merge, webpack } = depend;

    const cesiumSource = '../node_modules/cesium/Source';
    const cesiumBuild = '../node_modules/cesium/Build';

    return merge({
        resolve:{
            alias:{
                cesium: path.resolve(__dirname, cesiumSource)
            }
        },
        amd: {
            // Enable webpack-friendly use of require in Cesium
            toUrlUndefined: true
        },
        node: {
            fs: 'empty',
        },
        output: {
            sourcePrefix: "",
        },
        plugins: [
            new webpack.DefinePlugin({
                // Define relative base path in cesium for loading assets
                CESIUM_BASE_URL: JSON.stringify('public')
            }),

            new CopywebpackPlugin([
                { from: path.join(__dirname,cesiumBuild, 'Cesium/Workers'), to: path.join(config.output.path,'Workers') },
                { from: path.join(__dirname,cesiumBuild, 'Cesium/Assets'), to: path.join(config.output.path,'Assets') },
                { from: path.join(__dirname,cesiumBuild, 'Cesium/Widgets'), to: path.join(config.output.path,'Widgets') },
                { from: path.join(__dirname,cesiumBuild, 'Cesium/ThirdParty'), to: path.join(config.output.path,'ThirdParty') }
            ])
        ]

    }, config || {});
};


/**
 * 组装webpack config
 * @return {*}
 */
module.exports = (pipeNodes = []) => {
    const config = assemble([
        ...pipeNodes,
        cesium,
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

        resolve,
        output,
        entry,

    ]);

    return config;
};
