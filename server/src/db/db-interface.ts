import { UserDBO } from "./user.dbo";

export interface IDB {

	/**
	 * 회원 생성
	 * @param newUser 생성할 회원
	 */
	createUser(newUser: UserDBO): UserDBO;

	/**
	 * id로 회원을 조회
	 */
	findUserById(id: string): UserDBO;

	/**
	 * 모든 회원을 조회
	 */
	findAllUser(): UserDBO[];

	/**
	 * 회원 검색
	 * @param keyword 검색 키워드(학번, 이름)
	 */
	searchUser(keyword: string): UserDBO;
	
	/**
	 * 회원의 현재 상태를 DB에 반영
	 * 
	 * @param user 갱신할 회원
	 */
	updateUser(user: UserDBO): void;

	/**
	 * 회원 정보를 삭제
	 * @param user 삭제할 회원
	 */
	removeUser(user: UserDBO): void;
}
