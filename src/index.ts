#!/usr/bin/env node

import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import './injectable-files-list';

export async function start(): Promise<number> {
    try {
        Logger.setLoggerLevel('warn');

        const configuration = Configuration.getValues();
        const logLevel = configuration.logLevel;

        if (Logger && logLevel) {
            Logger.setLoggerLevel(logLevel);
        }

        return await new EnqueuerStarter(configuration).start();
    } catch (err) {
        Logger.fatal(err);
        return 2;
    }
}

const testMode = process.argv[1].toString().match('jest');

if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
