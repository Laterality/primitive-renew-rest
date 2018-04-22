/**
 * Error handler Interface
 * 
 * author: Jinwoo Shin
 * date: 2018-04-18
 */
export interface IErrorhandler {
	onError(err: Error): void;
}
