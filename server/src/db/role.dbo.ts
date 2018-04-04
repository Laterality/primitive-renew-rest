/**
 * Role object for database layer abstraction
 * 
 * author: Jin-woo Shin
 * date: 2018-03-29
 */
export class RoleDBO {

	public constructor( 
		private roleTitle: string,
		private id?: string | number) {}

	public getId() {
		return this.id;
	}

	public getTitle() {
		return this.roleTitle;
	}
}
