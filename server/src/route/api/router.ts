import * as express from "express";
import * as resHandler from "../../lib/response-handler";

import { IDatabase } from "../../db/db-interface";
import { V1API } from "./v1/router";

export class APIRouter {
	private router: express.Router;

	public constructor(private db: IDatabase) {
		this.router = express.Router();
		this.router.use("/v1", new V1API(this.db).getRouter());
	}

	public getRouter() {
		return this.router;
	}
}
