import {Subscription} from "../subscriptions/subscription";
import {Logger} from "../loggers/logger";
import {RequisitionParser} from "./requisition-parser";
import {Container} from "../injector/injector";
import {RequisitionModel} from "./model/requisition-model";

export class RequisitionInput {

    private type: string;
    private subscription: Subscription;
    private requisitionParser: RequisitionParser;

    constructor(input: any) {
        this.type = input.type;
        this.requisitionParser = new RequisitionParser();;
        this.subscription = Container().Subscription.create(input);
    }

    public connect(): Promise<void> {
        Logger.debug(`Connecting to input ${this.type}`);

        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<RequisitionModel> {
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message: string) => {
                    Logger.info(`${this.type} got a message`);
                    this.requisitionParser.parse(message)
                        .then((validRequisition: RequisitionModel) => {
                            resolve(validRequisition);
                        })
                        .catch(err => {
                            Logger.warning(`Error parsing requisition ${err}`)
                        })
                })
        });
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

}