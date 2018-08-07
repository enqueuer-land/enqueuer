import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {isNullOrUndefined} from 'util';
import express from 'express';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'http-server'})
export class HttpServerSubscription extends Subscription {
    private static app: any = null;
    private static server: any = null;
    private static instanceCounter: number = 0;

    private port: string;
    private endpoint: string;
    private response: any = {};
    private method: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.initializeExpressApp();

        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.method = subscriptionAttributes.method.toLowerCase();
        this.response = subscriptionAttributes.response || {};
        this.response.status = this.response.status || 200;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve) => {
            HttpServerSubscription.app[this.method](this.endpoint, (request: any, response: any) => {
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

                resolve(JSON.stringify(result));
            });
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (HttpServerSubscription.server) {
                ++HttpServerSubscription.instanceCounter;
                resolve();
            } else {
                ++HttpServerSubscription.instanceCounter;
                HttpServerSubscription.server = HttpServerSubscription.app.listen(this.port, (err: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            }
        });
    }

    public unsubscribe() {
        --HttpServerSubscription.instanceCounter;
        if (HttpServerSubscription.instanceCounter == 0) {
            HttpServerSubscription.app = null;
            HttpServerSubscription.server.close();
            HttpServerSubscription.server = null;
        }
    }

    private initializeExpressApp() {
        if (!HttpServerSubscription.app) {
            HttpServerSubscription.app = express();
            HttpServerSubscription.app.use((req: any, res: any, next: any) => {
                req.setEncoding('utf8');
                req.rawBody = '';
                req.on('data', function (chunk: any) {
                    req.rawBody += chunk;
                });
                req.on('end', function () {
                    Logger.trace(`Http subscription read ${req.rawBody}`);
                    next();
                });
            });
        }
    }
}