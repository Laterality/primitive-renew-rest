/**
 * Frontend Index
 * 
 * author: Jin-woo Shin
 * date: 2018-04-13
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Router from "react-router-dom";

import { App } from "./App";

ReactDOM.render(
	<Router.BrowserRouter>
		<App/>
	</Router.BrowserRouter>,
	document.getElementById("root"),
);
