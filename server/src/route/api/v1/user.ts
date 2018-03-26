import * as express from "express";
import * as mongoose from "mongoose";

import * as model from "../../../db/models";
import * as auth from "../../../lib/auth";
import * as resHandler from "../../../lib/response-handler";

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

	// 입력값 유효성 검사
	if (name && sid && password && role) {
		const authInfo = await auth.encryption(password);
		const roleFound = await model.RoleModel.findOne({role_title: role}).exec();

		if (!roleFound) {
			// 해당 역할이 없는 경우
			throw new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameter(role)");
		}

		const roleId = roleFound._id;

		// 사용자 모델 객체 생성
		const newUser = new model.UserModel({
			name,
			sid,
			password: authInfo[0],
			salt: authInfo[1],
			role: roleId});

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
		throw new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
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
			users.push({
				name: (u as any)["name"],
				sid: (u as any)["sid"],
				role: (u as any)["role"]["role_title"]});
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
 * @path userId { string } 조회할 사용자의 _id필드값
 * 
 * Response
 * @body result { string } 결과
 * @body message { string } 결과 메시지
 * @body user { UserModel } 검색된 회원
 */
router.get("/user-by-id/:userId", async (req: express.Request, res: express.Response) => {
	const id = req.params["userId"];

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
					obj: {
						name: (userFound as any)["name"],
						sid: (userFound as any)["sid"],
						role: (userFound as any)["role"]["role_title"]}});
		}
		else {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}
	}
	else {
		throw new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter(userId)");
	}
});
