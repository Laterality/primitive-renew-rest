import * as express from "express";
import * as mongoose from "mongoose";

import * as model from "../../../db/models";
import * as auth from "../../../lib/auth";
import * as resHandler from "../../../lib/response-handler";
import * as roleCache from "../../../lib/role-cache";
import * as serializer from "../../../lib/serializer";

export const router = express.Router();

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
router.post("/register", async (req: express.Request, res: express.Response) => {
	const name		= req.body["name"];
	const sid		= req.body["sid"];
	const password	= req.body["password"];
	const role		= req.body["role"];

	try {
		// 입력값 유효성 검사
		if (name && sid && password && role) {
			const authInfo = await auth.encryption(password);
			const roleIdFound = roleCache.RoleCache.getInstance().getIdByTitle(role);

			if (!roleIdFound) {
				// 해당 역할이 없는 경우
				throw new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					"invalid parameter(role)");
			}

			// 사용자 모델 객체 생성
			const newUser = new model.UserModel({
				name,
				sid,
				password: authInfo[0],
				salt: authInfo[1],
				role: roleIdFound});

			await newUser.save();

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "newUser",
					obj: {
						_id: newUser._id,
						name: (newUser as any)["name"],
						sid: (newUser as any)["sid"],
						role: (newUser as any)["role"]["role_title"]}});
		}
		else {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameters");
		}
	}
	catch (e) {
		throw e;
	}
	
});

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
router.get("/users", async (req: express.Request, res: express.Response) => {

	try {
		const usersFound = await model.UserModel.find().populate("role").exec();
		const users: any[] = [];

		for (const u of usersFound) {
			users.push(serializer.serializeUser(u));
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "users",
				obj: users,
			});
	}
	catch (e) {
		console.log(e);
	}
});

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
router.get("/user-by-id/:userId", async (req: express.Request, res: express.Response) => {
	const id = req.params["userId"];

	try {
		if (id) {
			const userFound = await model.UserModel.findById(id).populate("role").exec();
	
			if (userFound) {
				// 사용자가 존재
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "user",
						obj: serializer.serializeUser(userFound)});
			}
			else {
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_NOT_FOUND,
					resHandler.ApiResponse.RESULT_FAIL,
					"not found(user)");
			}
		}
		else {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameter(userId)");
		}
	}
	catch (e) {
		throw e;
	}
});

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
router.use("/find-by-name-or-sid/:key", async (req: express.Request, res: express.Response) => {
	const key: string				= req.params["key"];
	const usersFound: any[]			= [];
	const queryRoleTitles: string	= req.query["roles"];
	const roleIds: string[]			= [];
	const rc						= roleCache.RoleCache.getInstance();
	let roleTitles: string[] = [];

	// 역할명 쿼리값을 분리, id로 변환하여 배열에 저장
	if (queryRoleTitles) {
		roleTitles = queryRoleTitles.split(",");
		for (const roleTitle of roleTitles) {
			roleIds.push(rc.getIdByTitle(roleTitle));
		}
	}
	else {
		roleIds.push(rc.getIdByTitle("재학생"));
	}

	try {
		if (!key || key.length === 0) {
			// 키워드가 없으면 전체 리스트를 반환
			// 하기전에 역할명을 id로 변환

			const result = await model.UserModel.find({
				role: {
					$in: roleIds,
				},
			}).populate("role").exec();

			for (const u of result) {
				usersFound.push(serializer.serializeUser(u));
			}
	
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "users",
					obj: usersFound});
		}
		else {
			// 키워드가 있는 경우
			const result = await model.UserModel.find({
				$text: {
					$search: key,
				},
				role: {
					$in: roleIds,
				},
			}, {
					score: { $meta: "textScore" },
				})
				.sort({ score: { $meta: "textScore" }})
				.populate("role").exec();

			for (const u of result) {
				usersFound.push(serializer.serializeUser(u));
			}

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "users",
					obj: usersFound});
		}
	}
	catch (e) {
		console.log(e);
	}
});

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
 * 
 * Response
 * @body result { string } 결과
 * @body message { string } 결과 메시지
 */
router.put("/update/:userId", async (req: express.Request, res: express.Response) => {
	const userId		= req.params["userId"];
	const pwCurrent		= req.body["current_password"];
	const pwNew			= req.body["new_password"];
	const pwNewConfirm	= req.body["new_password_confirm"];

	try {
		const userFound = await model.UserModel.findById(userId).exec();

		if (!userFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}

		const currentAuthInfo = await auth.encryption(pwCurrent, (userFound as any)["salt"]);

		// 현재 비밀번호 일치하는지 확인
		if (currentAuthInfo[0] === (userFound as any)["password"]) {
			// 비밀번호 변경
			if (pwNew === pwNewConfirm) {
				const newAuthInfo = await auth.encryption(pwNew, (userFound as any)["salt"]);

				if (newAuthInfo[0] === currentAuthInfo[0]) {
					// 현재 비밀번호와 새 비밀번호가 같은 경우
					return new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
						resHandler.ApiResponse.RESULT_FAIL,
						"new password is same with current password");
				}

				(userFound as any)["password"] = pwNew;
				await userFound.save();

				return new resHandler.ApiResponse( 
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK);
			}
			else {
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					"new password not matched with confirm");
			}
		}
		else {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"incorrect password");
		}
	}
	catch (e) {
		throw e;
	}
});

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
router.delete("/delete/:userId", async (req: express.Request, res: express.Response) => {
	const userId = req.params["userId"];

	try {
		const userFound = await model.UserModel.findById(userId).exec();

		if (!userFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}

		await userFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (e) {
		throw e;
	}
});

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
router.post("/login", async (req: express.Request, res: express.Response) => {
	const userId = req.body["id"];
	const pw = req.body["pw"];

	try {
		// id와 일치하는 사용자 찾기
		const userFound = await model.UserModel.findOne({sid: userId}).exec();

		if (!userFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}

		const authInfo = await auth.encryption(pw, (userFound as any)["salt"]);

		if (authInfo[0] === (userFound as any)["password"]) {
			// 로그인 성공
			if (!req.session) {
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_SERVER_FAULT,
					resHandler.ApiResponse.RESULT_ERROR,
					"session undefined problem");
			}

			req.session["_id"] = userFound._id;
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK);
		}
	}
	catch (e) {
		throw e;
	}
});

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
router.get("/logout", async (req: express.Request, res: express.Response) => {
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
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (e) {
		throw e;
	}
});
