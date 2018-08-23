"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertion_code_generator_1 = require("./assertion-code-generator");
//TODO test it
class EventCodeGenerator {
    constructor(testerInstanceName, eventValue) {
        this.testerInstanceName = testerInstanceName;
        this.script = eventValue.script || '';
        this.assertions = eventValue.assertions || [];
    }
    generate() {
        let code = `try { 
                        ${this.script}
                    } catch (err) {
                        ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing 'script' code: '\${err}'\`,
                                valid: false,
                                label: "Valid 'script' code"
                            });
                    }`;
        if (this.assertions) {
            this.assertions.forEach((assertion) => {
                const assertionCodeGenerator = new assertion_code_generator_1.AssertionCodeGenerator(this.testerInstanceName);
                code += assertionCodeGenerator.generate(assertion);
            });
        }
        return code;
    }
}
exports.EventCodeGenerator = EventCodeGenerator;
