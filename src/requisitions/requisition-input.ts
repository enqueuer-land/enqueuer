import {Subscription} from "../subscriptions/subscription";
import {SubscriptionFactory} from "../subscriptions/subscription-factory";
import {Logger} from "../loggers/logger";
import {RequisitionParser} from "./requisition-parser";

export class RequisitionInput {

    private type: string;
    private subscription: Subscription;
    private requisitionParser: RequisitionParser;

    constructor(input: any) {
        this.type = input.type;
        this.requisitionParser = new RequisitionParser();;
        this.subscription = new SubscriptionFactory().createSubscription(input);
    }

    public connect(): Promise<void> {
        Logger.debug(`Connecting to input ${this.type}`);

        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message: string) => {
                    Logger.info(`${this.type} got a message`);
                    this.requisitionParser.parse(message)
                        .then((validRequisition: any) => {
                            resolve(validRequisition);
                        })
                })
        });
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

}