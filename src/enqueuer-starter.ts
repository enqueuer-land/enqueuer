import {Configuration} from './configurations/configuration';
import {EnqueuerExecutor} from './executors/enqueuer-executor';
import {Logger} from './loggers/logger';
import {Container} from 'conditional-injector';

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor() {
        const configuration = new Configuration();
        this.executor = Container.subclassesOf(EnqueuerExecutor).create(configuration.getRequisitionRunMode());
    }

    public async start(): Promise<number> {
        return this.executor.execute()
                            .then((valid: boolean) => {
                                Logger.info('Enqueuer execution is over (' + valid + ')');
                                return valid ? 0 : 1;
                            })
                            .catch((error: any) => {
                                Logger.fatal(`Execution error: ${error}`);
                                return -1;
                            });
    }
}
