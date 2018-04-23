/**
 * Authentication API 
 * 
 * author: Jinwoo Shin
 * date: 2018-04-16
 */
import * as express from "express";
import * as passport from "passport";

import { IDatabase } from "../../../db/db-interface";

import * as auth from "../../../lib/auth";
import { IErrorhandler } from "../../../lib/error-handler.interface";
import * as resHandler from "../../../lib/response-handler";

export class AuthAPI {

	private router: express.Router;

	public constructor(
		private db: IDatabase,
		private eh: IErrorhandler,
	) {
		this.router = express.Router();
		this.router.post("/login", passport.authenticate("local"), this.onLoginSucceed);
		this.router.get("/logout", this.logoutUser);
		this.router.get("/check", this.isLoggedIn);
	}

	public getRouter = () => this.router;

	/**
	 * 회원 로그인
	 * 
	 * path: /login
	 * method: POST
	 * 
	 * Request
	 * @body id { string } 사용자 id
	 * @body pw { string } 사용자 비밀번호 raw text
	 * 
	 * Response
	 * @body result { string } 사용자 
	 */
	private onLoginSucceed = (req: express.Request, res: express.Response) => {
		return resHandler.response(res,
			resHandler.createOKResponse());
	}

	/**
	 * 회원 로그아웃
	 * 
	 * path: /logout
	 * method: GET
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 */
	private logoutUser = async (req: express.Request, res: express.Response) => {
		if (!req.session) { throw new Error("session not exist"); }

		if (!req.user) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed",
				));
		}

		try {
			req.logout();
			return resHandler.response(res, new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK));
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}

	/**
	 * 로그인여부 확인
	 * 
	 * path: /check
	 * method: GET
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body state { any } 상태
	 */
	private isLoggedIn = (req: express.Request, res: express.Response) => {

		if (req.user) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "state",
						obj: {
							signed: true,
							id: req.user["id"],
						},
					},
				));
		}
		else {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "state",
						obj: {
							signed: false,
						},
					},
				));
		}
	}
}
