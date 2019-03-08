import {EnqueuerExecutor} from './run-modes/enqueuer-executor';
import {Logger} from './loggers/logger';
import {SingleRunExecutor} from './run-modes/single-run-executor';

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor() {
        this.executor = new SingleRunExecutor();
    }

    public start(): Promise<number> {
        return new Promise((resolve) => {
            this.executor.execute()
                .then((valid: boolean) => {
                    Logger.info(`Hope you had a great time`);
                    Logger.info('Enqueuer execution is over (' + valid + ')');
                    resolve(valid ? 0 : 1);
                })
                .catch((error: any) => {
                    Logger.fatal(`Execution error: ${error}`);
                    resolve(-1);
                });
        });
    }
}
