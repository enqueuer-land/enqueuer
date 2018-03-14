import {FactoryFunction, NullFactoryFunction} from "./factory-function";

interface Injectable {
    name: string;
    factoryFunction: FactoryFunction;
    constructor: Function;
}

export class SuperClassContainer {

    private injectables: any = {};
    private default: any = null;

    public create = (argument: any): any => {
        for (const injectable in this.injectables)
            if (this.injectables[injectable].factoryFunction(argument))
                return new this.injectables[injectable].constructor(argument);
        if (this.default)
            return new this.default.constructor(argument);
        return null;
    }

    public addInjectable = (injectable: Injectable): any => {
        if (injectable.factoryFunction == NullFactoryFunction) {
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
