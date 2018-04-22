import {Subscription} from "./subscription";
import {SubscriptionModel} from "../requisitions/models/subscription-model";
import {Injectable} from "conditional-injector";
const net = require('net')
const fs = require('fs');

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === "uds"})
export class UdsSubscription extends Subscription {

    private server: any;
    private path: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.path = subscriptionAttributes.path;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.server.on('connection', (stream: any) => {
                    stream.on('end', () => {
                        stream.end();
                        reject();
                    });

                    stream.on('data', (msg: any) => {
                        msg = msg.toString();
                        resolve(msg)
                        stream.end();
                    });

                })
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve) => {
            fs.unlink(this.path, () => {
                this.server = net.createServer()
                    .listen(this.path, () => {
                        resolve();
                    })
            });

        });
    }


    public unsubscribe(): void {
        this.server.close();
    }

}