/**
 * Authentication API 
 * 
 * author: Jin-woo Shin
 * date: 2018-04-16
 */
import * as express from "express";

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
		this.router.post("/login", this.loginUser);
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
	private loginUser = async (req: express.Request, res: express.Response) => {
		const userId = req.body["id"];
		const pw = req.body["pw"];

		if ((req.session as Express.Session)["userId"]) {
			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"already has logged in"));
		}

		try {
			// id와 일치하는 사용자 찾기
			try {
				const userFound = await this.db.findUserBySID(userId);
				
				const authInfo = await auth.encryption(pw, userFound.getSalt());

				if (authInfo[0] === userFound.getPassword()) {
					// 로그인 성공
					if (!req.session) {
						return resHandler.response(res, new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_SERVER_FAULT,
							resHandler.ApiResponse.RESULT_ERROR,
							"session undefined problem"));
					}

					(req.session as any)["userId"] = userFound.getId();
					
					return resHandler.response(res, new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_OK,
						resHandler.ApiResponse.RESULT_OK));
				}
				else {
					// 비밀번호 불일치
					return resHandler.response(res, 
						new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
							resHandler.ApiResponse.RESULT_FAIL,
							"password incorrect",
						));
				}
			}
			catch (e) {
				if (e["message"] === "not found") {
					return resHandler.response(res,
						new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
							resHandler.ApiResponse.RESULT_FAIL,
							"user id incorrect",
						));
				}
				else { throw e; }
			}
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
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
		
		console.log("sessId: ", req.sessionID);
		console.log("userId: ", req.session["userId"]);
		if (!req.session["userId"]) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed",
				));
		}

		const prom = new Promise((resolve: any, reject: any) => {
			(req.session as Express.Session).destroy((err: any) => {
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});

		try {
			await prom;
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
		if (!req.session) { throw new Error("session not exist"); }

		if (req.session["userId"]) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "state",
						obj: {
							signed: true,
							id: req.session["userId"],
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
