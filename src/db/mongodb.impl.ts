/**
 * Implementation of DB interface for mongodb
 * 
 * author: Jinwoo Shin
 * date: 2018-03-29
 */
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
	 * @param name { string } 사용자 이름
	 * @param sid { string } 사용자 아이디
	 * @param password { string } 암호화된 비밀번호
	 * @param salt { string } 솔트값
	 * @param roleTitle { string } 사용자 등급명
	 */
	public async createUser(name: string, sid: string, password: string, salt: string, roleTitle: string): Promise<UserDBO> {
		const roleFound = await model.RoleModel.findOne({role_title: roleTitle}).exec();
		if (!roleFound) {
			throw new Error("not found(role)");
		}
		const user = new model.UserModel({
			name,
			sid,
			password,
			salt,
			role: roleFound._id});

		await user.save();

		const userCreated = await model.UserModel.findById(user._id)
		.populate("role")
		.exec();

		if (!userCreated) { throw new Error("user not created"); }

		return this.userDocToDBO(userCreated);
	}

	/**
	 * id로 회원을 조회
	 */
	public async findUserById(id: string | number): Promise<UserDBO> {
		const userFound = await model.UserModel.findById(id)
		.populate("role")
		.exec();
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
	 * @param userId 삭제할 회원 id(not sid)
	 */
	public async removeUser(userId: string | number): Promise<void> {
		const userFound = await model.UserModel.findById(userId).exec();

		if (!userFound) {
			throw new Error("not found");
		}
		else {
			await userFound.remove();
		}
	}

	/**
	 * 역할 생성
	 * @param roleTitle 생성할 역할명
	 */
	public async createRole(roleTitle: string): Promise<RoleDBO> {
		const newRole = new model.RoleModel({
			role_title: roleTitle,
		});

		await newRole.save();

		const roleCreated = await model.RoleModel.findById(newRole._id).exec();

		if (!roleCreated) { throw new Error("role not created"); }

		return this.roleDocToDBO(roleCreated);
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
	 * @param boardTitle { string }생성할 게시판명
	 * @param roleTitlesReadable { string[] } 읽기 가능한 역할명 배열
	 * @param roleTitlesWritable { string[] } 쓰기 가능한 역할명 배열
	 */
	public async createBoard(boardTitle: string, roleTitlesReadable: string[], roleTitlesWritable: string[]): Promise<BoardDBO> {

		const rolesReadable = await model.RoleModel.find({
			role_title: {
				$in: roleTitlesReadable,
			},
		});
		const rolesWritable = await model.RoleModel.find({
			role_title: {
				$in: roleTitlesWritable,
			},
		});

		const roleIdsReadable: string[] = rolesReadable.map((r: mongoose.Document) => {
			return r._id;
		});
		const roleIdsWritable: string[] = rolesWritable.map((r: mongoose.Document) => {
			return r._id;
		});

		const board = new model.BoardModel({
			board_title: boardTitle,
			roles_readable: roleIdsReadable,
			roles_writable: roleIdsWritable,
		});

		await board.save();

		const boardCreated = await model.BoardModel.findById(board._id)
		.populate("roles_readable")
		.populate("roles_writable")
		.exec();

		if (!boardCreated) { throw new Error("board not created"); }

		return this.boardDocToDBO(boardCreated);
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
	 * 게시판명으로 게시판 조회
	 * @param title 조회할 게시판명
	 */
	public async findBoardByTitle(title: string): Promise<BoardDBO | null> {
		const boardFound = await model.BoardModel.findOne({board_title: title})
		.populate("roles_readable")
		.populate("roles_writable")
		.exec();
		if (boardFound === null) { return null; }

		return this.boardDocToDBO(boardFound);
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
	 * @param boardId { string | number } 삭제할 게시판 id
	 */
	public async removeBoard(boardId: string | number): Promise<void> {
		const boardFound = await model.BoardModel.findById(boardId).exec();

		if (!boardFound) {
			throw new Error("board not exist");
		}

		await boardFound.remove();
	}

	/**
	 * 게시물 생성
	 * @param title { string } 게시물 제목
	 * @param content { string } 게시물 내용
	 * @param boardId { string | number } 게시판 id
	 * @param fileIdsAttached { string[] | number[] } 첨부파일 id 배열
	 * @param authorId { string | number } 작성자 id
	 */
	public async createPost(title: string, content: string, boardId: string | number, fileIdsAttached: string[] | number[], authorId: string | number): Promise<PostDBO> {
		const newPost = new model.PostModel({
			post_title: title,
			post_content: content,
			board: boardId,
			files_attached: fileIdsAttached,
			author: authorId,
			date_created: Date.now(),
			replies: [],
		});

		await newPost.save();

		const created = await model.PostModel.findById(newPost._id)
		.populate("board")
		.populate({
			path: "author",
			populate: {
				path: "role",
			},
		})
		.populate("replies")
		.populate("files_attached")
		.exec();

		if (!created) { throw new Error("post not created"); }

		return this.postDocToDBO(created, true);
	}

	/**
	 * 게시물 조회
	 * @param id 게시물 id
	 */
	public findPostById = async (id: string | number): Promise<PostDBO> => {
		const postFound = await model.PostModel.findById(id)
		.populate("board")
		.populate("author")
		.populate({
			path: "replies",
			populate: {
				path: "author",
				populate: {
					path: "role",
				},
			},
		})
		.populate("files_attached")
		.exec();
		if (!postFound) { throw new Error("not found"); }
		return this.postDocToDBO(postFound, true);
	}

	/**
	 * 게시판 별 게시물 조회
	 * @param boardId 게시판 id
	 * @param year 작성 연도
	 * @param page 조회할 페이지 번호
	 */
	public async findPostsByBoard(boardId: string | number, year: number, page: number, limit: number): Promise<[PostDBO[], number]> {
		const dateFrom = new Date(year, 1, 1);
		const dateTo = new Date(year + 1, 1, 1);
		const query = model.PostModel.find({
			board: boardId,
			date_created: {
				$gte: dateFrom,
				$lt: dateTo,
			},
		}).sort({date_created: -1});
		const postsFound = await model.PostModel.paginate(query, {
			page, 
			limit,
			populate: [
				{
					path: "author",
					populate: {
						path: "role",
					},
				}, {
				path: "board",
				populate: {
					path: "roles_readable roles_writable",
					},
				}, {
					path: "files_attached",
				},
			],
		});

		return [this.postsDocToDBO(postsFound.docs, false), postsFound.total];
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
	 * @param postId { string | number} 삭제할 게시물 id
	 */
	public async removePost(postId: string | number): Promise<void> {
		const postFound = await model.PostModel.findById(postId).exec();
		
		if (!postFound) { throw new Error("not found"); }

		await postFound.remove();
	}

	/**
	 * 댓글 생성
	 * @param reply 생성할 댓글
	 */
	public async createReply(content: string, postId: string | number, authorId: string | number): Promise<ReplyDBO> {
		
		const replyNew = new model.ReplyModel({
			reply_content: content,
			post: postId,
			author: authorId,
			date_created: Date.now(),
		});

		const postFound = await model.PostModel.findById(postId).exec();

		if (!postFound) { throw new Error("not found(post)"); }

		const replyCreated = await replyNew.populate("post").populate("author").save();

		(postFound as any)["replies"].push(replyCreated._id);

		await postFound.save();

		const created = await model.ReplyModel.findById(replyCreated._id)
		.populate("author")
		.exec();

		if (!created) { throw new Error("reply not created"); }

		return this.replyDocToDBO(created, (created as any)["post"]);
	}

	/**
	 * 댓글 조회
	 * @param id 조회할 댓글 id
	 */
	public async findReplyById(id: string | number): Promise<ReplyDBO> {
		const replyFound = await model.ReplyModel.findById(id)
		.populate("author")
		.exec();

		if (!replyFound) { throw new Error("not found"); }

		return this.replyDocToDBO(replyFound, (replyFound as any)["post"]);
	}

	/**
	 * 댓글 수정
	 * @param reply 갱신할 댓글
	 */
	public async updateReply(reply: ReplyDBO): Promise<void> {
		const replyFound = await model.ReplyModel.findById(reply.getId()).exec();

		if (!replyFound) { throw new Error("not found"); }

		(replyFound as any)["reply_content"] = reply.getContent();

		const postFound = model.PostModel.findById(reply.getPostId());

		await replyFound.save();
	}

	/**
	 * 댓글 삭제
	 * @param reply 삭제할 댓글 id
	 */
	public async removeReply(replyId: string | number): Promise<void> {
		const replyFound = await model.ReplyModel.findById(replyId)
		.populate("post")
		.exec();
		
		if (!replyFound) { throw new Error("not found"); }

		const postFound = await model.PostModel.findById((replyFound as any)["post"]["_id"]);

		if (!postFound) {
			throw new Error("not found");
		}

		(postFound as any)["replies"].pull({_id: replyId});

		await replyFound.remove();
	}

	/**
	 * 파일 생성
	 * @param fileName { string } 파일명
	 * @param filePaht { string } 파일 경로
	 */
	public async createFile(fileName: string, filePath: string): Promise<FileDBO> {
		const newFile = new model.FileModel({
			filename: fileName,
			path: filePath,
		});

		const fileCreated = await newFile.save();

		return this.fileDocToDBO(fileCreated);
	}

	/**
	 * id로 파일 조회
	 * @param id 조회할 파일 id
	 */
	public async findFileById(id: string | number): Promise<FileDBO> {
		const fileFound = await model.FileModel.findById(id).exec();

		if (fileFound === null) { throw new Error("not found"); }

		return this.fileDocToDBO(fileFound);
	}

	/**
	 * id로 복수 파일 조회
	 * @param id 조회할 파일 id 배열
	 */
	public async findFilesById(id: string[] | number[]): Promise<FileDBO[]> {
		const oids: mongoose.Types.ObjectId[] = [];
		for (const strId of id) {
			oids.push(mongoose.Types.ObjectId(strId));
		}

		const result = await model.FileModel.find({
			_id: {
				$in: oids,
			}}).exec();

		return this.filesDocToDBO(result);
	}

	/**
	 * 파일 삭제
	 * @param file 삭제할 파일
	 */
	public async removeFile(file: FileDBO): Promise<void> {
		const fileFound = await model.FileModel.findById(file.getId()).exec();

		if (!fileFound) { throw new Error("not found"); }

		await fileFound.remove();
	}

	private roleDocToDBO(doc: mongoose.Document): RoleDBO {
		return new RoleDBO(
			(doc as any)["role_title"],
			doc._id);
	}

	private rolesDocToDBO(docs: mongoose.Document[]): RoleDBO[] {
		const roles = [];
		
		for (const r of docs) {
			roles.push(this.roleDocToDBO(r));
		}

		return roles;
	}

	/**
	 * user document를 DBO로 변환
	 * @param doc DBO로 변환할 user document, 
	 */
	private userDocToDBO(doc: mongoose.Document): UserDBO {
		return new UserDBO(
			(doc as any)["sid"],
			(doc as any)["name"],
			(doc as any)["password"],
			(doc as any)["salt"],
			(this.roleDocToDBO((doc as any)["role"])) as RoleDBO,
			doc._id);
	}

	private usersDocToDBO(docs: mongoose.Document[]): UserDBO[] {
		const users: UserDBO[] = [];
		for (const u of docs) {
			users.push(this.userDocToDBO(u) as UserDBO);
		}

		return users;
	}

	private boardDocToDBO = (doc: mongoose.Document): BoardDBO => {

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

	private postDocToDBO = (doc: mongoose.Document, includeReplies: boolean): PostDBO => {
		const da = doc as any;
		const post = new PostDBO(
			da["post_title"],
			da["post_content"],
			this.boardDocToDBO(da["board"]),
			this.filesDocToDBO(da["files_attached"]),
			this.userDocToDBO(da["author"]),
			da["date_created"],
			[],
			da["_id"],
		);
		if (includeReplies) { post.setReplies(this.repliesDocToDBO(da["replies"], post.getId())); }
		return post;
	}

	private postsDocToDBO(docs: mongoose.Document[], includeReplies: boolean): PostDBO[] {
		const dbos: PostDBO[] = [];
		for (const p of docs) {
			dbos.push(this.postDocToDBO(p, includeReplies));
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

	private replyDocToDBO(doc: mongoose.Document, postId: string | number): ReplyDBO {
		const da = doc as any;
		return new ReplyDBO(
			da["reply_content"],
			postId,
			this.userDocToDBO(da["author"]),
			da["date_created"],
			da["_id"],
		);
	}

	private repliesDocToDBO(docs: mongoose.Document[], postId: string | number): ReplyDBO[] {
		const replies: ReplyDBO[] = [];
		for (const r of docs) {
			replies.push(this.replyDocToDBO(r, postId));
		}

		return replies;
	}
}
