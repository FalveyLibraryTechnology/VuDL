import { IncomingMessage } from "http";

export interface NeedleResponse extends IncomingMessage {
    body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    raw: Buffer;
    bytes: number;
}
