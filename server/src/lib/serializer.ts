import * as mongoose from "mongoose";

import { BoardDBO } from "../db/board.dbo";
import { FileDBO } from "../db/file.dbo";
import { PostDBO } from "../db/post.dbo";
import { ReplyDBO } from "../db/reply.dbo";
import { UserDBO } from "../db/user.dbo";

/**
 * API 요청의 반환 형식으로 사용할 수 있는 객체로 반환합니다.
 * 
 * @param dbo 
 * 
 * Throws
 * "unsupported type": serialize가 지원되지 않는 객체입니다.
 */
export function serialize<T>(dbo: T): any {
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
	else if (dbo instanceof PostDBO) {
		const repliesSerialized = [];
		const filesSerialized = [];

		for (const r of dbo.getReplies()) {
			repliesSerialized.push(serialize(r));
		}

		for (const f of dbo.getFiles()) {
			filesSerialized.push(serialize(f));
		}

		return {
			id: dbo.getId(),
			post_title: dbo.getTitle(),
			post_content: dbo.getContent(),
			board: serialize(dbo.getBoard()),
			files_attached: filesSerialized,
			author: dbo.getAuthor(),
			date_created: dbo.getDateCreated(),
			replies: repliesSerialized};
	}
	else if (dbo instanceof ReplyDBO) {
		return {
			id: dbo.getId(),
			reply_content: dbo.getContent(),
			post_id: dbo.getPost(),
			author: serialize(dbo.getAuthor()),
			dateCreated: dbo.getDateCreated()};
	}
	else if (dbo instanceof FileDBO) {
		return {
			id: dbo.getId(),
			filename: dbo.getFilename(),
			path: dbo.getPath()};
	}
	else {
		throw new Error("unsupported type");
	}
}
