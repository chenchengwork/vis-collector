/**
 * Created by chencheng on 16-11-17.
 */
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';
const mkWebpackConfig = require("./mkWebpackConfig");
const { doDev, pipe } = require("webpack-pipe");

doDev({
	webpackConfig: mkWebpackConfig([pipe.development]),
    devServerConfig: {},
	host: "localhost",
	// host: "10.0.4.93",
	port: 4000
});



