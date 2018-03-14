import {FactoryFunction} from "./factory-function";
import {Logger} from "../loggers/logger";
import {SuperClassContainer} from "./super-class-container";
import {Container} from "./container";

export function Injectable(factoryFunction: FactoryFunction) {
    return function(constructor: any) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        const injectableContainer: SuperClassContainer = Container.getSuperClassContainer(superClassName);

        const injected = injectableContainer
            .addInjectable(
                {
                    name: className,
                    constructor: constructor,
                    factoryFunction: factoryFunction
                });
        if (!injected)
            Logger.warning(`Class '${className}' is already added to the '${superClassName}' container`);
    };
}


//#Auto-Generated Code
import "../handlers/start-event/start-event-null-handler"
import "../handlers/start-event/start-event-publisher-handler"
import "../handlers/start-event/start-event-subscription-handler"
import "../publishers/amqp-publisher"
import "../publishers/file-publisher"
import "../publishers/http-client-publisher"
import "../publishers/mqtt-publisher"
import "../publishers/null-publisher"
import "../publishers/standard-output-publisher"
import "../publishers/uds-publisher"
import "../subscriptions/amqp-subscription"
import "../subscriptions/filename-pattern-subscription"
import "../subscriptions/http-server-subscription"
import "../subscriptions/mqtt-subscription"
import "../subscriptions/null-subscription"
import "../subscriptions/standard-input-subscription"
import "../subscriptions/uds-subscription"

