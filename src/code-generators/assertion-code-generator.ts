export class AssertionCodeGenerator {
    private readonly testsName: string;
    private readonly assertionName: string;
    private readonly asserterInstanceName: string;

    public constructor(testsName: string, asserterInstanceName: string, assertionName: string) {
        this.testsName = testsName;
        this.asserterInstanceName = asserterInstanceName;
        this.assertionName = assertionName;
    }

    public generate(): string {
        return `try {
            const evaluated = {name: assertion.name};
            (Object.keys(${this.assertionName}) || [])
                .filter(key => key !== 'name')
                .forEach(key =>       evaluated[key] = eval(${this.assertionName}[key])   );
            const testResult = ${this.asserterInstanceName}.assert(evaluated, ${this.assertionName});
            if (assertion.ignore !== undefined && assertion.ignore !== false) {
                testResult.ignored = true;
            }
            ${this.testsName}.push(testResult);
        } catch (err) {
            const msg = \`Error executing assertion: '\${err}'\`;
            Logger.error(msg);
            ${this.testsName}.push({
                name: assertion.name,
                description: msg,
                valid: false
            });
        }`;
    }
}
