import * as request from "request-promise-native";

import { config } from "../config";
import { FileDBO } from "../db/file.dbo";

export async function createPost(title: string, content: string, boardTitle: string, files: string[]): Promise<any> {
	return request({
		uri: config.test.baseurl + "/post/write",
		method: "POST",
		body: {
			post_title: title,
			post_content: content,
			board_title: boardTitle,
			files_attached: files,
		},
		json: true,
	}).promise();
}

export async function retrievePostList(pageNum: number, boardTitle: string, year: number) {
	return request({
		uri: config.test.baseurl + "/post/page/" + pageNum,
		qs: {
			year,
			board: boardTitle,
		},
		json: true,
	}).promise();
}

export async function retrievePostById(id: string) {
	return request({
		uri: config.test.baseurl + "/post/" + id,
		method: "GET",
		json: true,
	}).promise();
}

export async function updatePost(id: string, postTitle: string | null, postContent: string | null, filesAttached: any[] | null): Promise<any> {
	return request({
		uri: config.test.baseurl + "/post/update/" + id,
		method: "PUT",
		body: {
			post_title: postTitle,
			post_content: postContent,
			files_attached: filesAttached,
		},
		json: true,
	}).promise();
}

export async function deletePost(id: string): Promise<any> {
	return request({
		uri: config.test.baseurl + "/post/delete/" + id,
		method: "DELETE",
		json: true,
	}).promise();
}
