import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {HttpServerPool} from '../pools/http-server-pool';
import {TestModel} from '../models/outputs/test-model';
import {HttpAuthentication} from '../http-authentications/http-authentication';
import request from 'request';

@Injectable({
    predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'http-proxy'
        || subscriptionAttributes.type === 'https-proxy'
})
export class HttpProxySubscription extends Subscription {

    private authentication: any;
    private port: number;
    private endpoint: string;
    private method: string;
    private credentials?: string;
    private responseHandler?: any;
    private redirect: string;
    private secureServer: boolean;
    private app: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.credentials = subscriptionAttributes.credentials;
        this.authentication = subscriptionAttributes.authentication;
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.redirect = subscriptionAttributes.redirect;
        this.secureServer = this.isSecureServer();
        this.method = subscriptionAttributes.method.toLowerCase();
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.app[this.method](this.endpoint, (request: any, response: any, next: any) => {
                const payload = request.rawBody;
                Logger.debug(`${this.type}:${this.port} got hit (${request.method}) ${this.endpoint}: ${payload}`);

                let headers: any = {};
                Object.keys(request.headers)
                    .forEach((header: string) => headers[header] = request.headers[header]);

                this.responseHandler = response;
                const messageReceived = {
                    headers,
                    params: request.params,
                    query: request.query,
                    body: payload
                };
                this.redirectCall(request)
                    .then(() => {
                        resolve(messageReceived);
                        next();
                    })
                    .catch(err => {
                        reject(err);
                        next();
                    });

            });
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.secureServer) {
                HttpServerPool.getInstance().getHttpsServer(this.credentials, this.port)
                    .then((app: any) => {
                        this.app = app;
                        resolve();
                    }).catch(err => reject(err));
            } else {
                HttpServerPool.getInstance().getHttpServer(this.port)
                    .then((app: any) => {
                        this.app = app;
                        resolve();
                    }).catch(err => reject(err));
            }
        });
    }

    public unsubscribe() {
        HttpServerPool.getInstance().closeServer(this.port);
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

    public redirectCall(originalRequisition: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const options = this.createOptions(originalRequisition);
                Logger.info(`Redirecting call from ${this.endpoint} (${this.port}) to ${options.url}`);
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                request(options,
                    (error: any, response: any, body: string) => {
                        if (error) {
                            Logger.error('Error redirecting call: ' + error);
                            return reject(error);
                        }
                        this.response = {
                            payload: body,
                            status: response.statusCode
                        };
                        resolve();
                    });

            } catch (err) {
                Logger.error(`Error redirecting call to ${this.redirect}`);
                reject(err);
            }
        });
    }

    private createOptions(originalRequisition: any) {
        let options: any = {
            method: this.method.toLowerCase(),
            url: this.redirect + originalRequisition.url,
            headers: originalRequisition.headers
        };
        options.data = options.body = originalRequisition.rawBody;
        return options;
    }

    private setContentLength(value: string): number {
        if (Buffer.isBuffer(value)) {
            return value.length;
        } else {
            return Buffer.from(value, 'utf8').byteLength;
        }
    }

    private isSecureServer() {
        if (this.type) {
            if (this.type.indexOf('https') != -1) {
                return true;
            } else if (this.type.indexOf('http') != -1) {
                return false;
            }
        }
        throw `Http server type is not known: ${this.type}`;
    }
}