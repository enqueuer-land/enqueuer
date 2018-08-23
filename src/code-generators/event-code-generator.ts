import {Event} from '../events/event';
import {AssertionCodeGenerator} from './assertion-code-generator';
import {Assertion} from '../events/assertion';

export class EventCodeGenerator {
    private testerInstanceName: string;
    private assertions: Assertion[];
    private script: string;

    public constructor(testerInstanceName: string, eventValue: Event) {
        this.testerInstanceName = testerInstanceName;
        this.script = eventValue.script || '';
        this.assertions = eventValue.assertions || [];
    }

    public generate(): string {
        let code =
        `try { 
            ${this.script}
        } catch (err) {
            ${this.testerInstanceName}.addTest({
                    errorDescription: \`Error executing 'script' code: '\${err}'\`,
                    valid: false,
                    label: "Valid 'script' code"
                });
        }`;
        if (this.assertions) {
            this.assertions.forEach((assertion: any) => {
                const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator(this.testerInstanceName);
                code += assertionCodeGenerator.generate(assertion);
            });
        }
        return code;
    }

}