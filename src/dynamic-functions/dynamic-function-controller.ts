import {Logger} from '../loggers/logger';

export class DynamicFunctionController {

    private readonly functionBody: string;
    private arguments: { name: string, value: any }[] = [];

    public constructor(functionBody: string) {
        this.functionBody = functionBody;
        this.addArgument('require', require);
        this.addArgument('Logger', Logger);
    }

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    public execute(): any {
        const createdFunction = this.createFunction();
        return this.executeFunction(createdFunction);
    }

    private createFunction(): Function {
        try {
            const constructorArgs = this.arguments.map(arg => arg.name).concat(this.functionBody);
            return ((...args: string[]) => new Function(...args)).apply(null, constructorArgs);
        } catch (err) {
            Logger.error(`Error creating function '${err}'`);
            throw err;
        }
    }

    private executeFunction(dynamicFunction: Function): any {
        try {
            const callArgs = this.arguments.map(arg => arg.value);
            return dynamicFunction.apply(this, callArgs);
        } catch (err) {
            Logger.error(`Error running function '${err}'}`);
            throw err;
        }
    }

}
