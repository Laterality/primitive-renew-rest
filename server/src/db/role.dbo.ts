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
