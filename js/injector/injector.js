"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const container_1 = require("./container");
function Injectable(factoryPredicate) {
    return function (constructor) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        const injectableContainer = container_1.Container.getSuperClassContainer(superClassName);
        const injected = injectableContainer
            .addInjectable({
            name: className,
            constructor: constructor,
            factoryPredicate: factoryPredicate
        });
        if (!injected)
            logger_1.Logger.warning(`Class '${className}' is already added to the '${superClassName}' container`);
    };
}
exports.Injectable = Injectable;
//#Auto-Generated Code
require("../executors/daemon-enqueuer-executor");
require("../executors/single-run-enqueuer-executor");
require("../publishers/file-publisher");
require("../publishers/http-client-publisher");
require("../publishers/null-publisher");
require("../publishers/standard-output-publisher");
require("../publishers/uds-publisher");
require("../reporters/start-event/start-event-null-reporter");
require("../reporters/start-event/start-event-publisher-reporter");
require("../reporters/start-event/start-event-subscription-reporter");
require("../subscriptions/filename-watcher-subscription");
require("../subscriptions/http-server-subscription");
require("../subscriptions/null-subscription");
require("../subscriptions/standard-input-subscription");
require("../subscriptions/uds-subscription");
