import * as React from "react";
import * as Router from "react-router-dom";

import { Home } from "./pages/home";

export class App extends React.Component {

	public render() {
		return (
			<div>
				<Router.Route exact path="/" component={Home} />
			</div>
		);
	}
}
