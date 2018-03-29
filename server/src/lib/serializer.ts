import * as mongoose from "mongoose";

import { BoardDBO } from "../db/board.dbo";
import { UserDBO } from "../db/user.dbo";

export function serialize<T>(dbo: T) {
	if ( dbo instanceof UserDBO) {
		return {
			id: dbo.getId(),
			name: dbo.getName(),
			sid: dbo.getSID(),
			role: dbo.getRole().getTitle(),
		};
	}
	else if (dbo instanceof BoardDBO) {
		const roleTitlesReadable: string[] = [];
		const roleTitlesWritable: string[] = [];
		for (const r of dbo.getRolesReadable()) {
			roleTitlesReadable.push(r.getTitle());
		}
		for (const r of dbo.getRolesWritable()) {
			roleTitlesWritable.push(r.getTitle());
		}

		return {
			id: dbo.getId(),
			board_title: dbo.getTitle(),
			roles_readable: roleTitlesReadable,
			roles_writable: roleTitlesWritable,
		};
	}
	else {
		throw new Error("unsupported type");
	}
}
