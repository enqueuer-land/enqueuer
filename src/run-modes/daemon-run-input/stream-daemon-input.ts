import {DaemonInputRequisition} from './daemon-input-requisition';
import {HandlerListener} from '../../handlers/handler-listener';
import * as net from 'net';
import {RequisitionParser} from '../../requisition-runners/requisition-parser';
import {JavascriptObjectNotation} from '../../object-notations/javascript-object-notation';

//TODO test it
export class StreamDaemonInput {
    private handler: string | number;
    private server: net.Server;
    private parser: RequisitionParser;

    public constructor(handler: string | number) {
        this.handler = handler;
        this.parser = new RequisitionParser();
        this.server = net.createServer();
    }

    public subscribe(): Promise<void> {
        return new HandlerListener(this.server).listen(this.handler);
    }

    public receiveMessage(): Promise<DaemonInputRequisition> {
        return new Promise((resolve) => {
            this.server.on('connection', (stream: any) => {
                stream.on('data', (msg: any) => {
                    resolve({
                        type: 'stream',
                        input: this.parser.parse(this.stringifyPayloadReceived(msg.payload || msg)),
                        stream: stream
                    });
                });
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

    public cleanUp(): Promise<void> {
        return Promise.resolve();
    }

    public sendResponse(requisition: DaemonInputRequisition): Promise<void> {
        return new Promise((resolve, reject) => {
            if (requisition.stream) {
                const message = this.stringifyPayloadToSend(requisition.output);
                requisition.stream.write(message, () => {
                    requisition.stream.end();
                    requisition.stream = null;
                    resolve();
                });
            } else {
                const message = `No daemon response was sent because stream is null`;
                reject(message);
            }
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