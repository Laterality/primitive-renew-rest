/**
 * File API V1
 * 
 * author: Jinwoo Shin
 * date: 2018-04-13
 */
import * as express from "express";
import * as fs from "fs";
import * as multer from "multer";

import { IErrorhandler } from "../../../lib/error-handler.interface";
import * as resHandler from "../../../lib/response-handler";
import { serialize } from "../../../lib/serializer";

import { IDatabase } from "../../../db/db-interface";
import { FileDBO } from "../../../db/file.dbo";

export class FileAPI {
	private router: express.Router;
	private upload: multer.Instance;

	public constructor(
		private db: IDatabase,
		fileDest: string,
		private eh: IErrorhandler,
	) {
		this.router = express.Router();
		const multerStorage = multer.diskStorage({
			filename: (req, file, cb) => {
				cb(null, `${Date.now()}_${file.originalname}`);
			},
		});
		this.upload = multer({dest: fileDest, storage: multerStorage});

		this.router.post("/upload", this.upload.single("file"), this.uploadFile);

	}

	public getRouter = () => this.router;

	/**
	 * 파일 업로드
	 * 
	 * 업로드시 파일명은 다음과 같이 변경된다.
	 * UPLOADDATE_ORIGINALFILENAME.EXT
	 * 
	 * path: /upload
	 * method: POST
	 * 
	 * Header
	 * @Content-Type: multipart/form-data
	 * 
	 * Request
	 * @body file { FILE } 업로드할 파일 용량은 20MB 이하
	 */
	private uploadFile = async (req: express.Request, res: express.Response) => {
		try {
			const fileCreated = await this.db.createFile(
				req.file.filename,
				req.file.path,
			);
			return resHandler.response(res,
				new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "file",
						obj: serialize(fileCreated),
					}));
		}
		catch (e) {
			this.eh.onError(e);
			return resHandler.response(res, resHandler.createServerFaultResponse());
		}
	}
}
