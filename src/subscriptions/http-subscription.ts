import {Subscription} from "./subscription";
import {Logger} from "../loggers/logger";
import {Injectable} from "../injector/injector";

const express = require('express')
const app: any = express();

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "http")
export class HttpSubscription extends Subscription {

    private port: string;
    private url: string;
    private server: any;
    private response: any = {};

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.url = subscriptionAttributes.url;
        this.response = subscriptionAttributes.response;
        this.response.status = this.response.status || 200;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            app.post(this.url, (request: any, response: any) => {
                for (const key in this.response.header) {
                    response.header(key, this.response.header[key])

                }
                response.status(this.response.status).send('Requisition read');
                resolve();
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