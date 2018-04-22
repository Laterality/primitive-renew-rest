/**
 * Server App Entry
 * 
 * Author: Jinwoo Shin
 * Date: 2018-03-26
 */
import * as bodyParser from "body-parser";
import * as connectRedis from "connect-redis";
import * as cors from "cors";
import * as express from "express";
import * as session from "express-session";
import * as helmet from "helmet";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import * as passport from "passport";
import * as localStrategy from "passport-local";
import * as path from "path";
import * as favicon from "serve-favicon";

import { config } from "./config";

import { ConsoleErrorHandler } from "./lib/console-eh.impl";
import * as resHandler from "./lib/response-handler";

import { APIRouter } from "./route/api/router";

import { IDatabase } from "./db/db-interface";
import { InMemoryDB } from "./db/in-memory.impl";
import { MongoDBImpl } from "./db/mongodb.impl";
import { UserDBO } from "./db/user.dbo";
import { encryption } from "./lib/auth";

// 앱 인스턴스, DB 인스턴스 초기화
const app = express();
let db: IDatabase | null = null;
if (config.db.dbms === "in-memory") {
	db = new InMemoryDB();
}
else if (config.db.dbms === "mongodb") {
	db = MongoDBImpl.getInstance();

	// mongodb connection
	mongoose.connect(config.db.uri);
	mongoose.connection.on("connected", () => {
		console.log("[mongodb] connected");
	});
	mongoose.connection.on("error", (err: any) => {
		console.log("[mongodb] connection error ", err);
	});
	mongoose.connection.on("disconnected", () => {
		console.log("[mongodb] disconnected");
	});
}
else {
	console.log("invalid dbms name: " + config.db.dbms);
	process.exit(1);
}

const eh = new ConsoleErrorHandler();
const redisStore = connectRedis(session);

// passport 세팅
passport.serializeUser((user: UserDBO, done) => {
	done(null, user.getId());
});
passport.deserializeUser((id: any, done) => {
	if (db) {
		db.findUserById(id)
		.then((user: UserDBO) => {
			done(null, user);
		});
	}
});
passport.use(new localStrategy.Strategy({
	usernameField: "id",
	passwordField: "pw",
	session: true,
}, async (username, password, done) => {
	try {
		if (db) {
			const user = await db.findUserBySID(username);
			const authInfo = await encryption(password, user.getSalt());
			if (authInfo[0] === user.getPassword()) {
				done(null, user);
			}
			else {
				done(null, false);
			}
		}
		else { throw new Error("Invalid db instance"); }
	}
	catch (e) {
		if (e["message"] === "not found") {
			done(null, false);
		}
		eh.onError(e);
	}
}));

// 미들웨어 세팅
app.use(morgan("dev"));
app.use(helmet());
// app.use(cors());
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.header("Origin"));
	res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
	res.header("Access-Control-Allow-Credentials", "true");
	next();
});
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
	store: new redisStore({
		host: "127.0.0.1",
		port: 6379,
	}),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.log("sid: ", req.sessionID);
	next();
});
app.use("/api", new APIRouter(db as IDatabase, eh).getRouter());
app.use("/api", (req: express.Request, res: express.Response) => {
	return resHandler.response(res,
		new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_NOT_FOUND,
			resHandler.ApiResponse.RESULT_FAIL,
			"not found",
		));
});

app.use(express.static(config.path_public));

app.listen(config.port, (err: Error) => {
	if (err) {
		console.log("error occurred");
	}
});

process.on("SIGINT", () => {
	console.log("[process] process terminating");

	if (config.db.dbms === "mongodb") {
		mongoose.connection.close(() => {
			console.log("[mongodb] connection closed");
			process.exit(0);
		});
	}
});
