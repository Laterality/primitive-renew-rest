/**
 * API version router
 * 
 * author: Jin-woo Shin
 * date: 2018-03-26
 */
import * as express from "express";

import { encryption } from "../../lib/auth";
import * as resHandler from "../../lib/response-handler";

import { IDatabase } from "../../db/db-interface";
import { V1API } from "./v1/router";

import { BoardDBO } from "../../db/board.dbo";
import { RoleDBO } from "../../db/role.dbo";
import { UserDBO } from "../../db/user.dbo";

export class APIRouter {
	private router: express.Router;

	public constructor(private db: IDatabase) {
		this.router = express.Router();
		this.router.use("/v1", new V1API(this.db).getRouter());
		this.router.post("/init", async (req: express.Request, res: express.Response) => {
			// 관리자 계정이 존재하는지 확인
			const rootUser = await this.db.findUserBySID("root");
			if (rootUser) {
				return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_CONFLICT,
					resHandler.ApiResponse.RESULT_FAIL,
					"initialization is already done"));
			}
			
			// 역할 생성
			await this.db.createRole(new RoleDBO("신입생"));
			await this.db.createRole(new RoleDBO("재학생"));
			await this.db.createRole(new RoleDBO("졸업생"));
			const roleAdmin = await this.db.createRole(new RoleDBO("관리자"));

			// 게시판 생성
			const seminarPermitted: RoleDBO[] = [];
			seminarPermitted.push(await this.db.findRoleByTitle("신입생") as RoleDBO);
			seminarPermitted.push(await this.db.findRoleByTitle("재학생") as RoleDBO);
			seminarPermitted.push(await this.db.findRoleByTitle("졸업생") as RoleDBO);
			seminarPermitted.push(await this.db.findRoleByTitle("관리자") as RoleDBO);

			await this.db.createBoard(new BoardDBO("세미나", seminarPermitted, seminarPermitted));
			await this.db.createBoard(new BoardDBO("과제", seminarPermitted, seminarPermitted));
			await this.db.createBoard(new BoardDBO("신입생 자료실", seminarPermitted, seminarPermitted));

			// 관리자 계정 생성
			const authInfo = await encryption("root");
			this.db.createUser(new UserDBO("root", "관리자", authInfo[0], authInfo[1], roleAdmin as RoleDBO));

			return resHandler.response(res, resHandler.createOKResponse());
		});
	}

	public getRouter() {
		return this.router;
	}

}
