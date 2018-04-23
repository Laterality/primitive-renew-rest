import { default as axios } from "axios";
import * as qs from "querystring";

import { config } from "../config";
import { UserDBO } from "../db/user.dbo";

export function createUser(user: UserDBO): Promise<any> {
	return axios(config.test.baseurl + "/user/register", {
		method: "POST",
		data: {
			name: user.getName(),
			sid: user.getName(),
			password: user.getPassword(),
			role: user.getRole().getTitle(),
		},
		withCredentials: true,
	});
}

export function retrieveUserById(id: string | number): Promise<any> {
	return axios(config.test.baseurl + "/user/user-by-id/" + id, {
		method: "GET",
		withCredentials: true,
	});
}

export function searchUser(key: string, roles: string[]): Promise<any> {
	return axios(config.test.baseurl + "/user/find-by-name-or-sid/" + key, {
		method: "GET",
		data: qs.stringify({
			roles,
		}),
		withCredentials: true,
	});
}

export function updateUser(id: string | number, pwCurrent: string, pwNew: string, newRole: string): Promise<any> {
	return axios(config.test.baseurl + "/user/update/" + id, {
		method: "PUT",
		data: {
			current_password: pwCurrent,
			new_password: pwNew,
			new_password_confirm: pwNew,
			role: newRole,
		},
		withCredentials: true,
	});
}

export function deleteUser(id: string | number): Promise<any> {
	return axios(config.test.baseurl + "/user/delete/" + id, {
		method: "DELETE",
	});
}

export function loginUser(sid: string, password: string): Promise<any> {
	return axios(config.test.baseurl + "/auth/login", {
		method: "POST",
		data: {
			id: sid,
			pw: password,
		},
		withCredentials: true,
	});
}

export function logoutUser(): Promise<any> {
	return axios(config.test.baseurl + "/auth/logout", {
		method: "GET",
		withCredentials: true,
	});
}
