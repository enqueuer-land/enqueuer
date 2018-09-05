#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_starter_1 = require("./enqueuer-starter");
const configuration_1 = require("./configurations/configuration");
const logger_1 = require("./loggers/logger");
require("./injectable-files-list");
function start() {
    const configuration = configuration_1.Configuration.getValues();
    const logLevel = configuration.logLevel;
    if (logger_1.Logger && logLevel) {
        logger_1.Logger.setLoggerLevel(logLevel);
        if (configuration.quiet) {
            logger_1.Logger.disable();
        }
    }
    return new Promise((resolve, reject) => {
        new enqueuer_starter_1.EnqueuerStarter(configuration)
            .start()
            .then(statusCode => resolve(statusCode))
            .catch(err => reject(err));
    });
}
exports.start = start;
const testMode = process.argv[1].toString().match('jest');
if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
