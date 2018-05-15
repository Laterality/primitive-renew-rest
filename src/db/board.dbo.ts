/**
 * Board object for database layer abstraction
 * 
 * author: Jinwoo Shin
 * date: 2018-03-29
 */
import { PostDBO } from "./post.dbo";
import { RoleDBO } from "./role.dbo";

export class BoardDBO {

	public constructor(
		private boardTitle: string,
		private rolesReadable: RoleDBO[],
		private rolesWritable: RoleDBO[],
		private id: string | number,
		private posts: PostDBO[] = []) {

	}

	public getId() { return this.id; }
	public getTitle() { return this.boardTitle; }
	public getRolesReadable() { return this.rolesReadable; }
	public getRolesWritable() { return this.rolesWritable; }
	public getPosts() { return this.posts; }
	
	public setTitle(title: string) { this.boardTitle = title; }
	public setRolesReadable(roles: RoleDBO[]) { this.rolesReadable = roles; }
	public setRolesWritable(roles: RoleDBO[]) { this.rolesWritable = roles; }
}
