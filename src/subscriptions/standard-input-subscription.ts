import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";

process.stdin.setEncoding('utf8');
process.stdin.resume();
@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "standard-input")
export class StandardInputSubscription extends Subscription{

    constructor() {
        super({});
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            let requisition: string = "";
            process.stdin.on('data', (chunk) => requisition += chunk);
            process.stdin.on('end', () => resolve(requisition));
        });
    }

    public connect(): Promise<void> {
        return Promise.resolve();
    }

}