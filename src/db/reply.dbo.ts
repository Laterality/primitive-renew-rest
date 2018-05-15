/**
 * Reply object for database layer abstraction
 * 
 * author: Jinwoo Shin
 * date: 2018-04-02
 */
import { PostDBO } from "./post.dbo";
import { UserDBO } from "./user.dbo";

export class ReplyDBO {

	public constructor(
		private replyContent: string,
		private postId: string | number,
		private author: UserDBO,
		private dateCreated: Date,
		private id: string | number,
	) {}

	public getContent() { return this.replyContent; }
	public getPostId() { return this.postId; }
	public getAuthor() { return this.author; }
	public getDateCreated() { return this.dateCreated; }
	public getId() { return this.id; }

	public setReplyContent(content: string) { this.replyContent = content; }
}
