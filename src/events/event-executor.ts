import {Event} from '../models/events/event';
import {Assertion} from '../models/events/assertion';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {EventCodeGenerator} from '../code-generators/event-code-generator';

export abstract class EventExecutor {
    private arguments: { name: string, value: any }[] = [];
    private readonly event: Event;
    private readonly name: string;

    protected constructor(name: string, event?: Event) {
        this.event = this.initializeEvent(event);
        this.name = name;
    }

    public abstract trigger(): TestModel[];

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    protected execute(): TestModel[] {
        Logger.trace(`Executing event function`);
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator(
            this.event,
            this.name);
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
