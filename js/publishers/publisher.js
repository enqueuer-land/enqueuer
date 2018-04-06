"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Publisher {
    constructor(publisherAttributes) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.prePublishing = publisherAttributes.prePublishing;
    }
}
exports.Publisher = Publisher;
