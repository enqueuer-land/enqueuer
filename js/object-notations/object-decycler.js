"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectDecycler {
    constructor(circularReplacer) {
        this.cache = new Map();
        this.circularReplacer = circularReplacer;
    }
    decycle(value) {
        const stringified = JSON.stringify(value, (key, value) => this.jsonStringifyReplacer(key, value));
        return JSON.parse(stringified);
    }
    isObject(value) {
        return typeof (value) === 'object';
    }
    isNotNull(value) {
        return value !== null;
    }
    register(value) {
        this.cache.set(value, true);
    }
    isRegistered(value) {
        return this.cache.has(value);
    }
    jsonStringifyReplacer(key, value) {
        if (this.isObject(value) && this.isNotNull(value)) {
            if (this.isRegistered(value)) {
                return this.circularReplacer;
            }
            this.register(value);
        }
        return value;
    }
}
exports.ObjectDecycler = ObjectDecycler;
