import {Configuration} from "./configurations/configuration";
import {EnqueuerExecutor} from "./executors/enqueuer-executor";
import {Logger} from "./loggers/logger";
import {Container} from "conditional-injector";
import {SingleRunResultModel} from "./models/outputs/single-run-result-model";

export class EnqueuerStarter {

    private executor: EnqueuerExecutor;

    constructor() {
        const configuration = new Configuration();
        this.executor = Container.subclassesOf(EnqueuerExecutor).create(configuration.getRequisitionRunMode());
    }

    public async start(): Promise<number> {
        return this.executor.init()
            .then(() => this.executor.execute())
            .then((report: SingleRunResultModel) => {
                Logger.info("Enqueuer execution is over (" + report.valid + ")");
                return report.valid ? 0: 1;
            })
            .catch((error: any) => {
                Logger.fatal(`Execution error: ${error}`)
                return -1;
            })
    }
}

