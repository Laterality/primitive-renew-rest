/**
 * Client-side post API object
 * 
 * author: Jin-woo Shin
 * date: 2018-04-16
 */
import { FileObject } from "./file.obj";
import { ReplyObject } from "./reply.obj";
import { UserObject } from "./user.obj";

 export class PostObject {

	public constructor(
		private title: string,
		private content: string,
		private board: string,
		private filesAttached?: FileObject[],
		private dateCreated?: Date,
		private author?: UserObject,
		private replies?: ReplyObject[],
		private id?: string | number,
	) {}

	public getTitle() { return this.title; }
	public getContent() { return this.content; }
	public getBoard() { return this.board; }
	public getAuthor() { return this.author; }
	public getFilesAttached() { return this.filesAttached; } 
	public getDateCreated() { return this.dateCreated; }
	public getReplies() { return this.replies; }
	public getId() { return this.id; }
	
 }
