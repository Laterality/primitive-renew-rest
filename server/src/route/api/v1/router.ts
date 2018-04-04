import * as express from "express";

import { IDatabase } from "../../../db/db-interface";

import { PostAPI } from "./post";
import { ReplyAPI } from "./reply";
import { UserAPI} from "./user";

export class V1API {

	private router: express.Router;

	public constructor(private db: IDatabase) {
		this.router = express.Router();
		this.router.use("/user", new UserAPI(db).getRouter());
		this.router.use("/post", new PostAPI(db).getRouter());
		this.router.use("/reply", new ReplyAPI(db).getRouter());
	}

	public getRouter() {
		return this.router;
	}

}
