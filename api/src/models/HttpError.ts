import { NeedleResponse } from "../services/interfaces";

export class HttpError extends Error {
    public name: string;
    public statusCode: number;
    public body;

    constructor(response: NeedleResponse, ...params: Array<string>) {
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }

        this.name = "HttpError";
        // Custom debugging information
        this.statusCode = response.statusCode;
        this.body = response?.body;
    }
}
