"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory_predicate_1 = require("./factory-predicate");
class ParentClassContainer {
    constructor() {
        this.injectables = {};
        this.default = null;
        this.createFromPredicate = (argument) => {
            for (const injectable in this.injectables) {
                const factoryPredicate = this.injectables[injectable].factoryPredicate;
                if (factoryPredicate && factoryPredicate(argument))
                    return new this.injectables[injectable].constructor(argument);
            }
            if (this.default)
                return new this.default.constructor(argument);
            return null;
        };
        this.createAll = (argument) => {
            let returnList = [];
            for (const injectable in this.injectables) {
                returnList.push(new this.injectables[injectable].constructor(argument));
            }
            return returnList;
        };
        this.addInjectable = (injectable) => {
            if (injectable.factoryPredicate == factory_predicate_1.NullFactoryPredicate) {
                this.default = injectable;
            }
            else {
                if (this.injectables[injectable.name])
                    return null;
                this.injectables[injectable.name] = injectable;
            }
            return injectable;
        };
    }
}
exports.ParentClassContainer = ParentClassContainer;
