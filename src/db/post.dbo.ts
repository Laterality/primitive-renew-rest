/**
 * Post object for database layer abstraction
 * 
 * author: Jinwoo Shin
 * date: 2018-04-02
 */
import { BoardDBO } from "./board.dbo";
import { FileDBO } from "./file.dbo";
import { ReplyDBO } from "./reply.dbo";
import { UserDBO } from "./user.dbo";

export class PostDBO {

	public constructor(
		private postTitle: string,
		private postContent: string,
		private board: BoardDBO,
		private filesAttached: FileDBO[],
		private author: UserDBO,
		private dateCreated: Date,
		private replies: ReplyDBO[],
		private id: string | number,
	) { }

	public getTitle() { return this.postTitle; }
	public getContent() { return this.postContent; }
	public getBoard() { return this.board; }
	public getFiles() { return this.filesAttached; }
	public getAuthor() { return this.author; }
	public getDateCreated() { return this.dateCreated; }
	public getReplies() { return this.replies; }
	public getId() { return this.id; }

	public setTitle(title: string) { this.postTitle = title; }
	public setContent(content: string) { this.postContent = content; }
	public setExcerpt(limit: number) {
		if (this.postContent.length > limit) {
			this.postContent = this.postContent.substring(0, limit) + "...";
		}
	}
	public setReplies(replies: ReplyDBO[]) { this.replies = replies; }
	public setFiles(files: FileDBO[]) { this.filesAttached = files; }
}
