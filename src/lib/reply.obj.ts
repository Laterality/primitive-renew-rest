/**
 * Client-side reply API object
 * 
 * author: Jin-woo Shin
 * date: 2018-04-16
 */
import { PostObject } from "./post.obj";
import { UserObject } from "./user.obj";

 export class ReplyObject {
	 
	public constructor(
		private content: string,
		private author: UserObject,
		private dateCreated: Date,
		private id?: string | number,
	) {}

	public getContent() { return this.content; }
	public getAuthor() { return this.author; }
	public getDateCreated() { return this.dateCreated; }
	public getId() { return this.id; }
}
