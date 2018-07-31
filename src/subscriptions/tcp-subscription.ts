import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import {VariablesController} from '../variables/variables-controller';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'tcp'})
export class TcpSubscription extends Subscription {

    private server: any;
    private response?: string;
    private port: number;
    private persistStreamName: string;
    private loadStreamName: string;
    private loadStream: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.persistStreamName = subscriptionAttributes.persistStreamName;
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
                this.server.on('connection', (stream: any) => {
                    this.waitForData(stream, reject, resolve);
                });
            }

        });
    }

    private waitForData(stream: any, reject: Function, resolve: Function) {
        stream.on('end', () => {
            reject();
        });

        stream.on('data', (msg: any) => {
            if (this.response) {
                stream.write(this.response, () => {
                    this.persistStream(stream);
                    resolve(msg.toString());
                });
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
                    resolve();
                });
        });
    }

    public unsubscribe(): void {
        if (this.server) {
            this.server.close();
        }
    }

    private persistStream(stream: any) {
        if (this.persistStreamName) {
            Logger.debug(`Persisting subscription stream ${this.persistStreamName}`);
            VariablesController.sessionVariables()[this.persistStreamName] = stream;
        } else {
            Logger.trace(`Ending TCP stream`);
            stream.end();
        }
    }

}