/**
 * V1 API router
 * 
 * author: Jinwoo Shin
 * date: 2018-03-26
 */
import * as express from "express";

import { IDatabase } from "../../../db/db-interface";

import { IErrorhandler } from "../../../lib/error-handler.interface";
import * as resHandler from "../../../lib/response-handler";

import { AuthAPI } from "./auth";
import { PostAPI } from "./post";
import { ReplyAPI } from "./reply";
import { UserAPI} from "./user";

export class V1API {

	private router: express.Router;

	public constructor(
		private db: IDatabase,
		private eh: IErrorhandler) {
		this.router = express.Router();
		this.router.use("/auth", new AuthAPI(db, eh).getRouter());
		this.router.use(this.sessionCheck);
		this.router.use("/user", new UserAPI(this.db, this.eh).getRouter());
		this.router.use("/post", new PostAPI(this.db, this.eh).getRouter());
		this.router.use("/reply", new ReplyAPI(this.db, this.eh).getRouter());
	}

	public getRouter = () => this.router;

	private sessionCheck = (req: express.Request, res: express.Response, 
	next: express.NextFunction) => {
		if (!req.session) { throw new Error("session not exist"); }
		if (!req.session["userId"]) {
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_FORBIDDEN,
					resHandler.ApiResponse.RESULT_FAIL,
					"login needed",
				));
		}
		next();
	}

}
