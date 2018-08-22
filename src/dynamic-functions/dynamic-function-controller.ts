import {Logger} from '../loggers/logger';

export class DynamicFunctionController {

    private functionBody: string;
    private arguments: {name: string, value: any}[] = [];

    public constructor(functionBody: string) {
        this.functionBody = functionBody;
    }

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    public execute(): any {
        return this.executeFunction(this.createFunction());
    }

    private createFunction() {
        const constructorArgs = this.arguments.map(arg => arg.name).concat(this.functionBody);
        return ((...args: string[]) => new Function(...args)).apply(null, constructorArgs);
    }

    private executeFunction(dynamicFunction: Function): any {
        try {
            const callArgs = this.arguments.map(arg => arg.value);
            return dynamicFunction.apply(this, callArgs);
        } catch (err) {
            Logger.error(`Error with function: ${dynamicFunction}`);
            throw err;
        }
    }

}
