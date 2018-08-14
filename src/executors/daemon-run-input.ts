import {Subscription} from '../subscriptions/subscription';
import {Logger} from '../loggers/logger';
import {Container} from 'conditional-injector';
import {RunnableParser} from '../runnables/runnable-parser';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {RunnableModel} from '../models/inputs/runnable-model';

export class DaemonRunInput {

    private type: string;
    private subscription: Subscription;
    private runnableParser: RunnableParser;

    constructor(input: SubscriptionModel) {
        this.type = input.type;
        this.runnableParser = new RunnableParser();
        this.subscription = Container.subclassesOf(Subscription).create(input);
    }

    public connect(): Promise<void> {
        Logger.info(`Connecting to input ${this.type}`);

        return new Promise((resolve, reject) => {
            this.subscription.subscribe()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<RunnableModel> {
        return new Promise((resolve) => {
            this.subscription.receiveMessage()
                .then((message: string) => {
                    Logger.info(`${this.type} got a message`);
                    try {
                        resolve(this.runnableParser.parse(message));
                    } catch (err) {
                        Logger.error(`Error parsing runnable ${JSON.stringify(err)}`);
                    }
                });
        });
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

}