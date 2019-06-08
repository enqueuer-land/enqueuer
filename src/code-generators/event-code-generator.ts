import {AssertionCodeGenerator} from './assertion-code-generator';
import {Assertion} from '../models/events/assertion';
import {StoreCodeGenerator} from './store-code-generator';
import {TestModel} from '../models/outputs/test-model';
import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';

//TODO test it
export class EventCodeGenerator {
    private readonly thisArg: any;
    private readonly tests: TestModel[] = [];
    private readonly testsInstanceName = 'tests';
    private readonly asserterInstanceName = 'asserter';
    private readonly storeInstanceName = 'store';
    private readonly script: string;
    private readonly store: { [propName: string]: any };
    private readonly name: string;
    private assertions: Assertion[];

    public constructor(thisArg: any, eventName: string) {
        this.thisArg = thisArg;
        this.name = eventName;
        const eventValue: any = this.thisArg[eventName] || {};
        this.store = eventValue.store || {};
        this.script = eventValue.script || '';
        this.assertions = eventValue.assertions || [];
    }

    public run(functionArguments: { name: string; value: any }[]): TestModel[] {
        this.runScriptAndStore(functionArguments);
        this.runAssertions(functionArguments);
        return this.tests;
    }

    private runScriptAndStore(functionArguments: { name: string; value: any }[]) {
        const dynamicFunction = new DynamicFunctionController(this.getScriptSnippet() + this.getStoreSnippet(), this.thisArg);

        dynamicFunction.addArgument(this.storeInstanceName, Store.getData());
        dynamicFunction.addArgument(this.testsInstanceName, this.tests);
        dynamicFunction.addArgument('Logger', Logger);

        functionArguments.forEach(argument => {
            dynamicFunction.addArgument(argument.name, argument.value);
        });

        try {
            dynamicFunction.execute();
        } catch (err) {
            const message = `Error running event '${this.name}': ${err}`;
            Logger.error(message);
            this.tests.push({valid: false, name: 'Event ran', description: message});
        }
    }

    private getScriptSnippet(): string {
        return `try {
                        ${this.script}
                    } catch (err) {
                        const msg = \`Error executing '${this.name}' script: '\${err}'\`;
                        Logger.error(msg);
                        ${this.testsInstanceName}.push({
                                description: msg,
                                valid: false,
                                name: "Valid 'script' code"
                            });
                    }\n`;
    }

    private getStoreSnippet(): string {
        return new StoreCodeGenerator(this.testsInstanceName, this.storeInstanceName).generate(this.store);
    }

    private runAssertions(functionArguments: { name: string; value: any }[]): void {
        this.assertions.forEach((assertion: any) => {
            const assertionCodeGenerator: AssertionCodeGenerator =
                new AssertionCodeGenerator(this.testsInstanceName, this.asserterInstanceName, 'assertion');

            const dynamicFunction = new DynamicFunctionController(assertionCodeGenerator.generate(), this.thisArg);

            dynamicFunction.addArgument(this.asserterInstanceName,
                DynamicModulesManager.getInstance().getAsserterManager().createAsserter(assertion));
            dynamicFunction.addArgument(this.storeInstanceName, Store.getData());
            dynamicFunction.addArgument(this.testsInstanceName, this.tests);
            dynamicFunction.addArgument('assertion', assertion);
            dynamicFunction.addArgument('Logger', Logger);

            functionArguments.forEach(argument => {
                dynamicFunction.addArgument(argument.name, argument.value);
            });

            try {
                dynamicFunction.execute();
            } catch (err) {
                const message = `Error running event '${this.name}' '${assertion.name}': ${err}`;
                Logger.error(message);
                this.tests.push({valid: false, name: 'Assertion ran', description: message});
            }

        });
    }

}
