"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Publisher = /** @class */ (function () {
    function Publisher(publish) {
        this.protocol = null;
        this.payload = null;
        this.prePublishing = null;
        if (publish) {
            this.protocol = publish.protocol;
            this.payload = publish.payload;
            this.prePublishing = publish.prePublishing;
        }
    }
    Publisher.prototype.createPrePublishingFunction = function () {
        var fullBody = "let test = {};\n                                    let report = {};\n                                    let payload = '" + this.payload + "';\n                                    " + this.prePublishing + ";\n                                    return {\n                                            test: test,\n                                            report: report,\n                                            payload: payload\n                                     };";
        return new Function(fullBody);
    };
    return Publisher;
}());
exports.Publisher = Publisher;
