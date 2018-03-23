#!/usr/bin/env node

import {EnqueuerStarter} from "./enqueuer-starter";
import {Configuration} from "./configurations/configuration";
import {Logger} from "./loggers/logger";
const prettyjson = require('prettyjson');
import "./injector/injector";


let configuration = new Configuration();
const logLevel = configuration.getLogLevel();

const setLogLevel = function () {
    if (Logger)
        Logger.setLoggerLevel(logLevel);
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

new EnqueuerStarter()
    .start()
    .then(statusCode => process.exitCode = statusCode);