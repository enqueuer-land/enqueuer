import {Configuration} from "./configurations/configuration";
import {Container} from "./injector/container";
import {EnqueuerExecutor} from "./executors/enqueuer-executor";
import {Report} from "./reporters/report";
import {Logger} from "./loggers/logger";

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor() {
        const configuration = new Configuration();
        this.executor = Container.get(EnqueuerExecutor).createFromPredicate(configuration.getRequisitionRunMode());
    }

    public start(): Promise<number> {
        return new Promise(resolve => {
            this.executor.execute()
                .then((report: Report) => {
                    report.valid ? resolve(0): resolve(1);
                })
                .catch((error: any) => {
                    Logger.fatal(`Execution error: ${error}`)
                    resolve(-1);
                })
        });
    }

}

