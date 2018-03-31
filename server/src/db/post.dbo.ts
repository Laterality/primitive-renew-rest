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
		private id?: string | number,
	) { }

	public getTitle() { return this.postTitle; }
	public getContent() { return this.postContent; }
	public getBoard() { return this.board; }
	public getFiles() { return this.filesAttached; }
	public getAuthor() { return this.author; }
	public getDateCreated() { return this.dateCreated; }
	public getReplies() { return this.replies; }
	public getId() { return this.id; }
}
