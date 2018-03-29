import * as express from "express";

import * as resHandler from "../../../lib/response-handler";

import { BoardDBO } from "../../../db/board.dbo";
import { IDatabase } from "../../../db/db-interface";
import { checkRole } from "../../../lib/session-handler";

export class BoardAPI {

	private router: express.Router;
	
	public constructor(private db: IDatabase) {
		this.router = express.Router();
	}

	public getRouter(): express.Router {
		return this.router;
	}

	/**
	 * 게시판 생성
	 * 
	 * @path: /create
	 * @method: post
	 * 
	 * Request
	 * @body board_title { string } 게시판 이름
	 * @body roles_readable { string[] } 읽을 권한을 가진 역할
	 * @body roles_writable { string[] } 작성 권한을 가진 역할
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body board { BoardModel } 생성된 게시판
	 */
	private async createBoard(req: express.Request, res: express.Response) {
		const boardTitle	= req.body["board_title"];
		const rolesReadable	= req.body["roles_readable"];
		const rolesWritable	= req.body["roles_writable"];

		if (!req.session) { throw new Error("session not exist"); }
		if (!req.session["userId"]) {
			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed"));
		}
		if (!checkRole(this.db, req, "관리자")) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"unauthorized request"));
		}

		const newBoard = 
		
	}

}
