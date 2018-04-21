/**
 * User API requester
 * 
 * author: Jinwoo Shin
 * date: 2018-04-18
 */
import { default as axios } from "axios";

import { config } from "../../server/config";
import { UserObject } from "./user.obj";

export class UserAPIRequest {

	public static registerUser = (user: UserObject, pw: string) => {
		return axios.post(
			config.url + "/api/v1/user/register",
			{
				name: user.getName(),
				sid: user.getSid(),
				password: pw,
				role: user.getRole(),
			});
	}

	public static loginUser = (id: string, pw: string) => {
		return axios.post(
			config.url + "/api/v1/auth/login",
			{
				id,
				pw,
			},
		);
	}

	public static logoutUser = () => {
		return axios.get(config.url + "/api/v1/auth/logout");
	}

	public static checkSignedIn = () => {
		return axios.get(config.url + "/api/v1/auth/check");
	}
}
