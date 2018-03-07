import {Subscription} from "./subscription";
const express = require('express')
const app: any = express();

export class HttpSubscription extends Subscription {

    private port: string;
    private url: string;
    private server: any;

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.url = subscriptionAttributes.url;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            app.post(this.url, (request: any, response: any) => {
                console.log("oubind")
                response.send('Requisition read');
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