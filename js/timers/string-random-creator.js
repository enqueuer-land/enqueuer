"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringRandomCreator {
    constructor(possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        this.create = (length) => {
            let text = '';
            for (let i = length; i > 0; --i) {
                text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
            }
            return text;
        };
        this.possible = possible;
    }
}
exports.StringRandomCreator = StringRandomCreator;
