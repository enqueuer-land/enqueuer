"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Publisher {
    constructor(publisherAttributes) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.name = publisherAttributes.name;
        this.prePublishing = publisherAttributes.prePublishing;
        this.onMessageReceived = publisherAttributes.onMessageReceived;
    }
}
exports.Publisher = Publisher;
