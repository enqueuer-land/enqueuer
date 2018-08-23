"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertion_code_generator_1 = require("./assertion-code-generator");
const store_code_generator_1 = require("./store-code-generator");
class EventCodeGenerator {
    constructor(testerInstanceName, storeInstanceName, eventValue) {
        this.testerInstanceName = testerInstanceName;
        this.storeInstanceName = storeInstanceName;
        this.store = eventValue.store || {};
        this.script = eventValue.script || '';
        this.assertions = eventValue.assertions || [];
    }
    generate() {
        let code = this.addScriptSnippet();
        code += this.addAssertionSnippet();
        code += this.addStoreSnippet();
        console.log(code);
        return code;
    }
    addScriptSnippet() {
        return `try {
                        ${this.script}
                    } catch (err) {
                        ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing 'script' code: '\${err}'\`,
                                valid: false,
                                label: "Valid 'script' code"
                            });
                    }\n`;
    }
    addAssertionSnippet() {
        let code = '';
        this.assertions.forEach((assertion) => {
            const assertionCodeGenerator = new assertion_code_generator_1.AssertionCodeGenerator(this.testerInstanceName);
            code += assertionCodeGenerator.generate(assertion) + '\n';
        });
        return code;
    }
    addStoreSnippet() {
        const storeCodeGenerator = new store_code_generator_1.StoreCodeGenerator(this.testerInstanceName, this.storeInstanceName);
        return storeCodeGenerator.generate(this.store);
    }
}
exports.EventCodeGenerator = EventCodeGenerator;
