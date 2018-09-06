import {Subscription} from '../subscriptions/subscription';
import {Logger} from '../loggers/logger';
import {Container} from 'conditional-injector';
import {RequisitionParser} from '../runners/requisition-parser';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {DaemonInputAdapter} from './daemon-run-input-adapters/daemon-input-adapter';

//TODO test it
export class DaemonInput {
    private type: string;
    private subscription: Subscription;
    private parser: RequisitionParser;
    private adapter: DaemonInputAdapter;

    constructor(input: SubscriptionModel) {
        this.type = input.type;
        this.parser = new RequisitionParser();
        this.subscription = Container.subclassesOf(Subscription).create(input);
        this.adapter = Container.subclassesOf(DaemonInputAdapter).create(input);
    }

    public getType(): string {
        return this.type;
    }

    public subscribe(): Promise<void> {
        Logger.info(`Subscribing to input ${this.type}`);

        return new Promise((resolve, reject) => {
            this.subscription.subscribe()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<RequisitionModel[]> {
        return new Promise((resolve) => {
            this.subscription.receiveMessage()
                .then((payload: any) => {
                    Logger.info(`Daemon ${this.type} got bytes`);
                    try {
                        this.adaptMessage(payload, resolve);
                    } catch (err) {
                        Logger.error(`Error parsing requisition ${JSON.stringify(err)}`);
                    }
                });
        });
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    private adaptMessage(payload: any, resolve: any) {
        const message = this.adapter.adapt(payload);
        if (message) {
            resolve(this.parser.parse(message));
        } else {
            Logger.warning(`Daemon input ${this.type} is not being able to adapt received message: ${Object.keys(payload)}`);
        }
    }

}