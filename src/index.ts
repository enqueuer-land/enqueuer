#!/usr/bin/env node

import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import './injectable-files-list';

export function start(): Promise<number> {
    let configuration = new Configuration();
    const logLevel = configuration.getLogLevel();

    if (Logger && logLevel) {
        Logger.setLoggerLevel(logLevel);
        if (configuration.isQuietMode()) {
            Logger.disable();
        }
    }

    return new Promise((resolve, reject) => {
        new EnqueuerStarter(configuration)
            .start()
            .then(statusCode => resolve(statusCode))
            .catch(err => reject(err));
    });
}

start()
    .then(statusCode => process.exit(statusCode))
    .catch(console.log.bind(console));
