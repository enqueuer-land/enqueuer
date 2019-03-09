import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {HttpContainerPool} from '../pools/http-container-pool';
import {TestModel} from '../models/outputs/test-model';
import {HttpRequester} from '../pools/http-requester';
import {MainInstance} from '../plugins/main-instance';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';
import {HttpAuthenticationFactory} from '../http-authentications/http-authentication-factory';

class HttpSubscription extends Subscription {

    private readonly proxy: boolean;
    private responseToClientHandler?: any;
    private secureServer: boolean;
    private expressApp: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.type = this.type.toLowerCase();
        this.secureServer = this.isSecureServer();
        this.proxy = this.isProxyServer();
        this.method = subscriptionAttributes.method.toLowerCase();
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            HttpContainerPool.getApp(this.port, this.secureServer, this.credentials)
                .then((app: any) => {
                    this.expressApp = app;
                    resolve();
                }).catch(err => {
                const message = `Error in ${this.type} subscription: ${err}`;
                Logger.error(message);
                reject(message);
            });
        });
    }

    public unsubscribe(): Promise<void> {
        return HttpContainerPool.releaseApp(this.port);
    }

    public sendResponse(): Promise<void> {
        Logger.trace(`${this.type} sending response: ${JSON.stringify(this.response)}`);
        try {
            Object.keys(this.response.headers || {}).forEach(key => {
                this.responseToClientHandler.header(key, this.response.headers[key]);
            });
            this.responseToClientHandler.status(this.response.status).send(this.response.payload);
            Logger.debug(`${this.type} response sent`);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(`${this.type} response back sending error: ${err}`);
        }
    }

    public onMessageReceivedTests(): TestModel[] {
        if (this.authentication && this.messageReceived) {
            Logger.debug(`${this.type} authenticating message with ${JSON.stringify(Object.keys(this.authentication), null, 2)}`);
            const verifier = new HttpAuthenticationFactory().create(this.authentication);
            return verifier.verify(this.messageReceived.headers.authorization);
        }
        return [];
    }

    public receiveMessage(): Promise<any> {
        if (this.proxy) {
            return this.proxyServerMessageReceiving();
        } else {
            return this.realServerMessageReceiving();
        }
    }

    private realServerMessageReceiving() {
        return new Promise((resolve) => {
            this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) => {
                Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${request.rawBody}`);
                this.responseToClientHandler = responseHandler;
                resolve(this.createMessageReceivedStructure(request));
            });
        });
    }

    private proxyServerMessageReceiving() {
        return new Promise((resolve, reject) => {
            this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) => {
                this.responseToClientHandler = responseHandler;
                Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${request.rawBody}`);
                this.redirectCall(request)
                    .then((redirectionResponse: any) => {
                        Logger.trace(`${this.type}:${this.port} got redirection response: ` +
                            `${JSON.stringify(redirectionResponse, null, 2)}`);
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
        });
    }

    private createMessageReceivedStructure(message: any): any {
        return {
            headers: message.headers,
            params: message.params,
            query: message.query,
            body: message.rawBody
        };
    }

    private redirectCall(originalRequisition: any): Promise<void> {
        const url = this.redirect + originalRequisition.url;
        Logger.info(`Redirecting call from ${this.endpoint} (${this.port}) to ${url}`);
        return new Promise((resolve, reject) => {
            new HttpRequester(url,
                this.method.toLowerCase(),
                originalRequisition.headers,
                originalRequisition.rawBody,
                this.timeout)
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

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new SubscriptionProtocol('http',
        (subscriptionModel: SubscriptionModel) => new HttpSubscription(subscriptionModel),
        ['headers',
            'params',
            'query',
            'body'])
        .addAlternativeName('https', 'http-proxy', 'https-proxy', 'http-server', 'https-server')
        .setLibrary('express');

    mainInstance.protocolManager.addProtocol(protocol);
}
