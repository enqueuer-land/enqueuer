"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../configurations/configuration");
const variables_controller_1 = require("../variables/variables-controller");
class Store {
    constructor() {
        this.configuration = new configuration_1.Configuration();
        this.persistEnqueuerVariable = (name, value) => {
            this.configuration.setFileVariable(name, value);
        };
        this.persistSessionVariable = (name, value) => {
            variables_controller_1.VariablesController.sessionVariables()[name] = value;
        };
        this.getVariable = (name) => {
            if (variables_controller_1.VariablesController.sessionVariables()[name]) {
                return variables_controller_1.VariablesController.sessionVariables()[name];
            }
            return variables_controller_1.VariablesController.persistedVariables()[name];
        };
    }
}
exports.Store = Store;
