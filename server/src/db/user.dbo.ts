import { IDBO } from "./dbo.interface";
import { RoleDBO } from "./role.dbo";

export class UserDBO implements IDBO {

	public constructor(
		private sid: string, 
		private name: string, 
		private password: string, 
		private salt: string, 
		private role: RoleDBO,
		private id?: string | number) {}

	public getId() {
		return this.id;
	}

	public getName() {
		return this.name;
	}

	public getSID() {
		return this.sid;
	}

	public getPassword() {
		return this.password;
	}

	public getSalt() {
		return this.salt;
	}

	public setPassword(password: string) {
		this.password = password;
	}

	public setRole(role: RoleDBO) {
		this.role = role;
	}

	public save() {
		// TODO: implement save entire properties up to db interface
		return null;
	}
}
