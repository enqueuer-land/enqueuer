"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Publisher {
    constructor(publisherAttributes) {
        Object.keys(publisherAttributes).forEach(key => {
            this[key] = publisherAttributes[key];
        });
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.name = publisherAttributes.name;
    }
}
exports.Publisher = Publisher;
