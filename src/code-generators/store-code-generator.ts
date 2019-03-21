export class StoreCodeGenerator {
    private readonly testsName: string;
    private readonly storeInstanceName: string;

    public constructor(testsName: string, storeInstanceName: string) {
        this.storeInstanceName = storeInstanceName;
        this.testsName = testsName;
    }

    public generate(store: any): string {
        let code = '';
        Object.keys(store).forEach(key => {
            code += `try {
                        ${this.storeInstanceName}['${key}'] = ${store[key]};
                    } catch (err) {
                        ${this.testsName}.push({
                                description: \`Error executing store '${key}' code: '\${err}'\`,
                                valid: false,
                                label: "Valid 'store' in event auto-generated code"
                            });
                    }\n`;

        });
        return code;
    }

}
