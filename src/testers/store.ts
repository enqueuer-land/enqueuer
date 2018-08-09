import {Configuration} from '../configurations/configuration';
import {VariablesController} from '../variables/variables-controller';

export class Store {
    private configuration = new Configuration();

    public setEnqueuerVariable = (name: string, value: any): void => {
        this.configuration.setFileVariable(name, value);
    }

    public setSessionVariable = (name: string, value: any): void => {
        VariablesController.sessionVariables()[name] = value;
    }

    public getVariable = (name: string): any => {
        if (VariablesController.sessionVariables()[name]) {
            return VariablesController.sessionVariables()[name];
        }
        return VariablesController.persistedVariables()[name];
    }
}