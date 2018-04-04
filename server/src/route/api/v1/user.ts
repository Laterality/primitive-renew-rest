/**
 * User API V1
 * 
 * author: Jin-woo Shin
 * date: 2018-03-26
 */
import * as express from "express";

import * as auth from "../../../lib/auth";
import * as resHandler from "../../../lib/response-handler";
import * as roleCache from "../../../lib/role-cache";
import * as serializer from "../../../lib/serializer";
import { checkRole } from "../../../lib/session-handler";

import { IDatabase } from "../../../db/db-interface";
import { RoleDBO } from "../../../db/role.dbo";
import { UserDBO } from "../../../db/user.dbo";

export class UserAPI {

	private router: express.Router;

	public constructor(private db: IDatabase) {
		this.router = express.Router();
		this.router.post("/register", this.registerUser);
		this.router.get("/users", this.retrieveAllUsers);
		this.router.get("/user-by-id", this.retrieveUserById);
		this.router.get("/find-by-name-or-sid/:key", this.searchUser);
		this.router.put("/update/:userId", this.updateUser);
		this.router.delete("/delete/:userId", this.deleteUser);
		this.router.post("/login", this.loginUser);
		this.router.get("/logout", this.logoutUser);
	}

	public getRouter() {
		return this.router;
	}

	/**
	 * 회원 등록
	 * 
	 * @path: /register
	 * @method: POST
	 * 
	 * Request
	 * @body name { string } 이름
	 * @body sid { string } 학번
	 * @body password { string } 비밀번호
	 * @body role { string } 역할
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body newUser { UserModel } 생성된 회원
	 */
	private async registerUser(req: express.Request, res: express.Response) {
		const name		= req.body["name"];
		const sid		= req.body["sid"];
		const password	= req.body["password"];
		const role		= req.body["role"];

		if (!checkRole(this.db, req, "관리자")) {
			// 세션 회원의 역할이 관리자가 아니면 요청 중단
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"unauthorized request"));
		}

		try {
			// 입력값 유효성 검사
			if (name && sid && password && role) {
				const authInfo = await auth.encryption(password);
				const roleFound = roleCache.RoleCache.getInstance(this.db).getByTitle(role);

				if (!roleFound) {
					// 해당 역할이 없는 경우
					return resHandler.response(res, new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
						resHandler.ApiResponse.RESULT_FAIL,
						"invalid parameter(role)"));
				}

				// 사용자 모델 객체 생성
				const newUser = new UserDBO(
					sid,
					name,
					authInfo[0],
					authInfo[1],
					roleFound);

				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "newUser",
						obj: serializer.serialize(newUser)}));
			}
			else {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					"invalid parameters"));
			}
		}
		catch (e) {
			throw e;
		}
		
	}

	/**
	 * 전체 회원 조회
	 * 
	 * @path: /users
	 * @method: GET
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body users { UserModel[] } 사용자 배열
	 */
	private async retrieveAllUsers(req: express.Request, res: express.Response) {
		if (!req.session) { throw new Error("session not exists"); }
		if (!req.session["userId"]) {
			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}
		if (!checkRole(this.db, req, ["재학생", "관리자"])) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"unauthorized request"));
		}
		try {
			const usersFound = await this.db.findAllUser();
			const users: any[] = [];

			for (const u of usersFound) {
				users.push(serializer.serialize(u));
			}

			return resHandler.response(res, new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "users",
					obj: users,
				}));
		}
		catch (e) {
			throw e;
		}
	}

	/**
	 * _id 필드값으로 회원 조회
	 * 
	 * @path: /user-by-id/{userId}
	 * @method: GET
	 * 
	 * Request
	 * @param userId { string } 조회할 사용자의 _id필드값
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body user { UserModel } 검색된 회원
	 */
	private async retrieveUserById(req: express.Request, res: express.Response) {
		const id = req.params["userId"];

		if (!req.session) { throw new Error("session not exist"); }
		if (!req.session["userId"]) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}

		if (!(checkRole(this.db, req, ["재학생", "관리자"]) || 
			req.session["userId"] === id)) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"unauthorized request"));
		}

		try {
			if (id) {
				const userFound = await this.db.findUserById(id);
		
				if (userFound) {
					// 사용자가 존재
					return resHandler.response(res, new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_OK,
						resHandler.ApiResponse.RESULT_OK,
						"",
						{
							name: "user",
							obj: serializer.serialize(userFound)}));
				}
				else {
					return resHandler.response(res, new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_NOT_FOUND,
						resHandler.ApiResponse.RESULT_FAIL,
						"not found(user)"));
				}
			}
			else {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					"invalid parameter(userId)"));
			}
		}
		catch (e) {
			throw e;
		}
	}

	/**
	 * 이름 혹은 학번으로 회원 검색
	 * 
	 * @path: /find-by-name-or-sid/{key}
	 * @method: GET
	 * 
	 * Request
	 * @param key { string } 검색 키워드 (회원의 이름 혹은 학번)
	 * @query roles { string } 검색할 역할 범위(역할명을 ,로 구분, 기본값=["재학생"])
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body users { UserModel[] } 검색 결과
	 */
	private async searchUser(req: express.Request, res: express.Response) {
		const key: string				= req.params["key"];
		const usersFound: any[]			= [];
		const queryRoleTitles: string	= req.query["roles"];
		const roleIds: string[]			= [];
		const rc						= roleCache.RoleCache.getInstance(this.db);
		let roleTitles: string[] = [];

		if (!req.session) { throw new Error("session not exist"); }
		if (!req.session["userId"]) {
			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}

		if (!checkRole(this.db, req, ["재학생", "관리자"])) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"unauthorized request"));
		}

		// 역할명 쿼리값을 분리, id로 변환하여 배열에 저장
		if (queryRoleTitles) {
			roleTitles = queryRoleTitles.split(",");
			for (const roleTitle of roleTitles) {
				roleIds.push((rc.getByTitle(roleTitle) as RoleDBO).getId() as string);
			}
		}
		else {
			const senior = rc.getByTitle("재학생");
			if (senior) {
				roleIds.push(senior.getId() as string);
			}
		}

		try {
			if (!key || key.length === 0) {
				// 키워드가 없으면 전체 리스트를 반환
				// 하기전에 역할명을 id로 변환

				const result = await this.db.searchUser("", roleIds);
				for (const u of result) {
					usersFound.push(serializer.serialize(u));
				}
		
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "users",
						obj: usersFound}));
			}
			else {
				// 키워드가 있는 경우
				const result = await this.db.searchUser(key, roleIds);

				for (const u of result) {
					usersFound.push(serializer.serialize(u));
				}

				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "users",
						obj: usersFound}));
			}
		}
		catch (e) {
			throw e;
		}
	}

	/**
	 * 회원정보 수정
	 * 
	 * path: /update/{userId}
	 * method: put
	 * 
	 * Request
	 * @param userId { string } 수정할 회원의 _id필드값
	 * @body current_password { string } 현재 비밀번호
	 * @body new_password { string } 새 비밀번호
	 * @body new_password_confirm { string } 새 비밀번호 확인
	 * @body role { string } 변경할 역할
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 */
	private async updateUser(req: express.Request, res: express.Response) {
		const userId		= req.params["userId"];
		const pwCurrent		= req.body["current_password"];
		const pwNew			= req.body["new_password"];
		const pwNewConfirm	= req.body["new_password_confirm"];
		const role			= req.body["role"];

		if (!req.session) { throw new Error("session not exist"); }
		if (!req.session["userId"]) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}

		if (!(checkRole(this.db, req, "관리자") ||
			req.session["userId"] === userId)) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"unauthorized request"));
		}

		try {
			const userFound = await this.db.findUserById(userId);

			if (userFound === null) {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_NOT_FOUND,
					resHandler.ApiResponse.RESULT_FAIL,
					"not found(user)"));
			}

			// 여기부터 사용자 수정
			if (role && role.length > 0) {
				const rc = roleCache.RoleCache.getInstance(this.db);
				const roleDbo = rc.getByTitle(role);
				if (!roleDbo) {
					return resHandler.response(res, resHandler.createServerFaultResponse());
				}
				userFound.setRole(roleDbo);
			}

			const currentAuthInfo = await auth.encryption(pwCurrent, userFound.getSalt());

			// 현재 비밀번호 일치하는지 확인
			if (currentAuthInfo[0] === userFound.getPassword()) {
				// 비밀번호 변경
				if (pwNew === pwNewConfirm) {
					const newAuthInfo = await auth.encryption(pwNew, userFound.getSalt());

					if (newAuthInfo[0] === currentAuthInfo[0]) {
						// 현재 비밀번호와 새 비밀번호가 같은 경우
						return resHandler.response(res, new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
							resHandler.ApiResponse.RESULT_FAIL,
							"new password is same with current password"));
					}

					userFound.setPassword(pwNew);
				}
				else {
					return resHandler.response(res, new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
						resHandler.ApiResponse.RESULT_FAIL,
						"new password not matched with confirm"));
				}

				this.db.updateUser(userFound);

				return resHandler.response(res, resHandler.createOKResponse());
			}
			else {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					"incorrect password"));
			}
		}
		catch (e) {
			throw e;
		}
	}

	/**
	 * 회원정보 삭제
	 * 
	 * path: /delete/{userId}
	 * method: DELETE
	 * 
	 * Request
	 * @param userId { string } 사용자 _id 필드값
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 */
	private async deleteUser(req: express.Request, res: express.Response) {
		const userId = req.params["userId"];

		if (!req.session) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}

		if (!(checkRole(this.db, req, "관리자") ||
			req.session["userId"] === userId)) {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_FORBIDDEN,
						resHandler.ApiResponse.RESULT_FAIL,
						"unauthorized request"));
			}

		try {
			const userFound = await this.db.findUserById(userId);

			if (!userFound) {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_NOT_FOUND,
					resHandler.ApiResponse.RESULT_FAIL,
					"not found(user)"));
			}

			this.db.removeUser(userId);

			return resHandler.response(res, resHandler.createOKResponse());
		}
		catch (e) {
			throw e;
		}
	}

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
	private async loginUser(req: express.Request, res: express.Response) {
		const userId = req.body["id"];
		const pw = req.body["pw"];

		if (!req.session) { throw new Error("session not exist"); }
		if (req.session["userId"]) {
			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"already has logged in"));
		}

		try {
			// id와 일치하는 사용자 찾기
			const userFound = await this.db.findUserBySID(userId);

			if (!userFound) {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_NOT_FOUND,
					resHandler.ApiResponse.RESULT_FAIL,
					"not found(user)"));
			}

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
		}
		catch (e) {
			throw e;
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
	private async logoutUser(req: express.Request, res: express.Response) {
		if (!req.session) { throw new Error("session is not exist"); }
		if (!req.session["userId"]) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}
		const prom = new Promise(() => {
			(req.session as Express.Session).destroy((err: any) => {
				if (err) {
					return Promise.reject(err);
				}
				return Promise.resolve();
			});
		});

		try {
			await prom;
			return resHandler.response(res, new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK));
		}
		catch (e) {
			throw e;
		}
	}
}
