#!/usr/bin/env node
import './injectable-files-list';
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';

export async function start(): Promise<number> {
    Logger.setLoggerLevel('info');
    const logLevel = Configuration.getInstance().getLogLevel();

    if (Logger && logLevel) {
        Logger.setLoggerLevel(logLevel);
    }

    return await new EnqueuerStarter().start().catch((error) => {
        Logger.fatal(error);
        throw 1;
    });
}

const testMode = process.argv.length > 1 && process.argv[1].toString().match('jest');

if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
