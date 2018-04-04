/**
 * Role object cache storage class
 * 
 * author: Jin-woo Shin
 * date: 2018-03-29
 */
import * as mongoose from "mongoose";

import { IDatabase } from "../db/db-interface";
import * as model from "../db/models";
import { RoleDBO } from "../db/role.dbo";

export class RoleCache {

	public static getInstance(db: IDatabase): RoleCache {
		if (!RoleCache.mInstance) {
			RoleCache.mInstance = new RoleCache(db);
		}

		return RoleCache.mInstance;
	}

	private static cache: RoleDBO[] = [];
	private static mInstance: RoleCache;
	private static db: IDatabase;

	private constructor(db: IDatabase) {
		RoleCache.db = db;
		this.refresh().then();
	}

	public getByTitle(title: string): RoleDBO | null {
		const found = RoleCache.cache.find((value: any, index: number) => {
			return value["title"] === title;
		});
		if (found) {
			return found;
		}
		else {
			return null;
		}
	}

	public getById(id: string): RoleDBO | null {
		const found = RoleCache.cache.find((value: any, index: number) => {
			return value["_id"] === id;
		});

		if (found) {
			return found;
		}
		else {
			return null;
		}
	}

	public async refresh() {
		const roles = await RoleCache.db.findAllRole();
		RoleCache.cache.splice(0);
		for (const r of roles) {
			RoleCache.cache.push(r);
		}
	}

}
