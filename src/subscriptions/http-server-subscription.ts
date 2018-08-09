import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {isNullOrUndefined} from 'util';
import {HttpServerPool} from '../runnables/pools/http-server-pool';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'http-server'})
export class HttpServerSubscription extends Subscription {
    private port: string;
    private endpoint: string;
    private response: any = {};
    private method: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

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
            HttpServerPool.getInstance().getHttpServer().listen(this.port, (err: any) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public unsubscribe() {
        HttpServerPool.getInstance().closeHttpServer();
    }

}