import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {HttpServerPool} from '../pools/http-server-pool';
import {TestModel} from '../models/outputs/test-model';
import {HttpAuthentication} from '../http-authentications/http-authentication';
import {HttpRequester} from '../publishers/http-requester';

@Injectable({
    predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'http-proxy' ||
                                                subscriptionAttributes.type === 'https-proxy' ||
                                                subscriptionAttributes.type === 'http-server' ||
                                                subscriptionAttributes.type === 'https-server'
})
export class HttpSubscription extends Subscription {

    private authentication: any;
    private port: number;
    private endpoint: string;
    private method: string;
    private credentials?: string;
    private responseToClientHandler?: any;
    private redirect: string;
    private secureServer: boolean;
    private expressApp: any;
    private proxy: boolean;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.credentials = subscriptionAttributes.credentials;
        this.authentication = subscriptionAttributes.authentication;
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.redirect = subscriptionAttributes.redirect;
        this.secureServer = this.isSecureServer();
        this.proxy = this.isProxyServer();
        this.method = subscriptionAttributes.method.toLowerCase();
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            HttpServerPool.getInstance().getApp(this.port, this.secureServer, this.credentials)
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
        if (this.responseToClientHandler) {
            try {
                Logger.trace(`${this.type} sending response: ${JSON.stringify(this.response, null, 2)}`);
                this.responseToClientHandler.status(this.response.status).send(this.response.payload);
                Logger.debug(`${this.type} response sent`);
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(`${this.type} response back sending error: ${err}`);
            }
        } else {
            return Promise.reject(`No ${this.type} response handler found`);
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

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.proxy) {
                this.proxyServerMessageReceiving(resolve, reject);
            } else {
                this.realServerMessageReceiving(resolve);
            }
        });
    }

    private realServerMessageReceiving(resolve: any) {
        this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) => {
            Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${request.rawBody}`);
            for (const key in this.response.header) {
                responseHandler.header(key, this.response.header[key]);
            }

            this.responseToClientHandler = responseHandler;
            resolve(this.createMessageReceivedStructure(request));
            next();
        });
    }

    private proxyServerMessageReceiving(resolve: any, reject: any) {
        this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) => {
            this.responseToClientHandler = responseHandler;
            Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${request.rawBody}`);
            this.redirectCall(request)
                .then((redirectionResponse: any) => {
                    Logger.trace(`${this.type}:${this.port} got redirection response: ${JSON.stringify(redirectionResponse, null, 2)}`);
                    this.response = {
                        status: redirectionResponse.statusCode,
                        payload: redirectionResponse.body,
                    };
                    resolve(this.createMessageReceivedStructure(request));
                    next();
                })
                .catch(err => {
                    reject(err);
                    next();
                });

        });
    }

    private createMessageReceivedStructure(message: any): any {
        const payload = message.rawBody;
        const headers: any = message.headers;
        return {
            headers,
            params: message.params,
            query: message.query,
            body: payload
        };
    }

    private redirectCall(originalRequisition: any): Promise<void> {
        const url = this.redirect + originalRequisition.url;
        Logger.info(`Redirecting call from ${this.endpoint} (${this.port}) to ${url}`);
        return new Promise((resolve, reject) => {
            new HttpRequester(url,
                    this.method.toLowerCase(),
                    originalRequisition.headers,
                    originalRequisition.rawBody)
                .request()
                .then((response: any) => resolve(response))
                .catch(err => reject(err));
        });
    }

    private isSecureServer(): boolean {
        if (this.type) {
            if (this.type.indexOf('https') != -1) {
                return true;
            } else if (this.type.indexOf('http') != -1) {
                return false;
            }
        }
        throw `Http server type is not known: ${this.type}`;
    }

    private isProxyServer(): boolean {
        if (this.type) {
            return this.type.indexOf('proxy') != -1;
        }
        throw `Http server type is not known: ${this.type}`;
    }
}