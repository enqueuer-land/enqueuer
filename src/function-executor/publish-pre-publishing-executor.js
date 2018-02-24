"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PublishPrePublishingExecutor = /** @class */ (function () {
    function PublishPrePublishingExecutor(publish, message) {
        var prePublishFunction = publish.createPrePublishingFunction();
        if (prePublishFunction == null)
            return;
        var functionResponse = prePublishFunction(message);
    }
    return PublishPrePublishingExecutor;
}());
exports.PublishPrePublishingExecutor = PublishPrePublishingExecutor;
