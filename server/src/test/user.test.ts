import * as chai from "chai";
import * as chasAsPromised from "chai-as-promised";

import * as userReq from "./user.request";

import { RoleDBO } from "../db/role.dbo";
import { UserDBO } from "../db/user.dbo";

chai.use(chasAsPromised);

/**
 * Test scenario
 * 
 * 1. Register user
 * 2. Login user
 * 3. Update user
 * 4. Find user
 * 5. Delete user
 * 
 */
describe("Test User API", () => {
	let userCreatedA: any = {};

	it("1. Register user", (done: any) => {
		userReq.createUser(new UserDBO(
			"201201234",
			"John Smith",
			"p@ssW0rd",
			"",
			new RoleDBO("신입생"),
		))
		.then((res1: any) => {
			userCreatedA = res1["user"];
			chai.expect(res1["result"]).to.equal("ok");
			chai.expect(userCreatedA["id"]).to.exist("string");

			done();
		});
	});

	it("2. Login user", (done: any) => {
		userReq.loginUser("201201234", "p@ssW0rd")
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			done();
		});
	});

	it("3. Update user ", (done: any) => {
		userReq.updateUser(userCreatedA["id"], "p@ssW0rd", "p@ssW0rd!", "재학생")
		.then((res1: any) => {
			chai.expect(res1["result"]).equal("ok");

			userReq.logoutUser()
			.then((res2: any) => {
				chai.expect(res2["result"]).to.equal("ok");

				userReq.loginUser("201201234", "p@ssW0rd!")
				.then((res: any) => {
					chai.expect(res["result"]).to.equal("ok");
					done();
				});
			});
		});
	});

	it("4. Find user", (done: any) => {
		userReq.searchUser("john", ["재학생"])
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			chai.expect(res["users"]["length"]).to.equal(1);
		});
	});

	it("5. Delete user", (done: any) => {
		userReq.logoutUser()
		.then((res1: any) => {
			chai.expect(res1["result"]).to.equal("ok");

			userReq.loginUser("root", "root")
			.then((res2: any) => {
				chai.expect(res2["result"]).to.equal("ok");

				userReq.deleteUser(userCreatedA["id"])
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
