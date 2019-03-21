
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
            ${this.testsName}.push(${this.asserterInstanceName}.assert(evaluated, ${this.assertionName}));
        } catch (err) {
            ${this.testsName}.push({
                description: \`Error executing assertion: '\${err}'\`,
                valid: false,
                label: 'Assertion code valid'
            });
        }`;
    }

}
