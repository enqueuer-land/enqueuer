#!/usr/bin/env node
import './injectable-files-list';
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import {CommandLineConfiguration} from './configurations/command-line-configuration';
import {ProtocolManager} from './configurations/protocol-manager';

export async function start(): Promise<number> {
        Logger.setLoggerLevel('info');
        if (CommandLineConfiguration.requestToListAvailableProtocols()) {
            ProtocolManager.getInstance().printAvailable();
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
