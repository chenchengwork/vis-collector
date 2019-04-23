import React  from "react";
import {render} from "react-dom";
import Router from './router';

import App from './app';
// render(<App />, document.querySelector("#wrapper"));
render(<Router />, document.querySelector("#wrapper"));
