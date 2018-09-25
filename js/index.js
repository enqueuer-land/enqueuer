#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_starter_1 = require("./enqueuer-starter");
const configuration_1 = require("./configurations/configuration");
const logger_1 = require("./loggers/logger");
require("./injectable-files-list");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.Logger.setLoggerLevel('warn');
            const configuration = configuration_1.Configuration.getValues();
            const logLevel = configuration.logLevel;
            if (logger_1.Logger && logLevel) {
                logger_1.Logger.setLoggerLevel(logLevel);
            }
            return yield new enqueuer_starter_1.EnqueuerStarter(configuration).start();
        }
        catch (err) {
            logger_1.Logger.fatal(err);
            return 2;
        }
    });
}
exports.start = start;
const testMode = process.argv[1].toString().match('jest');
if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
