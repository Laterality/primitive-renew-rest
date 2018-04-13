/**
 * Reply object for database layer abstraction
 * 
 * author: Jin-woo Shin
 * date: 2018-04-02
 */
import { PostDBO } from "./post.dbo";
import { UserDBO } from "./user.dbo";

export class ReplyDBO {

	public constructor(
		private replyContent: string,
		private post: PostDBO,
		private author: UserDBO,
		private dateCreated: Date,
		private id?: string | number,
	) {}

	public getContent() { return this.replyContent; }
	public getPost() { return this.post; }
	public getAuthor() { return this.author; }
	public getDateCreated() { return this.dateCreated; }
	public getId() { return this.id; }

	public setReplyContent(content: string) { this.replyContent = content; }
}
