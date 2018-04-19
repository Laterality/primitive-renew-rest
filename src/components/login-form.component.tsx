import * as jquery from "jquery";
import * as PropTypes from "prop-types";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import * as axios from "axios";

import * as reqUser from "../lib/user.request";

export class LoginForm extends React.Component {

	public static contextTypes = {
		router: PropTypes.object.isRequired,
	};

	public render() {
		// 세션 검사해서 로그인여부 확인
		reqUser.UserAPIRequest.checkSignedIn()
		.then(async (res: axios.AxiosResponse) => {
			// const body = await res.json();
			const body = res.data;
			if (body["state"]["signed"] === true) {
				alert("이미 로그인되어있습니다.");
				this.context["router"]["history"]["push"]("/board");
			}
		});

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
				<button type="button" className="btn col" onClick={this.onLoginClicked}>LOGIN</button>
			</div>
		);
	}

	public onLoginClicked = () => {
		const id = jquery("#username").val();
		const pw = jquery("#password").val();
		console.log("ID: " + id);
		console.log("PW: " + pw);
		reqUser.UserAPIRequest.loginUser(id as string, pw as string)
		.then(async (res: axios.AxiosResponse) => {
			// const body = await res.json();
			const body = res.data;
			if (body["result"] === "ok") {
				// 로그인 성공
				this.context["router"]["history"]["push"]("/board");
				
			}
			else {
				if (body["message"] === "not found(user)" ||
				body["message"] === "password incorrect") {
					alert("로그인 정보 불일치");
				}
				else if (res.status === 500) {
					alert("서버 이상, 관리자에게 문의 바랍니다.");
				}
			}
		});
	}
}
