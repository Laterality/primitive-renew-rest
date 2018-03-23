import * as express from "express";

const app = express();

app.use((req: express.Request, res: express.Response) => {
	res.status(200);
	res.send("Server is on");
	res.end();
});

app.listen(3100, (err: Error) => {
	if (err) {
		console.log("error occurred");
	}
});
