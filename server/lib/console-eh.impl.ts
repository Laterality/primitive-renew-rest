/**
 * Console error handler implementation
 * 
 * author: Jinwoo Shin
 * date: 2018-04-18
 */
import { IErrorhandler } from "./error-handler.interface";

export class ConsoleErrorHandler implements IErrorhandler {

	public onError(err: Error) {
		console.log(err);
	}
}
