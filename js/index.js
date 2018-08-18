#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_starter_1 = require("./enqueuer-starter");
const configuration_1 = require("./configurations/configuration");
const logger_1 = require("./loggers/logger");
require("./injectable-files-list");
let configuration = new configuration_1.Configuration();
const logLevel = configuration.getLogLevel();
const setLogLevel = function () {
    if (logger_1.Logger) {
        if (configuration.isQuietMode()) {
            logger_1.Logger.disable();
        }
        else {
            logger_1.Logger.setLoggerLevel(logLevel);
        }
    }
};
if (logLevel) {
    setLogLevel();
}
new enqueuer_starter_1.EnqueuerStarter()
    .start()
    // .then(statusCode => process.exitCode = statusCode);
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));
