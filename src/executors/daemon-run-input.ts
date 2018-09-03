import {Subscription} from '../subscriptions/subscription';
import {Logger} from '../loggers/logger';
import {Container} from 'conditional-injector';
import {RequisitionParser} from '../runners/requisition-parser';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {RequisitionModel} from '../models/inputs/requisition-model';

export class DaemonRunInput {

    private type: string;
    private subscription: Subscription;
    private parser: RequisitionParser;

    constructor(input: SubscriptionModel) {
        this.type = input.type;
        this.parser = new RequisitionParser();
        this.subscription = Container.subclassesOf(Subscription).create(input);
    }

    public getType(): string {
        return this.type;
    }

    public connect(): Promise<void> {
        Logger.info(`Connecting to input ${this.type}`);

        return new Promise((resolve, reject) => {
            this.subscription.subscribe()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<RequisitionModel[]> {
        return new Promise((resolve) => {
            this.subscription.receiveMessage()
                .then((message: string) => {
                    Logger.info(`${this.type} got a message`);
                    try {
                        resolve(this.parser.parse(message));
                    } catch (err) {
                        Logger.error(`Error parsing requisition ${JSON.stringify(err)}`);
                    }
                });
        });
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

}