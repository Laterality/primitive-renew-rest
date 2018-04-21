/**
 * Board API V1
 * 
 * author: Jinwoo Shin
 * date: 2018-03-29
 */
import * as express from "express";

import * as resHandler from "../../../lib/response-handler";

import { IDatabase } from "../../../db/db-interface";
import { IErrorhandler } from "../../../lib/error-handler.interface";
import { checkRole } from "../../../lib/session-handler";

import { BoardDBO } from "../../../db/board.dbo";
import { RoleDBO } from "../../../db/role.dbo";
import { serialize } from "../../../lib/serializer";

export class BoardAPI {

	private router: express.Router;
	
	public constructor(
		private db: IDatabase,
		private eh: IErrorhandler) {
		this.router = express.Router();
		this.router.post("/create", this.createBoard);
		this.router.get("/:boardId", this.findBoard);
	}

	public getRouter = () => this.router;

	/**
	 * 게시판 생성
	 * 
	 * @path: /create
	 * @method: post
	 * 
	 * Request
	 * @body board_title { string } 게시판 이름
	 * @body roles_readable { string[] } 읽을 권한을 가진 역할명 배열
	 * @body roles_writable { string[] } 작성 권한을 가진 역할명 배열
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body board { BoardModel } 생성된 게시판
	 */
	private createBoard = async (req: express.Request, res: express.Response) => {
		const boardTitle	= req.body["board_title"];
		const rolesReadable	= req.body["roles_readable"];
		const rolesWritable	= req.body["roles_writable"];

		try {
			// 권한 검사
			if (!checkRole(this.db, req, "관리자")) {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_FORBIDDEN,
						resHandler.ApiResponse.RESULT_FAIL,
						"unauthorized request"));
			}

			const roleIdsReadable: RoleDBO[] = [];
			const roleIdsWritable: RoleDBO[] = [];

			for (const title of rolesReadable) {
				const role = await this.db.findRoleByTitle(title);
				if (!role) {
					return resHandler.response(res,
						new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
							resHandler.ApiResponse.RESULT_FAIL,
							"invalid role title: " + title));
				}
				roleIdsReadable.push(role);
			}

			for (const title of rolesWritable) {
				const role = await this.db.findRoleByTitle(title);
				if (!role) {
					return resHandler.response(res,
						new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
							resHandler.ApiResponse.RESULT_FAIL,
							"invalid role title: " + title));
				}
				roleIdsWritable.push(role);
			}

			// 새 게시판 생성
			const newBoard = new BoardDBO(
				boardTitle,
				roleIdsReadable,
				roleIdsWritable);

			const boardCreated = await this.db.createBoard(newBoard);

			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "board",
						obj: serialize(boardCreated)}));
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}

	/**
	 * id로 게시판 조회
	 * 
	 * path: /{boardId}
	 * method: get
	 * 
	 * Permission
	 * 로그인한 회원 전체에게 허용
	 * 
	 * Request
	 * @param boardId { string } 조회할 게시판 id
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 * @body board { BoardModel } 조회된 게시판
	 */
	private findBoard = async (req: express.Request, res: express.Response) => {
		const boardId = req.params["boardId"];

		try {
			// 권한 검사
			const boardFound = await this.db.findBoardById(boardId);

			if (boardFound === null) {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_NOT_FOUND,
						resHandler.ApiResponse.RESULT_FAIL,
						"not found"));
			}

			return resHandler.response(res, 
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
				"",
			{
				name: "board",
				obj: serialize(boardFound)}));
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}
}
