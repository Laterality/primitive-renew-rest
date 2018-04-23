/**
 * Post API requester
 * 
 * author: Jinwoo Shin
 * date: 2018-04-05
 */
import { default as axios } from "axios";
import * as qs from "querystring";

import { config } from "../config";
import { FileDBO } from "../db/file.dbo";

export function createPost(title: string, content: string, boardTitle: string, files: string[]): Promise<any> {
	return axios(config.test.baseurl + "/post/write", {
		method: "POST",
		data: {
			post_title: title,
			post_content: content,
			board_title: boardTitle,
			files_attached: files,
		},
		withCredentials: true,
	});
}

export function retrievePostList(pageNum: number, boardTitle: string, year: number) {
	return axios(config.test.baseurl + "/post/page/" + pageNum, {
		method: "GET",
		data: qs.stringify({
			year,
			board: boardTitle,
		}),
		withCredentials: true,
	});
}

export function retrievePostById(id: string) {
	return axios(config.test.baseurl + "/post/" + id, {
		method: "GET",
		withCredentials: true,
	});
}

export function updatePost(id: string, postTitle: string | null, postContent: string | null, filesAttached: any[] | null): Promise<any> {
	return axios(config.test.baseurl + "/post/update/" + id, {
		method: "PUT",
		data: {
			post_title: postTitle,
			post_content: postContent,
			files_attached: filesAttached,
		},
		withCredentials: true,
	});
}

export function deletePost(id: string): Promise<any> {
	return axios(config.test.baseurl + "/post/delete/" + id, {
		method: "DELETE",
		withCredentials: true,
	});
}
