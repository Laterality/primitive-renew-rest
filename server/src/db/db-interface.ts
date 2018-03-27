import { RoleDBO } from "./role.dbo";
import { UserDBO } from "./user.dbo";

export interface IDatabase {

	/**
	 * 회원 생성
	 * @param newUser 생성할 회원
	 */
	createUser(newUser: UserDBO): Promise<UserDBO | null>;

	/**
	 * id로 회원을 조회
	 */
	findUserById(id: string): Promise<UserDBO | null>;

	/**
	 * 모든 회원을 조회
	 */
	findAllUser(): Promise<UserDBO[] | null>;

	/**
	 * 회원 검색
	 * @param keyword 검색 키워드(학번, 이름)
	 */
	searchUser(keyword: string): Promise<UserDBO | null>;
	
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
	createRole(role: RoleDBO): Promise<RoleDBO | null>;

	/**
	 * 
	 * @param id 조회할 role의 id
	 */
	findRoleById(id: string): Promise<RoleDBO | null>;

	/**
	 * 
	 * @param title 조회할 role의 role_title
	 */
	findRoleByTitle(title: string): Promise<RoleDBO[] | null>;

	/**
	 * 모든 role 조회
	 */
	findAllRole(): Promise<RoleDBO[] | null>;
}
