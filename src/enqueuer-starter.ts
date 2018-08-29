import {Configuration} from './configurations/configuration';
import {EnqueuerExecutor} from './executors/enqueuer-executor';
import {Logger} from './loggers/logger';
import {Container} from 'conditional-injector';

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor(configuration: Configuration) {
        this.executor = Container.subclassesOf(EnqueuerExecutor).create(configuration.getRunMode());
    }

    public start(): Promise<number> {
        return new Promise((resolve) => {
            this.executor.execute()
                .then((valid: boolean) => {
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
