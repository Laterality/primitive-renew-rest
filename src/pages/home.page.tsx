import * as React from "react";

import { LoginForm } from "../components/login-form.component";

export class HomePage extends React.Component {

	public render() {
		return (
			<div className="home-wrapper d-flex flex-column justify-content-center">
				<img src="/img/primitive_logo.svg" alt="logo" className="home-logo mx-auto mb-5"/>
				<div className="home-login-box mx-auto mt-5 px-4 py-3">
					<LoginForm />
				</div>
			</div>
		);
	}
}
