"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../loggers/logger");
class DaemonInput {
    sendResponse(message) {
        logger_1.Logger.debug(`DaemonInput does not provide synchronous response`);
        return Promise.resolve();
    }
}
exports.DaemonInput = DaemonInput;
