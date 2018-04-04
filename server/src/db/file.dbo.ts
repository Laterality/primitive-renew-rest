/**
 * File object for database layer abstraction
 * 
 * author: Jin-woo Shin
 * date: 2018-03-29
 */
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
