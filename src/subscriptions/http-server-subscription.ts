import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {isNullOrUndefined} from 'util';
import {HttpServerPool} from '../pools/http-server-pool';
import {TestModel} from '../models/outputs/test-model';
import {HttpAuthentication} from '../http-authentications/http-authentication';

@Injectable({
    predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'http-server'
        || subscriptionAttributes.type === 'https-server'
})
export class HttpServerSubscription extends Subscription {

    private authentication: any;
    private port: number;
    private endpoint: string;
    private method: string;
    private credentials?: string;
    private responseHandler?: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.credentials = subscriptionAttributes.credentials;
        this.authentication = subscriptionAttributes.authentication;
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

                let headers: any = {};
                Object.keys(request.headers)
                    .forEach((header: string) => headers[header] = request.headers[header]);

                this.responseHandler = responseHandler;
                const result = {
                    headers,
                    params: request.params,
                    query: request.query,
                    body: payload
                };

                resolve(result);
            });
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.type == 'https-server') {
                HttpServerPool.getInstance().getHttpsServer(this.credentials, this.port)
                    .then(() => resolve());
            } else if (this.type == 'http-server') {
                HttpServerPool.getInstance().getHttpServer(this.port)
                    .then(() => resolve());
            } else {
                return reject(`Http server type is not known: ${this.type}`);
            }
        });
    }

    public unsubscribe() {
        if (this.type == 'https-server') {
            HttpServerPool.getInstance().closeHttpsServer(this.port);
        } else {
            HttpServerPool.getInstance().closeHttpServer(this.port);
        }
    }

    public async sendResponse(): Promise<void> {
        if (this.responseHandler) {
            Logger.debug(`${this.type} sending response`);
            this.responseHandler.status(this.response.status).send(this.response.payload);
        }
    }

    public onMessageReceivedTests(): TestModel[] {
        if (this.authentication && this.messageReceived) {
            Logger.debug(`${this.type} authenticating message with ${JSON.stringify(Object.keys(this.authentication))}`);
            const verifier = Container.subclassesOf(HttpAuthentication).create(this.authentication);
            return verifier.verify(this.messageReceived.headers.authorization);
        }
        return [];
    }
}