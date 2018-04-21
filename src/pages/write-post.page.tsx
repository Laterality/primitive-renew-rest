/**
 * /write page
 * 
 * author: Jinwoo Shin
 * date: 2018-04-18
 */
import * as axios from "axios";
import * as jquery from "jquery";
import * as propTypes from "prop-types";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as reqPost from "../lib/post.request";
import * as reqUser from "../lib/user.request";

import { PostObject } from "../lib/post.obj";

export class WritePostPage extends React.Component {

	public static contextType = {
		router: propTypes.object.isRequired,
	};

	public componentDidMount() {
		const titleLabel = ReactDOM.findDOMNode(this.refs["titleLabel"]);
		const contentLabel = ReactDOM.findDOMNode(this.refs["contentLabel"]);
		const contentForm = ReactDOM.findDOMNode(this.refs["contentForm"]);

		if (titleLabel) {
			jquery(titleLabel).attr("for", "title");
		}
		if (contentLabel) {
			jquery(contentLabel).attr("for", "content");
		}
		if (contentForm) {
			jquery(contentForm).attr("rows", "20");
		}

		reqUser.UserAPIRequest.checkSignedIn()
		.then((res: axios.AxiosResponse) => {
			const body = res.data;
			if (!body["state"]["signed"]) {
				alert("로그인이 필요합니다.");
				this.context["router"]["history"]["push"]("/");
			}
		});
	}

	public render() {
		return (
			<div>
				Write some post
				<div className="form-group">
					<label ref="titleLabel">제목</label>
					<input type="text" id="title" className="form-control" placeholder="제목을 입력하세요." />
				</div>
				<div className="form-group">
					<label ref="contentLabel">내용</label>
					<textarea id="content" className="form-control" ref="contentForm"/>
				</div>
				<button className="btn bg-primary text-white text-center float-right" onClick={this.onWriteClicked}><img src="/img/ic_create_white_48px.svg" className="icon" />완료</button>
			</div>
		);
	}

	private onWriteClicked = () => {
		const title = jquery("#title").val();
		const content = jquery("#content").val();
		const boardTitle = "세미나";
		const files: string[] = [];
		reqPost.PostAPIRequest.createPost(title as string, content as string,
			boardTitle, files)
		.then((res: axios.AxiosResponse) => {
			const body = res.data;
			if (body["result"] === "ok") {
				alert("등록되었습니다.");
			}
			else {
				alert("등록에 실패하였습니다.");
			}
		});
	}
}
