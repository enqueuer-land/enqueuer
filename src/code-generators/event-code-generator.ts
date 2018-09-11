import {Event} from '../events/event';
import {AssertionCodeGenerator} from './assertion-code-generator';
import {Assertion} from '../events/assertion';
import {StoreCodeGenerator} from './store-code-generator';

export class EventCodeGenerator {
    private testerInstanceName: string;
    private storeInstanceName: string;
    private assertions: Assertion[];
    private script: string;
    private store: { [propName: string]: any };
    private name: string;

    public constructor(testerInstanceName: string, storeInstanceName: string, eventValue: Event, eventName: string = 'eventName') {
        this.name = eventName;
        this.testerInstanceName = testerInstanceName;
        this.storeInstanceName = storeInstanceName;
        this.store = eventValue.store || {};
        this.script = eventValue.script || '';
        this.assertions = eventValue.assertions || [];
    }

    public generate(): string {
        let code = this.addScriptSnippet();
        code += this.addAssertionSnippet();
        code += this.addStoreSnippet();
        return code;
    }

    private addScriptSnippet(): string {
        return `try {
                        ${this.script}
                    } catch (err) {
                        ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing '${this.name}.script' code: '\${err}'\`,
                                valid: false,
                                label: "Valid 'script' code"
                            });
                    }\n`;
    }

    private addAssertionSnippet(): string {
        let code = '';
        this.assertions.forEach((assertion: any) => {
            const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator(this.testerInstanceName);
            code += assertionCodeGenerator.generate(assertion) + '\n';
        });
        return code;
    }

    private addStoreSnippet(): string {
        const storeCodeGenerator: StoreCodeGenerator = new StoreCodeGenerator(this.testerInstanceName, this.storeInstanceName);
        return storeCodeGenerator.generate(this.store);
    }
}