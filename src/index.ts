#!/usr/bin/env node
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import {CommandLineConfiguration} from './configurations/command-line-configuration';
import {DependencyManager} from './configurations/dependency-manager';
import './injectable-files-list';

export async function start(): Promise<number> {
        Logger.setLoggerLevel('info');
        const dependencyManager = new DependencyManager();
        if (CommandLineConfiguration.requestToListAvailableLibraries()) {
            console.log(`Available dependencies: ${dependencyManager.listAvailable().join('; ')}`);
            return 0;
        } else {
            const configuration = Configuration.getValues();
            const logLevel = configuration.logLevel;

            if (Logger && logLevel) {
                Logger.setLoggerLevel(logLevel);
            }

            return await new EnqueuerStarter(configuration).start().catch((error) => {
                Logger.fatal(error);
                throw 1;
            });
        }
}

const testMode = process.argv[1].toString().match('jest');

if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
