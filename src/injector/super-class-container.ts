import {FactoryPredicate, NullFactoryPredicate} from "./factory-predicate";

interface Injectable {
    name: string;
    factoryPredicate?: FactoryPredicate;
    constructor: Function;
}

export class SuperClassContainer {

    private injectables: any = {};
    private default: any = null;

    public createFromPredicate = (argument: any): any => {
        for (const injectable in this.injectables) {
            const factoryPredicate = this.injectables[injectable].factoryPredicate;
            if (factoryPredicate && factoryPredicate(argument))
                return new this.injectables[injectable].constructor(argument);
        }
        if (this.default)
            return new this.default.constructor(argument);
        return null;
    }

    public createAll = (argument: any): any[] => {
        let returnList = [];
        for (const injectable in this.injectables) {
            returnList.push(new this.injectables[injectable].constructor(argument));
        }
        return returnList;
    }

    public addInjectable = (injectable: Injectable): any => {
        if (injectable.factoryPredicate == NullFactoryPredicate) {
            this.default = injectable;
        }
        else {
            if (this.injectables[injectable.name])
                return null;
            this.injectables[injectable.name] = injectable;
        }
        return injectable;
    }
}
