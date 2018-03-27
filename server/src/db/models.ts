import * as mongoose from "mongoose";

export const UserModel = mongoose.model("User", new mongoose.Schema({
	name: mongoose.SchemaTypes.String,
	sid: {
		type: mongoose.SchemaTypes.String,
		unique: true,
	},
	password: mongoose.SchemaTypes.String,
	salt: mongoose.SchemaTypes.String,
	role: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Role",
	},
}).index({name: "text", sid: "text"}));

export const RoleModel = mongoose.model("Role", new mongoose.Schema({
	role_title: mongoose.SchemaTypes.String,
}));

export const File = mongoose.model("File", new mongoose.Schema({
	filename: mongoose.SchemaTypes.String,
	path: mongoose.SchemaTypes.String,
}));

export const Board = mongoose.model("Board", new mongoose.Schema({
	board_title: mongoose.SchemaTypes.String,
	roles_readable: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Role",
	}],
	roles_writable: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Role",
	}],
	posts: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Post",
	},
}));

export const Post = mongoose.model("Post", new mongoose.Schema({
	post_title: mongoose.SchemaTypes.String,
	post_content: mongoose.SchemaTypes.String,
	board: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Board",
	},
	date_created: mongoose.SchemaTypes.Date,
	files_attached: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "File",
	}],
	author: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
	},
	replies: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Reply",
	}],
}));

export const Reply = mongoose.model("Reply", new mongoose.Schema({
	reply_content: mongoose.SchemaTypes.String,
	post: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Post",
	},
	author: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
	},
	date_created: mongoose.SchemaTypes.Date,
}));
