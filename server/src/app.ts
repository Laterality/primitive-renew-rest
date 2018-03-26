import * as bodyParser from "body-parser";
import * as express from "express";

import { config } from "./config";

import * as apiRouter from "./route/api/router";

const app = express();

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
