import {Subscription} from "./subscription";

export class UdsSubscription extends Subscription {

    private ipc = require('node-ipc');
    private path: string;

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);

        this.ipc.config.id = subscriptionAttributes.id;
        this.path = subscriptionAttributes.path;
        this.ipc.config.retry = 1500;
        this.ipc.config.silent = true;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.ipc.server.on(this.path, (message: string, socket: any) => {
                resolve(message);
            });
            this.ipc.server.on('error', (error: any) => {
                reject(error);
            });

        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ipc.serve();
            this.ipc.server.start();
            resolve();
        });
    }

    public unsubscribe(): void {
        this.ipc.server.end();
    }

}