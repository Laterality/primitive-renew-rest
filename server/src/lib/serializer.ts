import * as mongoose from "mongoose";
import { UserDBO } from "../db/user.dbo";

export function serializeUser(dbo: UserDBO) {
	return {
		id: dbo.getId(),
		name: dbo.getName(),
		sid: dbo.getSID(),
		role: dbo.getRole().getTitle(),
	};
}
