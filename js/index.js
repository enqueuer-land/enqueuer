#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_starter_1 = require("./enqueuer-starter");
const configuration_1 = require("./configurations/configuration");
const logger_1 = require("./loggers/logger");
require("./injectable-files-list");
const prettyjson_1 = __importDefault(require("prettyjson"));
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
let printConfigurationFile = function () {
    const options = {
        defaultIndentation: 4,
        keysColor: 'white',
        dashColor: 'grey'
    };
    console.log(prettyjson_1.default.render(configuration.getFile(), options));
};
if (logLevel) {
    setLogLevel();
    printConfigurationFile();
}
new enqueuer_starter_1.EnqueuerStarter()
    .start()
    // .then(statusCode => process.exitCode = statusCode);
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));
