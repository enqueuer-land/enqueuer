import {DaemonInputRequisition} from './daemon-input-requisition';
import {HandlerListener} from '../../handlers/handler-listener';
import * as net from 'net';
import {RequisitionParser} from '../../requisition-runners/requisition-parser';

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
                        input: this.parser.parse(this.adapt(msg)),
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

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        return new Promise((resolve, reject) => {
            if (message.stream) {
                const response = this.stringifyPayloadToSend(message.output);
                message.stream.write(response, () => {
                    message.stream.end();
                    message.stream = null;
                    resolve();
                });
            } else {
                const message = `No daemon response was sent because stream is null`;
                reject(message);
            }
        });
    }

    public adapt(message: any): string {
        const payload = message.payload;
        let stringify;
        if (payload) {
            stringify = this.stringifyPayloadReceived(payload);
        } else {
            stringify = this.stringifyPayloadReceived(message);
        }
        if (stringify) {
            return stringify;
        }
        throw 'Daemon input can not adapt received message';
    }

    private stringifyPayloadReceived(message: any): string | undefined {
        const messageType = typeof(message);
        if (messageType == 'string') {
            return message;
        } else if (Buffer.isBuffer(message)) {
            return Buffer.from(message).toString();
        }
    }

    private stringifyPayloadToSend(payload: any): string | Buffer {
        if (typeof(payload) != 'string' && !Buffer.isBuffer(payload)) {
            return JSON.stringify(payload);
        }
        return payload;
    }
}