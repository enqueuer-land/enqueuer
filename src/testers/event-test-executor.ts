import {Event} from './event';
import {Assertion} from './assertion';
import {Test} from './test';
import {Tester} from './tester';
import {AssertionCodeGenerator} from './assertion-code-generator';
import {ScriptExecutor} from './script-executor';
import {Store} from './store';
import {Logger} from '../loggers/logger';

export class EventTestExecutor {
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

    private prepareAssertions(assertions: Assertion[]) {
        let assertionCounter = 0;
        return assertions.map(assertion => {
            if (!assertion.name) {
                assertion.name = assertionCounter.toString();
            }
            ++assertionCounter;
            return assertion;
        });
    }

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    public execute(): Test[] {
        Logger.trace(`Executing event function`);
        let result: Test[] = [];

        try {
            result = this.scriptRunner(this.script);
        } catch (err) {
            Logger.error(`Error executing event function ${err}`);
            return [{valid: false, label: 'Script code is valid', description: err.toString()}];
        }
        return this.testEachAssertion(result);
    }

    private testEachAssertion(initial: Test[]) {
        let result: Test[] = [];
        this.assertions.forEach((assertion: any) => {
            try {
                result = result.concat(this.runAssertion(assertion));
            } catch (err) {
                result = result.concat({valid: false, label: `Assertion '${assertion.name}' is valid`, description: err.toString()});
            }
        });
        return initial.concat(result);
    }

    private runAssertion(assertion: Assertion): Test[] {
        Logger.trace(`Running assertion: ${JSON.stringify(assertion.name)}`);
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator(this.testerInstanceName);
        const code = assertionCodeGenerator.generate(assertion);
        Logger.trace(`Assertion: ${JSON.stringify(assertion.name)} ran`);
        return this.scriptRunner(this.script + code);
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