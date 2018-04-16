import * as jquery from "jquery";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

export class LoginForm extends React.Component {

	public render() {
		return (
			<div className="container">
				<div className="col">
					<div className="input-group row">
						<input id="username" type="text" className="form-control col" placeholder="ID" aria-label="Username"/>
					</div>
					<div className="input-group row">
						<input id="password" type="password" className="form-control col" placeholder="Password" aria-label="Password"/>
					</div>
				</div>
				<ReactRouter.Link to="/board">
					<button type="button" className="btn col" onClick={this.onLoginClicked}>LOGIN</button>
				</ReactRouter.Link>
			</div>
		);
	}

	public onLoginClicked() {
		console.log("ID: " + jquery("#username").val());
		console.log("PW: " + jquery("#password").val());
	}
}
