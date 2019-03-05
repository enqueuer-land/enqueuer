#!/usr/bin/env node
import './injectable-files-list';
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';
import {CommandLineConfiguration} from './configurations/command-line-configuration';
import {PluginManager} from './plugins/plugin-manager';
import {TestsDescriber} from './testers/tests-describer';

export async function start(): Promise<number> {
    Logger.setLoggerLevel('info');
    const describeProtocols = CommandLineConfiguration.describeProtocols();
    const describeFormatters = CommandLineConfiguration.describeFormatters();
    if (describeProtocols) {
        return PluginManager.getProtocolManager().describeProtocols(describeProtocols) ? 0 : 1;
    } else if (describeFormatters) {
        return PluginManager.getReportFormatterManager().describeReportFormatters(describeFormatters) ? 0 : 1;
    } else if (CommandLineConfiguration.describeTestsList()) {
        new TestsDescriber().describeTests();
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

const testMode = process.argv.length > 1 && process.argv[1].toString().match('jest');

if (!testMode) {
    start()
        .then(statusCode => process.exit(statusCode))
        .catch(console.log.bind(console));
}
