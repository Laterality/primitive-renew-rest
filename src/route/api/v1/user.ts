/**
 * User API V1
 * 
 * author: Jinwoo Shin
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
import { IErrorhandler } from "../../../lib/error-handler.interface";

export class UserAPI {

	private router: express.Router;

	public constructor(
		private db: IDatabase,
		private eh: IErrorhandler) {
		this.router = express.Router();
		this.router.post("/register", this.registerUser);
		this.router.get("/users", this.retrieveAllUsers);
		this.router.get("/user-by-id", this.retrieveUserById);
		this.router.get("/find-by-name-or-sid/:key", this.searchUser);
		this.router.put("/update/:userId", this.updateUser);
		this.router.delete("/delete/:userId", this.deleteUser);
	}

	public getRouter = () => this.router;

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
	private registerUser = async (req: express.Request, res: express.Response) => {
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
				const userCreated = this.db.createUser(name, sid, authInfo[0], authInfo[1], roleFound.getTitle());

				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "newUser",
						obj: serializer.serialize(userCreated)}));
			}
			else {
				return resHandler.response(res, new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					"invalid parameters"));
			}
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
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
	private retrieveAllUsers = async (req: express.Request, res: express.Response) => {
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
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
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
	private retrieveUserById = async (req: express.Request, res: express.Response) => {
		const id = req.params["userId"];

		if (!(checkRole(this.db, req, ["재학생", "관리자"]) || 
			(req.session as Express.Session)["userId"] === id)) {
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
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
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
	private searchUser = async (req: express.Request, res: express.Response) => {
		const key: string				= req.params["key"];
		const usersFound: any[]			= [];
		const queryRoleTitles: string	= req.query["roles"];
		const roleIds: string[]			= [];
		const rc						= roleCache.RoleCache.getInstance(this.db);
		let roleTitles: string[] = [];

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
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
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
	 * @body role { string } 변경할 역할
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 */
	private updateUser = async (req: express.Request, res: express.Response) => {
		const userId: string		= req.params["userId"];
		const pwCurrent: string		= req.body["current_password"];
		const pwNew: string			= req.body["new_password"];
		const role: string			= req.body["role"];

		if (!(checkRole(this.db, req, "관리자") ||
			(req.session as Express.Session)["userId"] === userId)) {
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
			if (currentAuthInfo[0] === userFound.getPassword() &&
				pwCurrent.length > 0) {
				// 비밀번호 변경
				const newAuthInfo = await auth.encryption(pwNew, userFound.getSalt());

				if (newAuthInfo[0] === currentAuthInfo[0]) {
					// 현재 비밀번호와 새 비밀번호가 같은 경우
					return resHandler.response(res, new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
						resHandler.ApiResponse.RESULT_FAIL,
						"new password is same with current password"));
				}

				userFound.setPassword(pwNew);

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
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
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
	private deleteUser = async (req: express.Request, res: express.Response) => {
		const userId = req.params["userId"];

		if (!checkRole(this.db, req, "관리자")) {
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
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}
}
