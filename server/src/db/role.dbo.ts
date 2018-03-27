export class RoleDBO {

	public constructor(
		private id: string | number, 
		private roleTitle: string) {}

	public getId() {
		return this.id;
	}

	public getTitle() {
		return this.roleTitle;
	}
}
