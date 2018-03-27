import * as bodyParser from "body-parser";
import * as express from "express";
import * as session from "express-session";
import * as morgan from "morgan";

import { config } from "./config";

import * as apiRouter from "./route/api/router";

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

app.use((req: express.Request, res: express.Response) => {
	res.status(200);
	res.send("Server is on");
	res.end();
});

app.use("/api", apiRouter.router);

app.listen(config.port, (err: Error) => {
	if (err) {
		console.log("error occurred");
	}
});
