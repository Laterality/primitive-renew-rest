/**
 * Database schema models for mongoose(mongodb)
 * 
 * author: Jin-woo Shin
 * date: 2018-03-29
 */
import * as mongoose from "mongoose";
import * as paginate from "mongoose-paginate";

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

export const FileModel = mongoose.model("File", new mongoose.Schema({
	filename: mongoose.SchemaTypes.String,
	path: mongoose.SchemaTypes.String,
}));

export const BoardModel = mongoose.model("Board", new mongoose.Schema({
	board_title: {
		type: mongoose.SchemaTypes.String,
		unique: true,
	},
	roles_readable: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Role",
	}],
	roles_writable: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "Role",
	}],
}));

export const PostModel = mongoose.model("Post", new mongoose.Schema({
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
}).plugin(paginate));

export const ReplyModel = mongoose.model("Reply", new mongoose.Schema({
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
