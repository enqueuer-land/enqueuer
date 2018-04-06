#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_starter_1 = require("./enqueuer-starter");
const configuration_1 = require("./configurations/configuration");
const logger_1 = require("./loggers/logger");
require("./injector/injector");
const prettyjson = require('prettyjson');
let configuration = new configuration_1.Configuration();
const logLevel = configuration.getLogLevel();
const setLogLevel = function () {
    if (logger_1.Logger)
        logger_1.Logger.setLoggerLevel(logLevel);
};
let printConfigurationFile = function () {
    const options = {
        defaultIndentation: 4,
        keysColor: "white",
        dashColor: "grey"
    };
    console.log(prettyjson.render(configuration.getFile(), options));
};
if (logLevel) {
    printConfigurationFile();
    setLogLevel();
}
new enqueuer_starter_1.EnqueuerStarter()
    .start()
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));
