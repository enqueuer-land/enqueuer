"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subscription = /** @class */ (function () {
    function Subscription(subscriptionAttributes) {
        this.message = null;
        this.timeout = -1;
        this.onMessageReceivedFunctionBody = null;
        if (subscriptionAttributes) {
            this.message = subscriptionAttributes.message;
            this.timeout = subscriptionAttributes.timeout;
            this.onMessageReceivedFunctionBody = subscriptionAttributes.onMessageReceivedFunctionBody;
        }
    }
    Subscription.prototype.createOnMessageReceivedFunction = function () {
        if (this.onMessageReceivedFunctionBody == null)
            return null;
        var fullBody = "let test = {};\n                                    let report = {};\n                                    " + this.onMessageReceivedFunctionBody + ";\n                                    return {\n                                            test: test,\n                                            report: report\n                                     };";
        return new Function('message', fullBody);
    };
    Subscription.prototype.unsubscribe = function () { };
    ;
    return Subscription;
}());
exports.Subscription = Subscription;
