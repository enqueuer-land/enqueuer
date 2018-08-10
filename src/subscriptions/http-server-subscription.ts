import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {isNullOrUndefined} from 'util';
import {HttpServerPool} from '../pools/http-server-pool';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'http-server'
                                                        || subscriptionAttributes.type === 'https-server'})
export class HttpServerSubscription extends Subscription {

    private port: string;
    private endpoint: string;
    private method: string;
    private credentials?: string;
    private responseHandler?: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.credentials = subscriptionAttributes.credentials;
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.method = subscriptionAttributes.method.toLowerCase();
        this.response = subscriptionAttributes.response || {};
        this.response.status = this.response.status || 200;
        if (!this.response) {
            throw new Error(`Invalid ${this.type}: no 'response' field was given`);
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            HttpServerPool.getInstance().getApp()[this.method](this.endpoint, (request: any, responseHandler: any) => {
                const payload = request.rawBody;
                Logger.debug(`Http got hit (${request.method}) ${this.endpoint}: ${payload}`);
                if (isNullOrUndefined(this.response.payload)) {
                    this.response.payload = payload;
                }

                for (const key in this.response.header) {
                    responseHandler.header(key, this.response.header[key]);
                }

                this.responseHandler = responseHandler;
                const result = {
                    params: request.params,
                    query: request.query,
                    body: payload
                };

                resolve(result);
            });
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            let server = null;
            if (this.type == 'https-server') {
                server = HttpServerPool.getInstance().getHttpsServer(this.credentials);
            } else if (this.type == 'http-server') {
                server = HttpServerPool.getInstance().getHttpServer();
            } else {
                reject(`Http server type is not known: ${this.type}`);
                return;
            }
            server.on('error', (err: any) => {
                if (err) {
                    reject(`Error creating ${this.type} ${err}`);
                }
            });
            server.listen(this.port, (err: any) => {
                if (err) {
                    reject(`Error listening ${this.type} ${err}`);
                }
                resolve();
            });
        });
    }

    public unsubscribe() {
        if (this.type == 'https-server') {
            HttpServerPool.getInstance().closeHttpsServer();
        } else {
            HttpServerPool.getInstance().closeHttpServer();
        }
    }

    public sendResponse() {
        if (this.responseHandler) {
            Logger.debug(`${this.type} sending response`);
            this.responseHandler.status(this.response.status).send(this.response.payload);
        }
    }

}