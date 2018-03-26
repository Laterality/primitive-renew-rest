import * as express from "express";
import * as resHandler from "../../lib/response-handler";

import { router as v1Router } from "./v1/router";

export const router = express.Router();

router.use("/:version", (req: express.Request, res: express.Response) => {
	const version = req.params["version"];
	let response: resHandler.ApiResponse | undefined;

	switch (version) {
		case "v1":
			// TODO: v1 api routing
			router.use("/v1", v1Router);
		break;
		default:
			response = new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid api version",
			);
			resHandler.response(res, response);
		break;
	}
});
