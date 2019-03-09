import {Logger} from './loggers/logger';
import {Configuration} from './configurations/configuration';
import {SingleRunExecutor} from './single-run-executor';

export class EnqueuerStarter {

    private singleRunExecutor: SingleRunExecutor;

    constructor() {
        const logLevel = Configuration.getInstance().getLogLevel();
        Logger.setLoggerLevel(logLevel);
        this.singleRunExecutor = new SingleRunExecutor();
    }

    public async start(): Promise<number> {
        let statusCode = 1;
        try {
            statusCode = await this.singleRunExecutor.execute() ? 0 : 1;
        } catch (error) {
            Logger.fatal(`Execution error: ${error}`);
            statusCode = -1;
        }
        Logger.info(`Hope you had a great time`);
        Logger.info('Enqueuer execution is over (' + (statusCode === 0) + ')');
        return statusCode;

    }
}
