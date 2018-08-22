import {Event} from './event';
import {Assertion} from '../testers/assertion';
import {Test} from '../testers/test';
import {Tester} from '../testers/tester';
import {AssertionCodeGenerator} from '../testers/assertion-code-generator';
import {ScriptExecutor} from '../testers/script-executor';
import {Store} from '../testers/store';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';

export abstract class EventExecutor {
    private testerInstanceName = 'tester';

    private arguments: {name: string, value: any}[] = [];
    private assertions: Assertion[] = [];
    private script: string = '';

    public constructor(event?: Event) {
        if (event) {
            this.script = event.script || '';
            this.assertions = this.prepareAssertions(event.assertions || []);
        }
    }

    public abstract trigger(): TestModel[];

    protected execute(): Test[] {
        Logger.trace(`Executing event function`);
        const code = this.addAssertions();
        return this.scriptRunner(code);
    }

    private prepareAssertions(assertions: Assertion[]) {
        let assertionCounter = 0;
        return assertions.map(assertion => {
            if (!assertion.name) {
                assertion.name = `Assertion #${assertionCounter.toString()}`;
            }
            ++assertionCounter;
            return assertion;
        });
    }

    protected addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    private addAssertions(): string {
        //TODO extract to its own class
        let code  =
        `try {
            ${this.script}
        } catch (err) {
            ${this.testerInstanceName}.addTest({
                    errorDescription: \`Error executing 'script' code: '\${err}'\`,
                    valid: false,
                    label: "Valid 'script' code"
                });
        }`;
        this.assertions.forEach((assertion: any) => {
            const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator(this.testerInstanceName);
            code += assertionCodeGenerator.generate(assertion);
        });
        return code;
    }

    private scriptRunner(script: string): Test[] {
        const scriptExecutor = new ScriptExecutor(script);

        let tester = new Tester();

        scriptExecutor.addArgument('store', Store.getData());
        scriptExecutor.addArgument(this.testerInstanceName, tester);
        this.arguments.forEach(argument => {
            scriptExecutor.addArgument(argument.name, argument.value);
        });

        scriptExecutor.execute();
        return tester.getReport();
    }

}