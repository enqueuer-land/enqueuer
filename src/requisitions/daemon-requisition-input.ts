import {Subscription} from "../subscriptions/subscription";
import {Logger} from "../loggers/logger";
import {RequisitionParser} from "./requisition-parser";
import {RequisitionModel} from "./models/requisition-model";
import {SubscriptionModel} from "./models/subscription-model";
import {Container} from "conditional-injector";

export class DaemonRequisitionInput {

    private type: string;
    private subscription: Subscription;
    private requisitionParser: RequisitionParser;

    constructor(input: SubscriptionModel) {
        this.type = input.type;
        this.requisitionParser = new RequisitionParser();
        this.subscription = Container.subclassesOf(Subscription).create(input);
    }

    public connect(): Promise<void> {
        Logger.info(`Connecting to input ${this.type}`);

        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<RequisitionModel> {
        return new Promise((resolve) => {
            this.subscription.receiveMessage()
                .then((message: string) => {
                    Logger.info(`${this.type} got a message`);
                    try {
                        resolve(this.requisitionParser.parse(message));
                    }
                    catch(err) {
                        Logger.error(`Error parsing requisition ${JSON.stringify(err)}`)
                    }
                })
        });
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

}