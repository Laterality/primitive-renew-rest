import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { RoleDBO } from "../db/role.dbo";
import { UserDBO } from "../db/user.dbo";

import * as postReq from "./post.request";
import * as userReq from "./user.request";

chai.use(chaiAsPromised);

/**
 * bf. create user to write post and login
 * 1. Write post
 * 2. Retrieve post list 
 * 3. Retrieve single post detail
 * 4. Update post
 * 5. Delete post
 * af. logout and delete user
 */
describe("Test Post API", () => {

	let userCreated: any;
	const postsCreated: any[] = [];

	before((done: any) => {
		userReq.createUser(new UserDBO(
			"201201234",
			"John Smith",
			"p@ssW0rd",
			"",
			new RoleDBO("재학생"),
		))
		.then((res: any) => {
			userCreated = res["user"];
			done();
		});
	});

	// 1. write post
	it("1. Write post", (done: any) => {
		postReq.createPost("test post", "test post content", "세미나", [])
		.then((res1: any) => {
			chai.expect(res1["result"]).to.equal("ok");
			postsCreated.push(res1["post"]);

			postReq.createPost("test post2", "test post content", "세미나", [])
			.then((res2: any) => {
				chai.expect(res2["result"]).to.equal("ok");
				postsCreated.push(res2["post"]);

				postReq.createPost("test post3", "test post content", "세미나", [])
				.then((res3: any) => {
					chai.expect(res3["result"]).to.equal("ok");
					postsCreated.push(res3["post"]);

					postReq.createPost("test post4", "test post content", "세미나", [])
					.then((res4: any) => {
						chai.expect(res4["result"]).to.equal("ok");
						postsCreated.push(res4["post"]);

						postReq.createPost("test post5", "test post content", "세미나", [])
						.then((res5: any) => {
							chai.expect(res5["rseult"].to.equal("ok"));
							postsCreated.push(res5["post"]);

							postReq.createPost("test post6", "test post content", "세미나", [])
							.then((res6: any) => {
								chai.expect(res6["result"]).to.equal("ok");
								postsCreated.push(res6["post"]);

								done();
							});
						});
					});
				});
			});
		});
	});

	it("2. Retrieve post list", (done: any) => {
		postReq.retrievePostList(2, "세미나", new Date().getUTCFullYear())
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			chai.expect(res["posts"].length).to.equal(1);
			chai.expect(res["posts"][0]["id"]).to.equal(postsCreated[0]["id"]);
			done();
		});
	});

	it("3. Retrieve single post detail", (done: any) => {
		postReq.retrievePostById(postsCreated[0]["id"])
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			chai.expect(res["post"]["post_title"]).to.equal(postsCreated[0]["post_title"]);
			done();
		});
	});

	it("4. Update post", (done: any) => {
		postReq.updatePost(postsCreated[0]["id"], null,
		"updated content", null)
		.then((res1: any) => {
			chai.expect(res1["result"]).to.equal("ok");
			
			postReq.retrievePostById(postsCreated[0]["id"])
			.then((res2: any) => {
				chai.expect(res2["result"]).to.equal("ok");
				chai.expect(res2["post"]["post_content"]).to.equal("updated content");

				done();
			});
		});
	});

	it("5. Delete post", (done: any) => {
		postReq.deletePost(postsCreated[0]["id"])
		.then((res1: any) => {
			chai.expect(res1["result"]).to.equal("ok");

			postReq.deletePost(postsCreated[1]["id"])
			.then((res2: any) => {
				chai.expect(res2["result"]).to.equal("ok");

				postReq.deletePost(postsCreated[2]["id"])
				.then((res3: any) => {
					chai.expect(res3["result"]).to.equal("ok");

					postReq.deletePost(postsCreated[3]["id"])
					.then((res4: any) => {
						chai.expect(res4["result"]).to.equal("ok");

						postReq.deletePost(postsCreated[4]["id"])
						.then((res5: any) => {
							chai.expect(res5["result"]).to.equal("ok");

							postReq.deletePost(postsCreated[5]["id"])
							.then((res6: any) => {
								chai.expect(res6["result"]).to.equal("ok");
							});
						});
					});
				});
			});
		});
	});

	after((done: any) => {
		userReq.logoutUser()
		.then((res1: any) => {
			chai.expect(res1["result"]).to.equal("ok");

			userReq.loginUser("root", "root")
			.then((res2: any) => {
				chai.expect(res2["result"]).to.equal("ok");

				userReq.deleteUser(userCreated["id"])
				.then((res3: any) => {
					chai.expect(res3["result"]).to.equal("ok");

					userReq.logoutUser()
					.then((res4: any) => {
						chai.expect(res4["result"]).to.equal("ok");

						done();
					});
				});
			});
		});
	});
});
