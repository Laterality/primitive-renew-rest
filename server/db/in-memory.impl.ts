import { IDatabase } from "./db-interface";

import { BoardDBO } from "./board.dbo";
import { FileDBO } from "./file.dbo";
import { PostDBO } from "./post.dbo";
import { ReplyDBO } from "./reply.dbo";
import { RoleDBO } from "./role.dbo";
import { UserDBO } from "./user.dbo";

export class InMemoryDB implements IDatabase {

	private users: UserDBO[];
	private roles: RoleDBO[];
	private boards: BoardDBO[];
	private posts: PostDBO[];
	private replies: ReplyDBO[];
	private files: FileDBO[];

	private userIdNxt = 1;
	private roleIdNxt = 1;
	private boardIdNxt = 1;
	private postIdNxt = 1;
	private replyIdNxt = 1;
	private fileIdNxt = 1;

	public constructor() {
		this.users = [];
		this.roles = [];
		this.boards = [];
		this.posts = [];
		this.replies = [];
		this.files = [];
	}

	/**
	 * 회원 생성
	 * @param newUser 생성할 회원
	 */
	public async createUser(newUser: UserDBO): Promise<UserDBO> {
		const user = new UserDBO(
			newUser.getSID(),
			newUser.getName(),
			newUser.getPassword(),
			newUser.getSalt(),
			newUser.getRole(),
			this.userIdNxt++,
		);
		this.users.push(user);

		return Promise.resolve(user);
	}

	/**
	 * id로 회원을 조회
	 */
	public async findUserById(id: string | number): Promise<UserDBO> {
		const found = this.users.find((value: UserDBO, index: number) => {
			return value.getId() === id;
		});

		if (!found) {
			throw new Error("not found");
		}

		return Promise.resolve(found);
	}

	/**
	 * sid로 회원을 조회
	 * @param sid 
	 */
	public async findUserBySID(sid: string): Promise<UserDBO> {
		const found = this.users.find((value: UserDBO, index: number) => {
			return value.getSID() === sid;
		});

		if (!found) {
			throw new Error("not found");
		}

		return Promise.resolve(found);
	}

	/**
	 * 모든 회원을 조회
	 */
	public async findAllUser(): Promise<UserDBO[]> {
		const users = this.users.slice();

		return Promise.resolve(users);
	}

	/**
	 * 회원 검색
	 * @param keyword 검색 키워드(학번, 이름)
	 */
	public async searchUser(keyword: string, roleIds: string[]): Promise<UserDBO[]> {
		// not implemented
		return Promise.resolve([]);
	}
	
	/**
	 * 회원의 현재 상태를 DB에 반영
	 * 
	 * @param user 갱신할 회원
	 */
	public async updateUser(user: UserDBO): Promise<void> {
		const idxFound = this.users.findIndex((value: UserDBO, index: number) => {
			return value.getId() === user.getId();
		});
		if (idxFound === -1) { throw new Error("not found"); }

		this.users[idxFound] = user;
		return Promise.resolve();
	}

	/**
	 * 회원 정보를 삭제
	 * @param user 삭제할 회원
	 */
	public async removeUser(user: UserDBO): Promise<void> {
		const idxFound = this.users.findIndex((value: UserDBO, index: number) => {
			return value.getId() === user.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.users.splice(idxFound, 1);

		return Promise.resolve();
	}

	/**
	 * 역할 생성
	 * @param role 생성할 역할
	 */
	public async createRole(role: RoleDBO): Promise<RoleDBO> {
		const newRole = new RoleDBO(role.getTitle(), this.roleIdNxt++);
		this.roles.push(newRole);

		return Promise.resolve(newRole);
	}

	/**
	 * 
	 * @param id 조회할 role의 id
	 */
	public async findRoleById(id: string): Promise<RoleDBO> {
		const found = this.roles.find((value: RoleDBO, index: number) => {
			return value.getId() === id;
		});

		if (!found) { throw new Error("not found"); }

		return Promise.resolve(found);
	}

	/**
	 * 
	 * @param title 조회할 role의 role_title
	 */
	public async findRoleByTitle(title: string): Promise<RoleDBO> {
		const found = this.roles.find((value: RoleDBO) => {
			return value.getTitle() === title;
		});

		if (!found) { throw new Error("not found"); }

		return Promise.resolve(found);
	}

	/**
	 * 모든 role 조회
	 */
	public async findAllRole(): Promise<RoleDBO[]> {
		const roles = this.roles.slice();

		return roles;
	}

	/**
	 * 게시판 생성
	 * @param newBoard 생성할 게시판
	 */
	public async createBoard(newBoard: BoardDBO): Promise<BoardDBO> {
		const board = new BoardDBO(
			newBoard.getTitle(),
			newBoard.getRolesReadable(),
			newBoard.getRolesWritable(),
			this.boardIdNxt++,
		);
		this.boards.push(board);

		return Promise.resolve(board);
	}

	/**
	 * id로 게시판 조회
	 * @param id 조회할 게시판 id
	 */
	public async findBoardById(id: string | number): Promise<BoardDBO> {
		const board = this.boards.find((value: BoardDBO) => {
			return value.getId() === id;
		});

		if (!board) { throw new Error("not found"); }

		return Promise.resolve(board);
	}

	/**
	 * 게시판명으로 게시판 조회
	 * @param title 조회할 게시판명
	 */
	public async findBoardByTitle(title: string): Promise<BoardDBO | null> {
		const found = this.boards.find((value: BoardDBO) => {
			return value.getTitle() === title;
		});

		if (!found) { throw new Error("not found"); }

		return Promise.resolve(found);
	}

	/**
	 * 모든 게시판 목록
	 */
	public async findAllBoards(): Promise<BoardDBO[]> {
		const boards = this.boards.slice();

		return Promise.resolve(boards);
	}

	/**
	 * 게시판 갱신
	 * @param board 갱신할 게시판
	 */
	public async updateBoard(board: BoardDBO): Promise<void> {
		const idxFound = this.boards.findIndex((value: BoardDBO) => {
			return value.getId() === board.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		return Promise.resolve();
	}

	/**
	 * 게시판 삭제
	 * @param board 삭제할 게시판
	 */
	public async removeBoard(board: BoardDBO): Promise<void> {
		const idxFound = this.boards.findIndex((value: BoardDBO) => {
			return value.getId() === board.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.boards.splice(idxFound, 1);

		return Promise.resolve();
	}

	/**
	 * 게시물 생성
	 * @param post 생성할 게시물
	 */
	public async createPost(post: PostDBO): Promise<PostDBO> {
		const newPost = new PostDBO(
			post.getTitle(),
			post.getContent(),
			post.getBoard(),
			post.getFiles(),
			post.getAuthor(),
			post.getDateCreated(),
			post.getReplies(),
			this.postIdNxt++,
		);

		this.posts.push(newPost);

		return Promise.resolve(newPost);
	}

	/**
	 * 게시물 조회
	 * @param id 게시물 id
	 */
	public async findPostById(id: string | number): Promise<PostDBO> {
		const found = this.posts.find((value: PostDBO) => {
			return value.getId() === id;
		});

		if (!found) { throw new Error("not found"); }

		return Promise.resolve(found);
	}

	/**
	 * 게시판 별 게시물 조회
	 * @param boardId 게시판 id
	 * @param year 작성 연도
	 * @param page 조회할 페이지 번호
	 * @param limit 페이지 당 게시물 수
	 */
	public async findPostsByBoard(boardId: string | number, year: number, page: number, limit: number): Promise<PostDBO[]> {
		// limit와 boardId 조건만 적용
		const postsOnBoard = [];
		for (const p of this.posts) {
			if (p.getBoard().getId() === boardId) {
				postsOnBoard.push(p);
			}
		}

		return Promise.resolve(postsOnBoard.slice(0, limit - 1));
	}
	
	/**
	 * 게시물 갱신
	 * @param board 갱신될 게시물
	 */
	public async updatePost(post: PostDBO): Promise<void> {
		const idxFound = this.posts.findIndex((value: PostDBO) => {
			return value.getId() === post.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.posts[idxFound] = post;

		return Promise.resolve();
	}

	/**
	 * 게시물 삭제
	 * @param post 삭제할 게시물
	 */
	public async removePost(post: PostDBO): Promise<void> {
		// 댓글은 삭제 안함
		const idxFound = this.posts.findIndex((value: PostDBO) => {
			return value.getId() === post.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.posts.splice(idxFound, 1);

		return Promise.resolve();
	}

	/**
	 * 댓글 생성
	 * @param reply 생성할 댓글
	 */
	public async createReply(reply: ReplyDBO): Promise<ReplyDBO> {
		const post = this.posts.find((value: PostDBO) => {
			return value.getId() === reply.getPost().getId();
		});
		
		if (!post) { throw new Error("not found"); }
		const newReply = new ReplyDBO(
			reply.getContent(),
			reply.getPost(),
			reply.getAuthor(),
			reply.getDateCreated(),
			this.replyIdNxt++,
		);
		post.getReplies().push(newReply);
		this.replies.push(newReply);

		return Promise.resolve(newReply);
	}

	/**
	 * 댓글 조회
	 * @param id 조회할 댓글 id
	 */
	public async findReplyById(id: string | number): Promise<ReplyDBO> {
		const found = this.replies.find((value: ReplyDBO) => {
			return value.getId() === id;
		});

		if (!found) { throw new Error("not found"); }

		return Promise.resolve(found);
	}

	/**
	 * 댓글 수정
	 * @param reply 갱신할 댓글
	 */
	public async updateReply(reply: ReplyDBO): Promise<void> {
		const idxFound = this.replies.findIndex((value: ReplyDBO) => {
			return value.getId() === reply.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.replies[idxFound] = reply;

		return Promise.resolve();
	}

	/**
	 * 댓글 삭제
	 * @param reply 삭제할 댓글
	 */
	public async removeReply(reply: ReplyDBO): Promise<void> {
		const idxFound = this.replies.findIndex((value: ReplyDBO) => {
			return value.getId() === reply.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.replies.splice(idxFound, 1);

		return Promise.resolve();
	}

	/**
	 * 파일 생성
	 * @param file 생성할 파일
	 */
	public async createFile(file: FileDBO): Promise<FileDBO> {
		const newFile = new FileDBO(file.getFilename(), file.getPath(), this.fileIdNxt++);

		this.files.push(newFile);

		return Promise.resolve(newFile);
	}

	/**
	 * id로 파일 조회
	 * @param id 조회할 파일 id
	 */
	public async findFileById(id: string | number): Promise<FileDBO> {
		const found = this.files.find((value: FileDBO) => {
			return value.getId() === id;
		});

		if (!found) { throw new Error("not found"); }

		return Promise.resolve(found);
	}

	/**
	 * id로 복수 파일 조회
	 * @param id 조회할 파일 id 배열
	 */
	public async findFilesById(id: string[] | number[]): Promise<FileDBO[]> {
		const founds: FileDBO[] = [];
		for (const i of id) {
			for (const f of this.files) {
				const found = this.files.find((value: FileDBO) => {
					return value.getId() === i;
				});
				if (!found) { throw new Error("not found"); }
				founds.push(found);
			}
		}

		return Promise.resolve(founds);
	}

	/**
	 * 파일 삭제
	 * TODO: 더이상 사용되지 않는 파일은 서버에서 제거하도록 해야 함
	 * @param file 삭제할 파일
	 */
	public async removeFile(file: FileDBO): Promise<void> {
		const idxFound = this.files.findIndex((value: FileDBO) => {
			return file.getId() === file.getId();
		});

		if (idxFound === -1) { throw new Error("not found"); }

		this.files.splice(idxFound, 1);

		return Promise.resolve();
	}

}
