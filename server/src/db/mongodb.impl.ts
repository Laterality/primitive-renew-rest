import * as mongoose from "mongoose";

import { IDatabase } from "./db-interface";
import * as model from "./models";

import { BoardDBO } from "./board.dbo";
import { FileDBO } from "./file.dbo";
import { PostDBO } from "./post.dbo";
import { ReplyDBO } from "./reply.dbo";
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
	public async createUser(newUser: UserDBO): Promise<UserDBO> {
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
	public async findUserById(id: string | number): Promise<UserDBO> {
		const userFound = await model.UserModel.findById(id).exec();
		if (!userFound) { throw new Error("not found"); }
		return this.userDocToDBO(userFound);
	}

	/**
	 * sid로 회원을 조회
	 * @param sid 
	 */
	public async findUserBySID(sid: string): Promise<UserDBO> {
		const userFound = await model.UserModel.findOne({sid}).populate("role").exec();
		if (!userFound) { throw new Error("not found"); }
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
	public async searchUser(keyword: string, roleIds: string[]): Promise<UserDBO[]> {
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
			throw new Error("not found");
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
			throw new Error("not found");
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
	public async findRoleById(id: string): Promise<RoleDBO> {
		const roleFound = await model.RoleModel.findById(id).exec();
		if (!roleFound) { throw new Error("not found"); }
		return this.roleDocToDBO(roleFound);
	}

	/**
	 * 
	 * @param title 조회할 role의 role_title
	 */
	public async findRoleByTitle(title: string): Promise<RoleDBO> {
		const roleFound = await model.RoleModel.findOne({role_title: title}).exec();
		if (!roleFound) { throw new Error("not found"); }
		return this.roleDocToDBO(roleFound);
	}

	/**
	 * 모든 role 조회
	 */
	public async findAllRole(): Promise<RoleDBO[]> {
		const rolesFound = await model.RoleModel.find().exec();

		return this.rolesDocToDBO(rolesFound);
	}
	
	/**
	 * 게시판 생성
	 * @param newBoard 생성할 게시판
	 */
	public async createBoard(newBoard: BoardDBO): Promise<BoardDBO> {

		const readableRoleIds: string[] = [];
		const writableRoleIds: string[] = [];
		for (const role of newBoard.getRolesReadable()) {
			readableRoleIds.push(role.getId() as string);
		}
		for (const role of newBoard.getRolesWritable()) {
			writableRoleIds.push(role.getId() as string);
		}

		const board = new model.BoardModel({
			board_title: newBoard.getTitle(),
			roles_readable: readableRoleIds,
			roles_writable: writableRoleIds,
		});

		await board.save();

		return this.boardDocToDBO(board) as BoardDBO;
	}

	/**
	 * id로 게시판 조회
	 * @param id 조회할 게시판 id
	 */
	public async findBoardById(id: string | number): Promise<BoardDBO> {
		const board = await model.BoardModel.findById(id).exec();
		if (!board) { throw new Error("not found"); }
		return this.boardDocToDBO(board);
	}

	/**
	 * 모든 게시판 목록
	 */
	public async findAllBoards(): Promise<BoardDBO[]> {
		const boards = await model.BoardModel.find().exec();

		return this.boardsDocToDBO(boards);
	}

	/**
	 * 게시판 갱신
	 * @param board 갱신할 게시판
	 */
	public async updateBoard(board: BoardDBO): Promise<void> {
		const boardFound = await model.BoardModel.findById(board.getId()).exec();
		if (!boardFound) {
			throw new Error("board not exist");
		}
		const readableRoleIds: string[] = [];
		const writableRoleIds: string[] = [];

		for (const r of board.getRolesReadable()) {
			readableRoleIds.push(r.getId() as string);
		}
		for (const r of board.getRolesWritable()) {
			writableRoleIds.push(r.getId() as string);
		}

		(boardFound as any)["board_title"] = board.getTitle();
		(boardFound as any)["roles_readable"] = readableRoleIds;
		(boardFound as any)["roles_writable"] = writableRoleIds;
		await boardFound.save();
	}

	/**
	 * 게시판 삭제
	 * @param board 삭제할 게시판
	 */
	public async removeBoard(board: BoardDBO): Promise<void> {
		const boardFound = await model.BoardModel.findById(board.getId()).exec();

		if (!boardFound) {
			throw new Error("board not exist");
		}

		await boardFound.remove();
	}

	/**
	 * 게시물 생성
	 * @param post 생성할 게시물
	 */
	public async createPost(post: PostDBO): Promise<PostDBO> {
		const fileIds: string[] = [];
		const replIds: string[] = [];
		for (const f of post.getFiles()) {
			fileIds.push(f.getId() as string);
		}
		for (const r of post.getReplies()) {
			replIds.push(r.getId() as string);
		}
		const newPost = new model.PostModel({
			post_title: post.getTitle(),
			post_content: post.getContent(),
			boar: post.getBoard().getId(),
			files_attached: fileIds,
			author: post.getAuthor().getId(),
			date_created: post.getDateCreated(),
			replies: replIds,
		});

		const created = await newPost.populate("board").populate("author").populate("replies").save();

		return this.postDocToDBO(created);
	}

	/**
	 * 게시물 조회
	 * @param id 게시물 id
	 */
	public async findPostById(id: string | number): Promise<PostDBO> {
		const postFound = await model.PostModel.findById(id).populate("board").populate("author").polygon("replies").exec();

		if (!postFound) { throw new Error("not found"); }
		return this.postDocToDBO(postFound);
	}

	/**
	 * 게시판 별 게시물 조회
	 * @param boardId 게시판 id
	 * @param year 작성 연도
	 * @param page 조회할 페이지 번호
	 */
	public async findPostsByBoard(boardId: string | number, year: number, page: number): Promise<PostDBO[]> {
		const postsFound = await model.PostModel.find({board: boardId}).populate("board").populate("author").populate("replies").exec();

		return this.postsDocToDBO(postsFound);
	}
	
	/**
	 * 게시물 갱신
	 * @param board 갱신될 게시물
	 */
	public async updatePost(post: PostDBO): Promise<void> {
		const postFound = await model.PostModel.findById(post.getId()).exec();

		if (!postFound) { throw new Error("not found"); }

		const fileIds: string[] = [];

		for (const f of post.getFiles()) {
			fileIds.push(f.getId() as string);
		}

		(postFound as any)["post_title"] = post.getTitle();
		(postFound as any)["post_content"] = post.getContent();
		(postFound as any)["files_attached"] = fileIds;
	}

	/**
	 * 게시물 삭제
	 * @param board 삭제할 게시물
	 */
	public async removePost(board: BoardDBO): Promise<void> {
		const postFound = await model.PostModel.findById(board.getId()).exec();
		
		if (!postFound) { throw new Error("not found"); }

		await postFound.remove();
	}

	private roleDocToDBO(doc: mongoose.Document): RoleDBO {
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
	private userDocToDBO(doc: mongoose.Document): UserDBO {
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

	private boardDocToDBO(doc: mongoose.Document): BoardDBO {

		return new BoardDBO(
			(doc as any)["board_title"],
			this.rolesDocToDBO((doc as any)["roles_readable"]),
			this.rolesDocToDBO((doc as any)["roles_writable"]),
			doc._id);
	}

	private boardsDocToDBO(docs: mongoose.Document[]): BoardDBO[] {
		const boards: BoardDBO[] = [];
		for (const doc of docs) {
			boards.push(this.boardDocToDBO(doc) as BoardDBO);
		}
		return boards;
	}

	private postDocToDBO(doc: mongoose.Document): PostDBO{
		const da = doc as any;
		return new PostDBO(
			da["post_title"],
			da["post_content"],
			this.boardDocToDBO(da["board"]),
			this.filesDocToDBO(da["files_attached"]),
			this.userDocToDBO(da["author"]),
			da["date_created"],
			this.repliesDocToDBO(da["replies"]),
			da["_id"],
		);
	}

	private postsDocToDBO(docs: mongoose.Document[]): PostDBO[] {
		const dbos: PostDBO[] = [];
		for (const p of docs) {
			dbos.push(this.postDocToDBO(p));
		}

		return dbos;
	}

	private fileDocToDBO(doc: mongoose.Document): FileDBO {
		const da = doc as any;
		return new FileDBO(
			da["filename"],
			da["path"],
			da["_id"],
		);
	}

	private filesDocToDBO(docs: mongoose.Document[]): FileDBO[] {
		const files: FileDBO[] = [];

		for (const f of docs) {
			files.push(this.fileDocToDBO(f));
		}

		return files;
	}

	private replyDocToDBO(doc: mongoose.Document): ReplyDBO {
		const da = doc as any;
		return new ReplyDBO(
			da["reply_content"],
			this.postDocToDBO(da["post"]) as PostDBO,
			this.userDocToDBO(da["author"]) as UserDBO,
			da["date_created"],
			da["_id"],
		);
	}

	private repliesDocToDBO(docs: mongoose.Document[]): ReplyDBO[] {
		const replies: ReplyDBO[] = [];
		for (const r of docs) {
			replies.push(this.replyDocToDBO(r));
		}

		return replies;
	}
}
