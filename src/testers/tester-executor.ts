import {Logger} from '../loggers/logger';
import {Test} from './test';
import {Tester} from './tester';
import {Store} from './store';

export class TesterExecutor {

    private functionBody: string;
    private arguments: {name: string, value: any}[] = [];

    public constructor(functionBody: string) {
        this.functionBody = functionBody;
    }

    public addArgument(name: string, value: any): void {
        this.arguments.push({name: name, value: value});
    }

    public execute(): Test[] {
        try {
            const dynamicFunction = this.createFunction();
            try {
                return this.executeFunction(dynamicFunction);
            } catch (exc) {
                return this.executionError(exc);
            }
        } catch (exc) {
            return this.creationError(exc);
        }
    }

    private createFunction() {
        const constructorArgs = ['store', 'tester']
            .concat(this.arguments.map(arg => arg.name))
            .concat(this.functionBody);
        const dynamicFunction: Function = ((...args: string[]) => new Function(...args)).apply(null, constructorArgs);
        return dynamicFunction;
    }

    private executeFunction(dynamicFunction: Function): Test[] {
        let tester = new Tester();
        let store = new Store();
        const callArgs = [store, tester].concat(this.arguments.map(arg => arg.value));
        dynamicFunction.apply(this, callArgs);
        return tester.getReport();
    }

    private creationError(exc: any) {
        Logger.error(`Error creating function: ${exc}`);
        return [{
            label: 'Function created',
            valid: false,
            description: exc.toString()
        }];
    }

    private executionError(exc: any) {
        Logger.error(`Error executing function: ${exc}`);
        return [{
            label: 'Function executed',
            valid: false,
            description: exc.toString()
        }];
    }

}
