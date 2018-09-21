import {EnqueuerExecutor} from './run-modes/enqueuer-executor';
import {Logger} from './loggers/logger';
import {Container} from 'conditional-injector';
import {ConfigurationValues} from './configurations/configuration-values';

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor(configuration: ConfigurationValues) {
        this.executor = Container.subclassesOf(EnqueuerExecutor).create(configuration);
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
