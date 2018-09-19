"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectNotation {
    static decycle(value) {
        const cache = new Map();
        const stringified = JSON.stringify(value, (key, value) => {
            if (typeof (value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
}
exports.ObjectNotation = ObjectNotation;
