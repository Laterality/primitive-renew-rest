/**
 * Express session handling helper
 * 
 * author: Jin-woo Shin
 * date: 2018-03-29
 */
import * as express from "express";

import { IDatabase } from "../db/db-interface";

export async function checkRole(db: IDatabase, req: express.Request, roleTitle: string | string[]): Promise<boolean> {
	if (!req.session) { return false; }
	const userSess = await db.findUserById(req.session["userId"]);
	if (!userSess) { return false; }
	if (Array.isArray(roleTitle)) {
		return roleTitle.indexOf(userSess.getRole().getTitle()) > -1;
	}
	else {
		return userSess.getRole().getTitle() === roleTitle;
	}
}
