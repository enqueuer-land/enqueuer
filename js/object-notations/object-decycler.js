"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectDecycler {
    constructor(circularReplacer) {
        this.cache = new Map();
        this.circularReplacer = circularReplacer;
    }
    decycle(value) {
        const stringified = JSON.stringify(value, (key, value) => {
            if (typeof (value) === 'object' && value !== null) {
                if (this.cache.has(value)) {
                    // Circular reference found, discard key
                    return this.circularReplacer;
                }
                // Store value in our map
                this.cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
}
exports.ObjectDecycler = ObjectDecycler;
