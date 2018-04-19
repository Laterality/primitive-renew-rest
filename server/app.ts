/**
 * Server App Entry
 * 
 * Author: Jin-woo Shin
 * Date: 2018-03-26
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as session from "express-session";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as path from "path";
import * as favicon from "serve-favicon";

import { config } from "./config";

import { ConsoleErrorHandler } from "./lib/console-eh.impl";
import * as resHandler from "./lib/response-handler";

import { APIRouter } from "./route/api/router";

import { IDatabase } from "./db/db-interface";
import { InMemoryDB } from "./db/in-memory.impl";
import { MongoDBImpl } from "./db/mongodb.impl";

const app = express();
// const db = MongoDBImpl.getInstance();
const db = new InMemoryDB();
const eh = new ConsoleErrorHandler();

// 미들웨어 세팅
app.use(helmet());
app.use(favicon(path.join(__dirname, "./../../public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "./../../public")));
app.use(express.static(config.path_public));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// TODO: production에서는 시크릿 값 수정해야 함
app.use(session({
	secret: "@#@$MYSIGN#@$#$",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
	},
}));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.log("session id: ", req.sessionID);
	next();
});
app.use("/api", new APIRouter(db, eh).getRouter());
app.use("/api", (req: express.Request, res: express.Response) => {
	return resHandler.response(res,
		new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_NOT_FOUND,
			resHandler.ApiResponse.RESULT_FAIL,
			"not found",
		));
});

app.get("/*", (req: express.Request, res: express.Response) => {
	res.sendFile(path.join(__dirname + "./../../public/index.html"));
});

app.listen(config.port, (err: Error) => {
	if (err) {
		console.log("error occurred");
	}
});
