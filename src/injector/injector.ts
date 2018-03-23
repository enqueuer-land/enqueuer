import {FactoryPredicate} from "./factory-predicate";
import {Logger} from "../loggers/logger";
import {ParentClassContainer} from "./parent-class-container";
import {Container} from "./container";

export function Injectable(factoryPredicate?: FactoryPredicate) {
    return function(constructor: any) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        const injectableContainer: ParentClassContainer = Container.getSuperClassContainer(superClassName);

        const injected = injectableContainer
            .addInjectable(
                {
                    name: className,
                    constructor: constructor,
                    factoryPredicate: factoryPredicate
                });
        if (!injected)
            Logger.warning(`Class '${className}' is already added to the '${superClassName}' container`);
    };
}


//#Auto-Generated Code
import "../executors/daemon-enqueuer-executor"
import "../executors/single-run-enqueuer-executor"
import "../publishers/amqp-publisher"
import "../publishers/file-publisher"
import "../publishers/http-client-publisher"
import "../publishers/mqtt-publisher"
import "../publishers/null-publisher"
import "../publishers/standard-output-publisher"
import "../publishers/uds-publisher"
import "../reporters/start-event/start-event-null-reporter"
import "../reporters/start-event/start-event-publisher-reporter"
import "../reporters/start-event/start-event-subscription-reporter"
import "../subscriptions/amqp-subscription"
import "../subscriptions/filename-watcher-subscription"
import "../subscriptions/http-server-subscription"
import "../subscriptions/mqtt-subscription"
import "../subscriptions/null-subscription"
import "../subscriptions/standard-input-subscription"
import "../subscriptions/uds-subscription"

