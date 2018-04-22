import * as request from "request-promise-native";

import { config } from "../config";
import { UserDBO } from "../db/user.dbo";

export async function createUser(user: UserDBO): Promise<any> {
	return await request({
		uri: config.test.baseurl + "/user/register",
		method: "POST",
		body: {
			name: user.getName(),
			sid: user.getName(),
			password: user.getPassword(),
			role: user.getRole().getTitle(),
		},
		json: true,
	}).promise();
}

export async function retrieveUserById(id: string | number): Promise<any> {
	return await request({
		uri: config.test.baseurl + "/user/user-by-id/" + id,
		method: "GET",
		json: true,
	}).promise();
}

export async function searchUser(key: string, roles: string[]): Promise<any> {
	return await request({
		uri: config.test.baseurl + "/user/find-by-name-or-sid/" + key,
		qs: {
			roles,
		},
		method: "GET",
		json: true,
	}).promise();
}

export async function updateUser(id: string | number, pwCurrent: string, pwNew: string, newRole: string): Promise<any> {
	return await request({
		uri: config.test.baseurl + "/user/update/" + id,
		method: "PUT",
		body: {
			current_password: pwCurrent,
			new_password: pwNew,
			new_password_confirm: pwNew,
			role: newRole,
		},
	}).promise();
}

export async function deleteUser(id: string | number): Promise<any> {
	return request({
		uri: config.test.baseurl + "/user/delete/" + id,
		method: "DELETE",
	}).promise();
}

export async function loginUser(sid: string, password:string): Promise<any> {
	return request({
		uri: config.test.baseurl + "/user/login",
		method: "POST",
		body: {
			id: sid,
			pw: password,
		},
		json: true,
	}).promise();
}

export async function logoutUser(): Promise<any> {
	return request({
		uri: config.test.baseurl + "/user/logout",
		method: "GET",
		json: true,
	}).promise();
}
