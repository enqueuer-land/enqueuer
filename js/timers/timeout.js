"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Timeout {
    constructor(callBack) {
        this.callback = callBack;
    }
    start(period) {
        this.timer = global.setTimeout(() => {
            this.clear();
            this.callback();
        }, period);
    }
    clear() {
        if (this.timer) {
            global.clearTimeout(this.timer);
            delete this.timer;
        }
    }
}
exports.Timeout = Timeout;
