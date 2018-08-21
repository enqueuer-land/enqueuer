import {Event} from './event';
import {Assertion} from './assertion';
import {Test} from './test';
import {Tester} from './tester';
import {AssertionCodeGenerator} from './assertion-code-generator';
import {ScriptExecutor} from './script-executor';
import {Store} from './store';
import {Logger} from '../loggers/logger';

export class EventTestExecutor {
    private arguments: {name: string, value: any}[] = [];
    private assertions: Assertion[] = [];
    private script: string = '';

    public constructor(event?: Event) {
        if (event) {
            this.script = event.script || '';
            this.assertions = event.assertions || [];
        }
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

        this.assertions.forEach(assertion => {
            try {
                result = result.concat(this.runAssertion(assertion));
            } catch (err) {
                result = result.concat({valid: false, label: `Assertion ${assertion.label} code is valid`, description: err.toString()});
            }
        });
        return initial.concat(result);
    }

    private runAssertion(assertion: Assertion): Test[] {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        const code = assertionCodeGenerator.generate(assertion);
        return this.scriptRunner(this.script + code);
    }

    private scriptRunner(script: string): Test[] {
        const scriptExecutor = new ScriptExecutor(script);

        let tester = new Tester();

        scriptExecutor.addArgument('store', Store.getData());
        scriptExecutor.addArgument('tester', tester);
        this.arguments.forEach(argument => {
            scriptExecutor.addArgument(argument.name, argument.value);
        });

        Logger.trace(`Function result: ${scriptExecutor.execute()}`);
        return tester.getReport();
    }

}