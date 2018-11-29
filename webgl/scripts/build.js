/**
 * 打包编译
 */
const mkWebpackConfig = require("./mkWebpackConfig");
const { doBuild, pipe } = require("webpack-pipe");

doBuild(mkWebpackConfig([pipe.production, pipe.autoDllReactPlugin]));

