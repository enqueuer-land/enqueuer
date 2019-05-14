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
                        const msg = \`Error executing store '${key}' code: '\${err}'\`;
                        Logger.error(msg);
                        ${this.testsName}.push({
                                description: msg,
                                valid: false,
                                name: "Valid 'store' in event code"
                            });
                    }\n`;

        });
        return code;
    }

}
