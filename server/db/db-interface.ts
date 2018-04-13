/**
 * Database interface for database layer abstraction
 * 
 * author: Jin-woo Shin
 * date: 2018-03-29
 */
import { BoardDBO } from "./board.dbo";
import { FileDBO } from "./file.dbo";
import { PostDBO } from "./post.dbo";
import { ReplyDBO } from "./reply.dbo";
import { RoleDBO } from "./role.dbo";
import { UserDBO } from "./user.dbo";

export interface IDatabase {

	/**
	 * 회원 생성
	 * @param newUser 생성할 회원
	 */
	createUser(newUser: UserDBO): Promise<UserDBO>;

	/**
	 * id로 회원을 조회
	 */
	findUserById(id: string | number): Promise<UserDBO>;

	/**
	 * sid로 회원을 조회
	 * @param sid 
	 */
	findUserBySID(sid: string): Promise<UserDBO>;

	/**
	 * 모든 회원을 조회
	 */
	findAllUser(): Promise<UserDBO[]>;

	/**
	 * 회원 검색
	 * @param keyword 검색 키워드(학번, 이름)
	 */
	searchUser(keyword: string, roleIds: string[]): Promise<UserDBO[]>;
	
	/**
	 * 회원의 현재 상태를 DB에 반영
	 * 
	 * @param user 갱신할 회원
	 */
	updateUser(user: UserDBO): Promise<void>;

	/**
	 * 회원 정보를 삭제
	 * @param user 삭제할 회원
	 */
	removeUser(user: UserDBO): Promise<void>;

	/**
	 * 역할 생성
	 * @param role 생성할 역할
	 */
	createRole(role: RoleDBO): Promise<RoleDBO>;

	/**
	 * 
	 * @param id 조회할 role의 id
	 */
	findRoleById(id: string): Promise<RoleDBO>;

	/**
	 * 
	 * @param title 조회할 role의 role_title
	 */
	findRoleByTitle(title: string): Promise<RoleDBO>;

	/**
	 * 모든 role 조회
	 */
	findAllRole(): Promise<RoleDBO[]>;

	/**
	 * 게시판 생성
	 * @param newBoard 생성할 게시판
	 */
	createBoard(newBoard: BoardDBO): Promise<BoardDBO>;

	/**
	 * id로 게시판 조회
	 * @param id 조회할 게시판 id
	 */
	findBoardById(id: string | number): Promise<BoardDBO>;

	/**
	 * 게시판명으로 게시판 조회
	 * @param title 조회할 게시판명
	 */
	findBoardByTitle(title: string): Promise<BoardDBO | null>;

	/**
	 * 모든 게시판 목록
	 */
	findAllBoards(): Promise<BoardDBO[]>;

	/**
	 * 게시판 갱신
	 * @param board 갱신할 게시판
	 */
	updateBoard(board: BoardDBO): Promise<void>;

	/**
	 * 게시판 삭제
	 * @param board 삭제할 게시판
	 */
	removeBoard(board: BoardDBO): Promise<void>;

	/**
	 * 게시물 생성
	 * @param post 생성할 게시물
	 */
	createPost(post: PostDBO): Promise<PostDBO>;

	/**
	 * 게시물 조회
	 * @param id 게시물 id
	 */
	findPostById(id: string | number): Promise<PostDBO>;

	/**
	 * 게시판 별 게시물 조회
	 * @param boardId 게시판 id
	 * @param year 작성 연도
	 * @param page 조회할 페이지 번호
	 * @param limit 페이지 당 게시물 수
	 */
	findPostsByBoard(boardId: string | number, year: number, page: number, limit: number): Promise<PostDBO[]>;
	
	/**
	 * 게시물 갱신
	 * @param board 갱신될 게시물
	 */
	updatePost(post: PostDBO): Promise<void>;

	/**
	 * 게시물 삭제
	 * @param board 삭제할 게시물
	 */
	removePost(board: BoardDBO): Promise<void>;

	/**
	 * 댓글 생성
	 * @param reply 생성할 댓글
	 */
	createReply(reply: ReplyDBO): Promise<ReplyDBO>;

	/**
	 * 댓글 조회
	 * @param id 조회할 댓글 id
	 */
	findReplyById(id: string | number): Promise<ReplyDBO>;

	/**
	 * 댓글 수정
	 * @param reply 갱신할 댓글
	 */
	updateReply(reply: ReplyDBO): Promise<void>;

	/**
	 * 댓글 삭제
	 * @param reply 삭제할 댓글
	 */
	removeReply(reply: ReplyDBO): Promise<void>;

	/**
	 * 파일 생성
	 * @param file 생성할 파일
	 */
	createFile(file: FileDBO): Promise<FileDBO>;

	/**
	 * id로 파일 조회
	 * @param id 조회할 파일 id
	 */
	findFileById(id: string | number): Promise<FileDBO>;

	/**
	 * id로 복수 파일 조회
	 * @param id 조회할 파일 id 배열
	 */
	findFilesById(id: string[] | number[]): Promise<FileDBO[]>;

	/**
	 * 파일 삭제
	 * TODO: 더이상 사용되지 않는 파일은 서버에서 제거하도록 해야 함
	 * @param file 삭제할 파일
	 */
	removeFile(file: FileDBO): Promise<void>;
}
