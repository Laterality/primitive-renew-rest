/**
 * Authentication helper
 * 
 * author: Jinwoo Shin
 * date: 2018-03-26
 */
import * as bcrypt from "bcrypt-nodejs";

// tuple with hashed password and salt
export type authInfo = [string, string];

export async function encryption(raw: string, salt = bcrypt.genSaltSync(10)): Promise<authInfo> {
	const pwHashed = bcrypt.hashSync(raw, salt);
	return [pwHashed, salt];
}
