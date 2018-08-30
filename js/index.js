#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_starter_1 = require("./enqueuer-starter");
const configuration_1 = require("./configurations/configuration");
const logger_1 = require("./loggers/logger");
require("./injectable-files-list");
function start() {
    let configuration = new configuration_1.Configuration();
    const logLevel = configuration.getLogLevel();
    if (logger_1.Logger && logLevel) {
        logger_1.Logger.setLoggerLevel(logLevel);
        if (configuration.isQuietMode()) {
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
start()
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));
