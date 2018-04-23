/**
 * 댓글 API 테스트
 * 
 * author: Jin-woo Shin
 * date: 2018-04-16
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { PostDBO } from "../db/post.dbo";
import { ReplyDBO } from "../db/reply.dbo";
import { RoleDBO } from "../db/role.dbo";
import { UserDBO } from "../db/user.dbo";

import * as postReq from "./post.request";
import * as replReq from "./reply.request";
import * as userReq from "./user.request";

chai.use(chaiAsPromised);

/**
 * Test scenario
 * 
 * bf. create user, login and write post
 * 
 * 1. Create reply
 * 2. Update reply
 * 3. Delete reply
 * 
 * af. delete post, logout, login root, delete user and logout
 */
describe("Test Reply API", () => {
	let userCreated: any;
	let postCreated: any;
	let replyCreated: any;

	before((done: any) => {
		userReq.createUser(new UserDBO("201201234", "John Smith", "p@ssW0rd", "", new RoleDBO("재학생")))
		.then((res1: any) => {
			userCreated = res1["user"];

			userReq.loginUser(userCreated["sid"], "p@ssW0rd")
			.then((res2: any) => {
				postReq.createPost("test title", "test content", "세미나", [])
				.then((res3: any) => {
					postCreated = res3["post"];
					done();
				});
			});
		});
	});

	it("1. Create reply", (done: any) => {
		replReq.createReply(
			"testing reply",
			postCreated["id"],
		)
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			replyCreated = res["reply"];
			done();
		});
	});

	it("2. Update reply", (done: any) => {
		replReq.updateReply(replyCreated["id"], "updated reply content")
		.then((res1: any) => {
			chai.expect(res1["result"]).to.equal("ok");

			postReq.retrievePostById(postCreated["id"])
			.then((res2: any) => {
				chai.expect(res2["post"]["replies"][0]["reply_content"])
				.to.equal("updated reply content");
				done();
			});
		});
	});

	it("3. Delete reply", (done: any) => {
		replReq.deleteReply(replyCreated["id"])
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			done();
		});
	});

	after((done: any) => {
		postReq.deletePost(postCreated["id"])
		.then(() => {
			userReq.logoutUser()
			.then(() => {
				userReq.loginUser("root", "root")
				.then(() => {
					userReq.deleteUser(userCreated["id"])
					.then(() => {
						userReq.logoutUser()
						.then(() => {
							done();
						});
					});
				});
			});
		});
	});
});
