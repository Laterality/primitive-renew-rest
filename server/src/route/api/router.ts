import * as express from "express";
import * as resHandler from "../../lib/response-handler";

import { IDatabase } from "../../db/db-interface";
import { V1API } from "./v1/router";

import { RoleDBO } from "../../db/role.dbo";
import { UserDBO } from "../../db/user.dbo";
import { encryption } from "../../lib/auth";

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

			// 관리자 계정 생성
			const authInfo = await encryption("root");
			this.db.createUser(new UserDBO("root", "관리자", authInfo[0], authInfo[1], roleAdmin as RoleDBO));
		});
	}

	public getRouter() {
		return this.router;
	}

}
