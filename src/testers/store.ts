import {Configuration} from '../configurations/configuration';
import {VariablesController} from '../variables/variables-controller';

export class Store {
    private configuration = new Configuration();

    public  persistEnqueuerVariable = (name: string, value: any): void => {
        this.configuration.setFileVariable(name, value);
    }

    public persistSessionVariable = (name: string, value: any): void => {
        VariablesController.sessionVariables()[name] = value;
    }

    public deleteEnqueuerVariable = (name: string): void => {
        this.configuration.deleteFileVariable(name);
    }
}