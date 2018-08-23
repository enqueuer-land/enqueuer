export class StoreCodeGenerator {
    private testerInstanceName: string;
    private storeInstanceName: string;

    public constructor(testerInstanceName: string, storeInstanceName: string) {
        this.storeInstanceName = storeInstanceName;
        this.testerInstanceName = testerInstanceName;
    }

    public generate(store: any): string {
        let code = '';
        Object.keys(store).forEach(key => {
            code += `try {
                        ${this.storeInstanceName}['${key}'] = ${store[key]};
                    } catch (err) {
                        ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing store '${key}' code: '\${err}'\`,
                                valid: false,
                                label: "Valid store code"
                            });
                    }\n`;

        });
        return code;
    }

}