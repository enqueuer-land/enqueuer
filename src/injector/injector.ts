import {FactoryFunction} from "./factory-function";
import {Logger} from "../loggers/logger";
import {SuperClassContainer} from "./super-class-container";

let container: any = {};
export function Container(): any {
    return container;
}

export function Injectable(factoryFunction: FactoryFunction) {
    return function(constructor: any) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        Logger.debug(`Adding ${superClassName}.${className} to the injection container`);
        if (!container[superClassName])
            container[superClassName] = new SuperClassContainer();

        const injected = container[superClassName].addInjectable({
            name: className,
            constructor: constructor,
            factoryFunction: factoryFunction
        });
        if (!injected)
            Logger.warning(`Class '${className}' is already added to the Container`);
    };
}


//#Auto-Generated Code
import "../handlers/start-event/null-start-event"
import "../handlers/start-event/start-event-publisher-handler"
import "../handlers/start-event/start-event-subscription-handler"

