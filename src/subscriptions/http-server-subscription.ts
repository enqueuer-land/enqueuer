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
    private response: any = {};
    private method: string;
    private key?: string;
    private cert?: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.key = subscriptionAttributes.key;
        this.cert = subscriptionAttributes.cert;
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.method = subscriptionAttributes.method.toLowerCase();
        this.response = subscriptionAttributes.response || {};
        this.response.status = this.response.status || 200;
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            HttpServerPool.getInstance().getApp()[this.method](this.endpoint, (request: any, response: any) => {
                const payload = request.rawBody;
                Logger.debug(`Http got hit (${request.method}) ${this.endpoint}: ${payload}`);
                if (isNullOrUndefined(this.response.payload)) {
                    this.response.payload = payload;
                }

                for (const key in this.response.header) {
                    response.header(key, this.response.header[key]);
                }
                response.status(this.response.status).send(this.response.payload);
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
                server = HttpServerPool.getInstance().getHttpsServer(this.key, this.cert);
            } else if (this.type == 'http-server') {
                server = HttpServerPool.getInstance().getHttpServer();
            } else {
                reject(`Http server type is not known: ${this.type}`);
                return;
            }
            server.on('error', (err: any) => {
                if (err) {
                    reject(err);
                }
            });
            server.listen(this.port, (err: any) => {
                if (err) {
                    reject(err);
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

}