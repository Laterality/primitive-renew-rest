/**
 * Reply API V1
 * 
 * author: Jinwoo Shin
 * date: 2018-04-03
 */
import * as express from "express";

import { IDatabase } from "../../../db/db-interface";
import { ReplyDBO } from "../../../db/reply.dbo";

import { IErrorhandler } from "../../../lib/error-handler.interface";
import * as resHandler from "../../../lib/response-handler";
import { checkRole } from "../../../lib/session-handler";

export class ReplyAPI {
	private router: express.Router;

	public constructor(
		private db: IDatabase,
		private eh: IErrorhandler) {
		this.router = express.Router();
		this.router.post("/write", this.createReply);
		this.router.put("/update/:replyId", this.updateReply);
		this.router.delete("/delete/:replyId", this.deleteReply);
	}

	public getRouter = () => this.router;

	/**
	 * 댓글 작성
	 * 
	 * path: /write
	 * method: POST
	 * 
	 * Request
	 * @body postId { string } 댓글을 작성할 게시물 id
	 * @body reply_content { string } 댓글 내용
	 */
	private createReply = async (req: express.Request, res: express.Response) => {
		const postId = req.params["postId"];
		const replyContent = req.body["reply_content"];

		try {
			const postFound = await this.db.findPostById(postId);
			const board = postFound.getBoard();
			const userFound = await this.db.findUserById((req.session as Express.Session)["userId"]);

			const writableRoleTitles: string[] = [];

			for (const r of board.getRolesWritable()) {
				writableRoleTitles.push(r.getTitle());
			}

			if (!checkRole(this.db, req, writableRoleTitles)) {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_FORBIDDEN,
						resHandler.ApiResponse.RESULT_FAIL,
						"not permitted",
					));
			}

			const replyCreated = await this.db.createReply(
				new ReplyDBO(
					replyContent, 
					postId, 
					userFound, 
					new Date(),
				));

			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
				));
		}
		catch (e) {
			if (e["message"] === "not found") {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_NOT_FOUND,
						resHandler.ApiResponse.RESULT_FAIL,
						"not found(post)",
					));
			}
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}

	/**
	 * 댓글 수정
	 * 
	 * path: /update/{replyId}
	 * method: put
	 * 
	 * Request
	 * @param replyId { string } 수정할 댓글 id
	 * @body reply_content { string } 수정할 댓글 내용
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 */
	private updateReply = async (req: express.Request, res: express.Response) => {
		const replyId = req.params["replyId"];
		const replyContent = req.body["reply_content"];

		try {
			// 권한 검사
			const reqplyFound = await this.db.findReplyById(replyId);
			if (!checkRole(this.db, req, "관리자") || 
			(req.session as Express.Session)["userId"] !== reqplyFound.getAuthor().getId()) {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_FORBIDDEN,
						resHandler.ApiResponse.RESULT_FAIL,
						"not permitted",
					));
			}

			reqplyFound.setReplyContent(replyContent);
			await this.db.updateReply(reqplyFound);

			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
				));
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}

	/**
	 * 댓글 삭제
	 * 
	 * path: /delete/{replyId}
	 * method: delete
	 * 
	 * Request
	 * @param replyId { string } 삭제할 댓글 id
	 * 
	 * Response
	 * @body result { string } 결과
	 * @body message { string } 결과 메시지
	 */
	private deleteReply = async (req: express.Request, res: express.Response) => {
		const replyId = req.params["replyId"];

		try {
			const replyFound = await this.db.findReplyById(replyId);

			if ((req.session as Express.Session)["userId"] === (replyFound.getAuthor().getId() as string) && 
				!checkRole(this.db, req, "관리자")) {
					return resHandler.response(res,
						new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_FORBIDDEN,
							resHandler.ApiResponse.RESULT_FAIL,
							"not permitted",
						));
			}

			// 댓글 삭제
			await this.db.removeReply(replyFound);

			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
				));
		}
		catch (e) {
			if (e["message"] === "not found") {
				return resHandler.response(res,
					new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_NOT_FOUND,
						resHandler.ApiResponse.RESULT_FAIL,
						"not found",
					));
			}
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}
}
