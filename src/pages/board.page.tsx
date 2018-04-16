import * as query from "query-string";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

export interface IBoardPageProps {
	title: string;
	page: number;
	location: Location;
	match: any;
}

export class BoardPage extends React.Component<IBoardPageProps, {location: any, match: any}> {

	public render() {
		const queries = query.parse(location.search);
		// console.log(this.props.location);
		// console.log(this.props.match);
		console.log("title: " + queries["title"]);
		console.log("page: " + queries["page"]);
		return (
			<div>
				<nav className="navbar"></nav>
				<h1 className="board-title"></h1>
				<ReactRouter.Link to="/" >Home</ReactRouter.Link>

			</div>
		);
	}
}
