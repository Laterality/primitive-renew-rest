import * as React from "react";
import * as Router from "react-router-dom";

import { BoardPage } from "./pages/board.page";
import { HomePage } from "./pages/home.page";
import { WritePostPage } from "./pages/write-post.page";

export class App extends React.Component {

	public render() {
		return (
			<div className="router-wrapper">
				<Router.Route exact path="/" component={HomePage} />
				<Router.Route path="/board" component={BoardPage} />
				<Router.Route path="/write" component={WritePostPage} />
			</div>
		);
	}
}
