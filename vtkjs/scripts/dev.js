/**
 * Created by chencheng on 16-11-17.
 */
const mkWebpackConfig = require("./mkWebpackConfig");
const { doDev, pipe } = require("webpack-pipe");

doDev({
	webpackConfig: mkWebpackConfig([pipe.development]),
    devServerConfig: {},
	host: "localhost",
	port: 4000
});



