/**
 * Client-side file API object
 * 
 * author: Jin-woo Shin
 * date: 2018-04-16
 */

 export class FileObject {

	public constructor(
		private filename: string,
		private path: string,
		private id: string | number,
	) {}

	public getFilename() { return this.filename; }
	public getPath() { return this.path; }
	public getId() { return this.id; }
}
