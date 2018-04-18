import { IErrorhandler } from "./error-handler.interface";

export class ConsoleErrorHandler implements IErrorhandler {

	public onError(err: Error) {
		console.log(err);
	}
}
