import * as mongoose from "mongoose";

import { IDatabase } from "./db-interface";
import * as model from "./models";
import { RoleDBO } from "./role.dbo";
import { UserDBO } from "./user.dbo";

export class MongoDBImpl implements IDatabase {

	public static getInstance(): MongoDBImpl {
		if (!this.mInstance) {
			this.mInstance = new MongoDBImpl();
		}

		return this.mInstance;
	}

	private static mInstance: MongoDBImpl;

	private constructor() {

	}

	/**
	 * 회원 생성
	 * @param newUser 생성할 회원
	 */
	public async createUser(newUser: UserDBO): Promise<UserDBO | null> {
		const user = new model.UserModel({
			name: newUser.getName(),
			sid: newUser.getSID(),
			password: newUser.getPassword(),
			salt: newUser.getSalt(),
			role: newUser.getRole().getId()}).populate("role");

		await user.save();

		return this.userDocToDBO(user);
	}

	/**
	 * id로 회원을 조회
	 */
	public async findUserById(id: string): Promise<UserDBO | null> {
		const userFound = await model.UserModel.findById(id).exec();
		
		return this.userDocToDBO(userFound);
	}

	/**
	 * 모든 회원을 조회
	 */
	public async findAllUser(): Promise<UserDBO[]> {
		const usersFound = await model.UserModel.find().exec();
		
		return this.usersDocToDBO(usersFound);
	}

	/**
	 * 회원 검색
	 * @param keyword 검색 키워드(학번, 이름)
	 * @param roleIds 한정할 역할 id 배열
	 */
	public async searchUser(keyword: string, roleIds: string[]): Promise<UserDBO[] | null> {
		const result = await model.UserModel.find({
			$text: {
				$search: keyword,
			},
			role: {
				$in: roleIds,
			},
		}, {
				score: { $meta: "textScore" },
			})
		.sort({ score: { $meta: "textScore" }})
		.exec();
		
		return this.usersDocToDBO(result);
	}
	
	/**
	 * 회원의 현재 상태를 DB에 반영
	 * 
	 * @param user 갱신할 회원
	 */
	public async updateUser(user: UserDBO): Promise<void> {
		const userFound = await model.UserModel.findById(user.getId()).exec();

		if (!userFound) {
			throw new Error("user not exist");
		}
		else {
			(userFound as any)["name"] = user.getName();
			(userFound as any)["sid"] = user.getSID();
			(userFound as any)["password"] = user.getPassword();
			(userFound as any)["salt"] = user.getSalt();
			(userFound as any)["role"] = user.getRole().getId();

			await userFound.save();
		}
	}

	/**
	 * 회원 정보를 삭제
	 * @param user 삭제할 회원
	 */
	public async removeUser(user: UserDBO): Promise<void> {
		const userFound = await model.UserModel.findById(user).exec();

		if (!userFound) {
			throw new Error("user not exist");
		}
		else {
			await userFound.remove();
		}
	}

	/**
	 * 역할 생성
	 * @param role 생성할 역할
	 */
	public async createRole(role: RoleDBO): Promise<RoleDBO> {
		const newRole = new model.RoleModel({
			role_title: role.getTitle()});

		await newRole.save();

		return this.roleDocToDBO(newRole) as RoleDBO;
	}

	/**
	 * 
	 * @param id 조회할 role의 id
	 */
	public async findRoleById(id: string): Promise<RoleDBO | null> {
		const roleFound = await model.RoleModel.findById(id).exec();

		return this.roleDocToDBO(roleFound);
	}

	/**
	 * 
	 * @param title 조회할 role의 role_title
	 */
	public async findRoleByTitle(title: string): Promise<RoleDBO[]> {
		const rolesFound = await model.RoleModel.find({role_title: title}).exec();

		return this.rolesDocToDBO(rolesFound);
	}

	/**
	 * 모든 role 조회
	 */
	public async findAllRole(): Promise<RoleDBO[]> {
		const rolesFound = await model.RoleModel.find().exec();

		return this.rolesDocToDBO(rolesFound);
	}

	private roleDocToDBO(doc: mongoose.Document | null): RoleDBO | null {
		if (doc === null) { return null; }
		return new RoleDBO(
			(doc as any)["role_title"],
			doc._id);
	}

	private rolesDocToDBO(docs: mongoose.Document[]): RoleDBO[] {
		const roles = [];

		for (const r of docs) {
			roles.push(this.roleDocToDBO(r) as RoleDBO);
		}

		return roles;
	}

	/**
	 * user document를 DBO로 변환
	 * @param doc DBO로 변환할 user document, 
	 */
	private userDocToDBO(doc: mongoose.Document | null): UserDBO | null {
		if (doc === null) { return null; }
		doc.populate("role");
		return new UserDBO(
			(doc as any)["sid"],
			(doc as any)["name"],
			(doc as any)["password"],
			(doc as any)["salt"],
			(this.roleDocToDBO((doc as any)["role"])) as RoleDBO);
	}

	private usersDocToDBO(docs: mongoose.Document[]): UserDBO[] {
		const users: UserDBO[] = [];
		for (const u of docs) {
			users.push(this.userDocToDBO(u) as UserDBO);
		}

		return users;
	}
}
