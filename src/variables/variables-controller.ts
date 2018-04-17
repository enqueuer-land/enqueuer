import {Configuration} from "../configurations/configuration";

export class VariablesController {
    private static instance: VariablesController = new VariablesController();

    private persisted: any = {};
    private session: any = {};

    private constructor() {
        const configuration = new Configuration();
        this.persisted = configuration.getFileVariables();
        this.session = configuration.getSessionVariables();
    }

    public static persistedVariables = (): any => {
        return VariablesController.instance.persisted;
    }

    public static sessionVariables = (): any => {
        return VariablesController.instance.session;
    }
}