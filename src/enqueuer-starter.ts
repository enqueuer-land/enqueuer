import {Logger} from './loggers/logger';
import {EnqueuerRunner} from './enqueuer-runner';

export class EnqueuerStarter {

    private enqueuerRunner: EnqueuerRunner;

    constructor() {
        this.enqueuerRunner = new EnqueuerRunner();
    }

    public async start(): Promise<number> {
        let statusCode = 1;
        try {
            const reports = await this.enqueuerRunner.execute();
            statusCode = reports.every(report => report.valid) ? 0 : 1;
        } catch (error) {
            Logger.fatal(`Execution error: ${error}`);
            statusCode = -1;
        }
        Logger.info(`Hope you had a great time`);
        Logger.info('Enqueuer execution is over (' + (statusCode === 0) + ')');
        return statusCode;

    }
}
