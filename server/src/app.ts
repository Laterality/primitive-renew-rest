/**
 * Server App Entry
 * 
 * Author: Jin-woo Shin
 * Date: 2018-03-26
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as session from "express-session";
import * as morgan from "morgan";

import { config } from "./config";

import * as resHandler from "./lib/response-handler";

import { APIRouter } from "./route/api/router";

import { IDatabase } from "./db/db-interface";
import { MongoDBImpl } from "./db/mongodb.impl";

const app = express();
const db = MongoDBImpl.getInstance();

// 미들웨어 세팅
app.use(morgan("dev"));
// TODO: production에서는 시크릿 값 수정해야 함
app.use(session({
	secret: "@#@$MYSIGN#@$#$",
	resave: false,
	saveUninitialized: true,
}));

app.use(express.static(__dirname + "/../../public"));
app.use(express.static(config.path_public));

app.use("/api", new APIRouter(db).getRouter());

app.use((req: express.Request, res:express.Response) => {
	return resHandler.response(res,
		new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_NOT_FOUND,
			resHandler.ApiResponse.RESULT_FAIL,
			"not found",
		));
});

app.listen(config.port, (err: Error) => {
	if (err) {
		console.log("error occurred");
	}
});
