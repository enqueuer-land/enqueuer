#!/usr/bin/env node

import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import './injectable-files-list';
import prettyjson from 'prettyjson';

let configuration = new Configuration();
const logLevel = configuration.getLogLevel();

const setLogLevel = function () {
    if (Logger) {
        if (configuration.isQuietMode()) {
            Logger.disable();
        } else {
            Logger.setLoggerLevel(logLevel);
        }
    }
};

let printConfigurationFile = function () {
    const options = {
        defaultIndentation: 4,
        keysColor: 'white',
        dashColor: 'grey'
    };
    console.log(prettyjson.render(configuration.getFile(), options));
};

if (logLevel) {
    setLogLevel();
    printConfigurationFile();
}

new EnqueuerStarter()
    .start()
    // .then(statusCode => process.exitCode = statusCode);
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));