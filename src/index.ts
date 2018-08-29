#!/usr/bin/env node

import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import './injectable-files-list';

export function start(): Promise<number> {
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

    if (logLevel) {
        setLogLevel();
    }

    return new Promise((resolve, reject) => {
        new EnqueuerStarter()
            .start()
            .then(statusCode => resolve(statusCode))
            .catch(err => reject(err));
    });
}

start()
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));
