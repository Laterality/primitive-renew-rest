/**
 * Reply API Requests
 * 
 * author: Jin-woo Shin
 * date: 2018-04-16
 */
import { default as axios} from "axios";

import { config } from "../config";

import { ReplyDBO } from "../db/reply.dbo";

export function createReply(content: string, post: string) {
	return axios(config.test.baseurl + "/reply/write", {
		data: {
			postId: post,
			reply_content: content,
		},
		withCredentials: true,
	});
}

export function updateReply(id: string, content: string) {
	return axios(config.test.baseurl + "/reply/update/" + id, {
		data: {
			reply_content: content,
		},
		withCredentials: true,
	});
}

export function deleteReply(id: string) {
	return axios(config.test.baseurl + "/reply/delete/" + id, {
		method: "DELETE",
		withCredentials: true,
	});
}
