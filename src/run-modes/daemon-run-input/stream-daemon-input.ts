import {HandlerListener} from '../../handlers/handler-listener';
import * as net from 'net';
import {JavascriptObjectNotation} from '../../object-notations/javascript-object-notation';
import {RequisitionModel} from '../../models/inputs/requisition-model';

//TODO test it
export class StreamDaemonInput {
    private handler: string | number;
    private server: net.Server;
    private stream: any;

    public constructor(handler: string | number) {
        this.handler = handler;
        this.server = net.createServer();
    }

    public subscribe(): Promise<void> {
        return new HandlerListener(this.server).listen(this.handler);
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve) => {
            this.server.on('connection', (stream: any) => {
                this.stream = stream;
                stream.on('data', (msg: any) => resolve(this.stringifyPayloadReceived(msg.payload || msg)));
            });
        });
    }

    public unsubscribe(): Promise<void> {
        if (this.server) {
            this.server.close();
            delete this.server;
        }
        return Promise.resolve();
    }

    public sendResponse(message: any): Promise<void> {
        return new Promise((resolve) => {
            const strMsg = this.stringifyPayloadToSend(message);
            this.stream.write(strMsg, () => {
                this.stream.end();
                this.stream = null;
                resolve();
            });
        });
    }

    private stringifyPayloadReceived(message: string | Buffer): string {
        const messageType = typeof(message);
        if (messageType == 'string') {
            return message as string;
        }
        return Buffer.from(message as Buffer).toString();
    }

    private stringifyPayloadToSend(payload: any): string | Buffer {
        if (typeof(payload) == 'string' || Buffer.isBuffer(payload)) {
            return payload;
        }
        return new JavascriptObjectNotation().stringify(payload) as string;
    }
}