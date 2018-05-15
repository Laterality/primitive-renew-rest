/**
 * API version router
 * 
 * author: Jinwoo Shin
 * date: 2018-03-26
 */
import * as express from "express";

import { encryption } from "../../lib/auth";
import { IErrorhandler } from "../../lib/error-handler.interface";
import * as resHandler from "../../lib/response-handler";

import { IDatabase } from "../../db/db-interface";
import { V1API } from "./v1/router";

import { BoardDBO } from "../../db/board.dbo";
import { RoleDBO } from "../../db/role.dbo";
import { UserDBO } from "../../db/user.dbo";

export class APIRouter {
	private router: express.Router;

	public constructor(
		private db: IDatabase,
		private eh: IErrorhandler) {
		this.router = express.Router();
		try {
			this.router.use("/v1", new V1API(db, eh).getRouter());
			this.router.post("/init", async (req: express.Request, res: express.Response) => {
				// 관리자 계정이 존재하는지 확인
				try {
					try {
						const rootUser = await this.db.findUserBySID("root");
	
						if (rootUser) {
							return resHandler.response(res,
							new resHandler.ApiResponse(
								resHandler.ApiResponse.CODE_CONFLICT,
								resHandler.ApiResponse.RESULT_FAIL,
								"initialization is already done"));
						}
					}
					catch (e) {
						if (e["message"] === "not found") {
	
							// 역할 생성
							await this.db.createRole("신입생");
							await this.db.createRole("재학생");
							await this.db.createRole("졸업생");
							const roleAdmin = await this.db.createRole("관리자");
				
							// 게시판 생성
							const seminarPermitted: string[] = [];
							seminarPermitted.push((await this.db.findRoleByTitle("신입생")).getTitle());
							seminarPermitted.push((await this.db.findRoleByTitle("재학생")).getTitle());
							seminarPermitted.push((await this.db.findRoleByTitle("졸업생")).getTitle());
							seminarPermitted.push((await this.db.findRoleByTitle("관리자")).getTitle());
				
							await this.db.createBoard("세미나", seminarPermitted, seminarPermitted);
							await this.db.createBoard("과제", seminarPermitted, seminarPermitted);
							await this.db.createBoard("신입생 자료실", seminarPermitted, seminarPermitted);
				
							// 관리자 계정 생성
							const authInfo = await encryption("root");
							this.db.createUser("root", "관리자", authInfo[0], authInfo[1], roleAdmin.getTitle());
				
							return resHandler.response(res, resHandler.createOKResponse());
						}
						else { 
							this.eh.onError(e);
							throw e; 
						}
					}
				}
				catch (e) {
					this.eh.onError(e);
					throw e;
				}
			});
		}
		catch (e) {
			this.eh.onError(e);
		}
	}

	public getRouter = () => {
		return this.router;
	}

}
