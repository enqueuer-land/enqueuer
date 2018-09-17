"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StoreCodeGenerator {
    constructor(testerInstanceName, storeInstanceName) {
        this.storeInstanceName = storeInstanceName;
        this.testerInstanceName = testerInstanceName;
    }
    generate(store) {
        let code = '';
        Object.keys(store).forEach(key => {
            code += `try {
                        ${this.storeInstanceName}['${key}'] = ${store[key]};
                    } catch (err) {
                        ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing store '${key}' code: '\${err}'\`,
                                valid: false,
                                label: "Valid 'store' in event auto-generated code"
                            });
                    }\n`;
        });
        return code;
    }
}
exports.StoreCodeGenerator = StoreCodeGenerator;
