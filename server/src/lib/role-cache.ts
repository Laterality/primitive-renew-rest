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

	public getIdByTitle(title: string): string | null {
		const found = RoleCache.cache.find((value: any, index: number) => {
			return value["title"] === title;
		});
		if (found) {
			return found.getId() as string;
		}
		else {
			return null;
		}
	}

	public getTitleById(id: string) {
		return RoleCache.cache.find((value: any, index: number) => {
			return value["_id"] === id;
		});
	}

	public async refresh() {
		const roles = await RoleCache.db.findAllRole();
		RoleCache.cache.splice(0);
		for (const r of roles) {
			RoleCache.cache.push(r);
		}
	}

}
