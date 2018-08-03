import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import {VariablesController} from '../variables/variables-controller';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'tcp-server'})
export class TcpServerSubscription extends Subscription {

    private server: any;
    private response?: string;
    private port: number;
    private persistStreamName?: string;
    private loadStreamName: string;
    private loadStream: any;
    private greetingResponse: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.persistStreamName = subscriptionAttributes.persistStreamName;
        this.greetingResponse = subscriptionAttributes.greetingResponse;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        } else {
            this.response = subscriptionAttributes.response;
        }
        this.loadStreamName = subscriptionAttributes.loadStreamName;
        if (subscriptionAttributes.loadStreamName) {
            Logger.debug(`Loading tcp client: ${this.loadStreamName}`);
            this.loadStream = VariablesController.sessionVariables()[subscriptionAttributes.loadStreamName];
        }
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.loadStreamName) {
                if (!this.loadStream ) {
                    reject(`There is no tcp stream able to be loaded named ${this.loadStreamName}`);
                    return;
                }
                this.waitForData(this.loadStream, reject, resolve);
            } else {
                this.server.once('connection', (stream: any) => this.gotConnection(stream, reject, resolve));
            }

        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.loadStreamName) {
                if (!this.loadStream ) {
                    reject(`There is no tcp stream able to be loaded named ${this.loadStreamName}`);
                }
                resolve();
                return;
            }

            this.server = net.createServer()
                .listen(this.port, 'localhost', () => {
                    Logger.debug(`Tcp server is listening for tcp clients`);
                    resolve();
                });
        });
    }

    public unsubscribe(): void {
        if (this.server) {
            this.server.close();
        }
    }

    private gotConnection(stream: any, reject: any, resolve: any) {
        Logger.debug(`Tcp server got a client`);
        if (this.greetingResponse) {
            Logger.debug(`Tcp server sending greeting message`);
            stream.write(this.greetingResponse);
        }
        this.waitForData(stream, reject, resolve);
    }

    private waitForData(stream: any, reject: Function, resolve: Function) {
        Logger.trace(`Tcp server is waiting on data`);
        stream.once('end', () => {
            Logger.debug(`Tcp server detected 'end' event`);
            reject();
        });

        stream.once('data', (msg: any) => {
            Logger.debug(`Tcp server got data ${msg.toString()}`);
            if (this.response) {
                Logger.debug(`Tcp server sending response`);
                stream.write(this.response, () => this.persistStream(stream, resolve, msg));
            } else {
                this.persistStream(stream, resolve, msg);
                resolve(msg.toString());
            }
        });

    }

    private persistStream(stream: any, resolve: Function, msg: any) {
        if (this.persistStreamName) {
            Logger.debug(`Persisting subscription stream ${this.persistStreamName}`);
            VariablesController.sessionVariables()[this.persistStreamName] = stream;
            this.persistStreamName = undefined;
        } else {
            Logger.trace(`Ending TCP stream`);
            stream.end();
        }
        resolve(msg.toString());
    }

}