/**
 * 打包编译
 */
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
const mkWebpackConfig = require("./mkWebpackConfig");
const { doBuild, pipe } = require("webpack-pipe");

doBuild(mkWebpackConfig([pipe.production, pipe.autoDllReactPlugin]));

