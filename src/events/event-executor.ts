import {Event} from '../models/events/event';
import {Assertion} from '../models/events/assertion';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {EventCodeGenerator} from '../code-generators/event-code-generator';
import {Finishable} from '../models/events/finishable';
import {MessageReceiver} from '../models/events/message-receiver';
import {Initializable} from '../models/events/initializable';

export abstract class EventExecutor {
    private arguments: { name: string, value: any }[] = [];
    private readonly self: Finishable | MessageReceiver | Initializable;
    private readonly event: Event;
    private readonly name: string;

    protected constructor(self: Finishable | MessageReceiver | Initializable, name: string, event?: Event) {
        this.self = self;
        this.name = name;
        this.event = this.initializeEvent(event);
    }

    public abstract trigger(): TestModel[];

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    protected execute(): TestModel[] {
        Logger.trace(`Executing event function`);
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator(
            this.event,
            this.name,
            this.self);
        return eventCodeGenerator.run(this.arguments);
    }

    private initializeEvent(event?: Event): Event {
        let result: Event = {
            script: '',
            store: {},
            assertions: []
        };
        if (event) {
            result = {
                script: event.script || '',
                store: event.store || {},
                assertions: this.baptizeAssertions(event.assertions || [])
            };
        }
        return result;
    }

    private baptizeAssertions(assertions: Assertion[]): Assertion[] {
        return assertions.map((assertion, index) => {
            if (!assertion.name) {
                assertion.name = `Assertion #${index}`;
            }
            return assertion;
        });
    }
}
