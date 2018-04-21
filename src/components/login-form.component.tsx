/**
 * Login form component
 * 
 * author: Jinwoo Shin
 * date: 2018-04-20
 */
import * as jquery from "jquery";
import * as PropTypes from "prop-types";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactRouter from "react-router-dom";

import * as axios from "axios";

import * as reqUser from "../lib/user.request";

export class LoginForm extends React.Component {

	public static contextTypes = {
		router: PropTypes.object.isRequired,
	};

	public constructor(props: never) {
		super(props);
	}

	public componentDidMount() {
		const usernameLabel = ReactDOM.findDOMNode(this.refs["usernameLabel"]);
		const passwordLabel = ReactDOM.findDOMNode(this.refs["passwordLabel"]);
		if (usernameLabel) {
			jquery(usernameLabel).attr("for", "username");
		}
		if (passwordLabel) {
			jquery(passwordLabel).attr("for", "password");
		}
		// 세션 검사해서 로그인여부 확인
		reqUser.UserAPIRequest.checkSignedIn()
		.then(async (res: axios.AxiosResponse) => {
			const body = res.data;

			if (body["state"]["signed"] === true) {
				alert("이미 로그인되어있습니다.");
				this.context["router"]["history"]["push"]("/board");
			}
		});
	}

	public render() {
		return (
			<div className="container">
			<div className="row">
				<form className="col">
					<div className="form-group">
						<label ref="usernameLabel">ID</label>
						<input id="username" type="text" className="form-control" placeholder="학번" aria-label="Username"/>
					</div>
					<div className="form-group">
						<label ref="passwordLabel">PW</label>
						<input id="password" type="password" className="form-control" placeholder="Password" aria-label="Password"/>
					</div>
				</form>
				<button type="submit" className="btn text-white bg-primary col-2 my-5 mx-3 px-2" onClick={this.onLoginClicked}>LOGIN</button>
				</div>
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
			const body = res.data;
			console.log(body);
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
