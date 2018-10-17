import {Event} from '../models/events/event';
import {Assertion} from '../models/events/assertion';
import {Test} from '../testers/test';
import {Tester} from '../testers/tester';
import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {EventCodeGenerator} from '../code-generators/event-code-generator';

export abstract class EventExecutor {
    private testerInstanceName = 'tester';
    private storeInstanceName = 'store';

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
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator(this.testerInstanceName,
            this.storeInstanceName,
            this.event,
            this.name);
        const code = eventCodeGenerator.generate();
        return this.runEvent(code).map(test => {
            return {name: test.label, valid: test.valid, description: test.errorDescription};
        });
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
                assertions: this.prepareAssertions(event.assertions || [])
            };
        }
        return result;
    }

    private prepareAssertions(assertions: Assertion[]): Assertion[] {
        let assertionCounter = 0;
        return assertions.map(assertion => {
            if (!assertion.name) {
                assertion.name = `Assertion #${assertionCounter.toString()}`;
            }
            ++assertionCounter;
            return assertion;
        });
    }

    private runEvent(script: string): Test[] {
        const dynamicFunction = new DynamicFunctionController(script);

        let tester = new Tester();
        dynamicFunction.addArgument(this.testerInstanceName, tester);
        dynamicFunction.addArgument(this.storeInstanceName, Store.getData());

        this.arguments.forEach(argument => {
            dynamicFunction.addArgument(argument.name, argument.value);
        });

        try {
            dynamicFunction.execute();
        } catch (err) {
            const message = `Error running event '${this.name}': ${err}`;
            Logger.error(message);
            tester.addTest({valid: false, label: 'Event ran', errorDescription: message});
        }
        return tester.getReport();
    }

}
