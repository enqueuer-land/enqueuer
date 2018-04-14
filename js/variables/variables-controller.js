"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../configurations/configuration");
class VariablesController {
    constructor() {
        this.persisted = {};
        this.session = {};
        const configuration = new configuration_1.Configuration();
        this.persisted = configuration.getFileVariables();
        this.session = configuration.getSessionVariables();
    }
}
VariablesController.instance = new VariablesController();
VariablesController.persistedVariables = () => {
    return VariablesController.instance.persisted;
};
VariablesController.sessionVariables = () => {
    return VariablesController.instance.session;
};
exports.VariablesController = VariablesController;
