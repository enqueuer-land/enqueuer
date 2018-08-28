import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
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
    private expressApp: any;

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
            this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) => {
                const payload = request.rawBody;
                Logger.debug(`${this.type}:${this.port} got hit (${request.method}) ${this.endpoint}: ${payload}`);
                if (!this.response.payload) {
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
                next();
            });
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            const secure = this.type == 'https-server';
            HttpServerPool.getInstance().getApp(this.port, secure, this.credentials)
                .then((app: any) => {
                    this.expressApp = app;
                    resolve();
                }).catch(err => reject(err));
        });
    }

    public unsubscribe() {
        HttpServerPool.getInstance().releaseApp(this.port);
    }

    public sendResponse(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.responseHandler) {
                try {
                    Logger.debug(`${this.type} sending response`);
                    this.responseHandler.status(this.response.status).send(this.response.payload);
                    Logger.trace(`${this.type} response sent`);
                    resolve();
                } catch (err) {
                    throw `${this.type} response back sending error: ${err}`;
                }

            } else {
                reject(`No ${this.type} response handler found`);
            }
        });
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