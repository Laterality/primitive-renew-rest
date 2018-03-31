
export class FileDBO {

	public constructor(
		private filename: string,
		private path: string,
		private id?: string | number,
	) {}

	public getId() { return this.id; }
	public getFilename() { return this.filename; }
	public getPath() { return this.path; }
}
