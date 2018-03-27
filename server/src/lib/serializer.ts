import * as mongoose from "mongoose";

export function serializeUser(doc: mongoose.Document) {
	return {
		name: (doc as any)["name"],
		sid: (doc as any)["sid"],
		role: (doc as any)["role"]["role_title"],
	};
}
