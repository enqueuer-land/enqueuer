import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {HandlerListener} from '../../handlers/handler-listener';
import * as net from 'net';
import * as fs from 'fs';
import {RequisitionParser} from '../../requisition-runners/requisition-parser';

@Injectable({predicate: (daemonInput: any) => daemonInput.type == 'uds'})
export class UdsDaemonInput extends DaemonInput {
    private path: string;
    private server?: net.Server;
    private type: string;
    private parser: RequisitionParser;

    public constructor(daemonInput: any) {
        super();
        this.type = daemonInput.type;
        this.path = daemonInput.path;
        this.parser = new RequisitionParser();

        Logger.trace(`Instantiating UdsDaemonInput`);
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(this.path, () => {
                this.server = net.createServer();
                new HandlerListener(this.server)
                    .listen(this.path)
                    .then(() => {
                        Logger.debug(`Uds server is listening for uds clients on ${this.path}`);
                        resolve();
                    })
                    .catch(err => {
                        const message = `Uds server could not listen to ${this.path}: ${err}`;
                        Logger.error(message);
                        reject(message);
                    });
            });
        });
    }

    public receiveMessage(): Promise<DaemonInputRequisition> {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.on('connection', (stream: any) => {
                    stream.on('data', (msg: any) => {
                        Logger.debug(`Uds server got data`);
                        let result: any = {
                            type: this.type,
                            daemon: this,
                            input: this.parser.parse(this.adapt(msg)),
                            stream: stream
                        };
                        resolve(result);
                    });
                });
            } else {
                reject(`No Uds daemon server found able to receive message`);
            }
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
                Logger.debug(`Uds daemon server sending response`);
                const response = this.stringifyPayloadToSend(message.output);
                message.stream.write(response, () => {
                    Logger.debug(`Uds daemon server response sent`);
                    message.stream.end();
                    message.stream = null;
                    resolve();
                });
            } else {
                const message = `No uds daemon response was sent because uds stream is null`;
                Logger.warning(message);
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
        throw 'Uds daemon input can not adapt received message';
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