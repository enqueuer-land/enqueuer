import {Configuration} from "./configurations/configuration";
import {EnqueuerExecutor} from "./executors/enqueuer-executor";
import {Report} from "./reports/report";
import {Logger} from "./loggers/logger";
import {Container} from "conditional-injector";

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor() {
        const configuration = new Configuration();
        this.executor = Container.subclassesOf(EnqueuerExecutor).create(configuration.getRequisitionRunMode());
    }

    public async start(): Promise<number> {
        return this.executor.init()
            .then(() => this.executor.execute())
            .then((report: Report) => {
                Logger.info("Enqueuer execution is over");
                return report.valid ? 0: 1;
            })
            .catch((error: any) => {
                Logger.fatal(`Execution error: ${error}`)
                return -1;
            })
    }
}

