#!/usr/bin/env node

import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import './injectable-files-list';

export function start(): Promise<number> {
    const configuration = Configuration.getValues();
    const logLevel = configuration.logLevel;

    if (Logger && logLevel) {
        Logger.setLoggerLevel(logLevel);
        if (configuration.quiet) {
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

const testMode = process.argv[1].toString().match('jest');

if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
