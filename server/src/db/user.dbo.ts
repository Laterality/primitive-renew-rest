import { RoleDBO } from "./role.dbo";

export class UserDBO {

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

	public getRole() {
		return this.role;
	}

	public setPassword(password: string) {
		this.password = password;
	}

	public setRole(role: RoleDBO) {
		this.role = role;
	}
}
