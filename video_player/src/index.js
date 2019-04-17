/**
 * 入口文件
 */
import React  from "react";
import {render} from "react-dom";

import lazyScreen from 'utils/loadable/lazyScreen';
const Main = lazyScreen(import("./Main"));

render(<Main />, document.getElementById("wrapper"));


