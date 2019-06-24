import {Event} from '../models/events/event';
import {Assertion} from '../models/events/assertion';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {EventCodeGenerator} from '../code-generators/event-code-generator';

export class EventExecutor {
    private arguments: { name: string, value: any }[] = [];
    private readonly thisArg: any;
    private readonly event: Event;
    private readonly eventName: string;

    public constructor(thisArg: any, eventName: string, componentName?: string) {
        this.thisArg = thisArg;
        this.eventName = eventName;
        this.event = this.initializeEvent(this.thisArg[eventName]);
        if (componentName) {
            this.addArgument(componentName, thisArg);
        }
    }

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    public execute(): TestModel[] {
        Logger.debug(`Executing '${this.eventName}' hook`);
        Logger.trace(`'${this.eventName}': ${JSON.stringify(this.event)}`);
        return new EventCodeGenerator(this.thisArg, this.eventName).run(this.arguments);
    }

    private initializeEvent(event: Event): Event {
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
