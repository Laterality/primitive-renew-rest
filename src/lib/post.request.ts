import * as axios from "axios";
import * as qs from "querystring";

import { config } from "../../server/config";

import { PostObject } from "./post.obj";

export class PostAPIRequest {

	public static createPost = (title: string, content: string, boardTitle: string, fileIds: string[]) => {
		return axios.default.post(
			config.url + "/api/v1/post/write",
			{
				post_title: title,
				post_content: content,
				board_title: boardTitle,
				files_attached: fileIds,
			});
	}

	public static retrievePostList = (page: number, year: number, boardTitle: string) => {
		return axios.default.get(
			`${config.url}/api/v1/post/page/${page}?year=${year}&board_title=${boardTitle}`);
	}

	public static retrievePostById = (postId: string | number) => {
		return axios.default.get(`${config.url}/api/v1/post/${postId}`);
	}

	public static updatePost = (post: PostObject) => {
		return axios.default.put(
			`${config.url}/api/v1/post/update/${post.getId()}`,
			{
				post_title: post.getTitle(),
				post_content: post.getContent(),
				files_attached: post.getFilesAttached(),
			});
	}

	public static deletePost = (postId: string | number) => {
		return axios.default.delete(
			`${config.url}/api/v1/post/delete/${postId}`);
	}
}
