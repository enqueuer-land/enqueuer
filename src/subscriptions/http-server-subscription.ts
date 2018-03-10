import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";
import {SubscriptionModel} from "../requisitions/model/subscription-model";

const express = require('express')
const app: any = express();

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "http-server")
export class HttpServerSubscription extends Subscription {

    private port: string;
    private endpoint: string;
    private server: any;
    private response: any = {};
    private method: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.method = subscriptionAttributes.method;
        this.response = subscriptionAttributes.response || {};
        this.response.status = this.response.status || 200;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            app.all(this.endpoint, (request: any, response: any) => {
                for (const key in this.response.header) {
                    response.header(key, this.response.header[key])
                }
                if (request.method != this.method)
                    response.status(405).send(`Http server is expecting a ${this.method} call`);
                else {
                    response.status(this.response.status).send('Requisition read');
                    resolve();
                }
            })
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = app.listen(this.port, (err: any) => {
                if (err) {
                    reject(err);
                }
                resolve();
            })

        });
    }

    public unsubscribe(): void {
        if (this.server) {
            this.server.close();
        }
        delete this.server;
    }

}