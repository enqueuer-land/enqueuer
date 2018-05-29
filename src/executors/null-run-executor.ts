import {EnqueuerExecutor} from "./enqueuer-executor";
import {Injectable} from "conditional-injector";
import {Logger} from "../loggers/logger";
import {SingleRunResultModel} from "../models/outputs/single-run-result-model";

@Injectable()
export class NullRunExecutor extends EnqueuerExecutor {
    private enqueuerConfiguration: string;

    constructor(enqueuerConfiguration: any) {
        super();
        Logger.info("Executing in Not-Identified mode");
        this.enqueuerConfiguration = JSON.stringify(enqueuerConfiguration, null, 2);
    }

    public async init(): Promise<void> {
        throw new Error(`Impossible to initialize new executor from: ${this.enqueuerConfiguration}`);
    }

    public execute(): Promise<SingleRunResultModel> {
        return Promise.reject(new Error(`Impossible to execute new executor from: ${this.enqueuerConfiguration}`));
    }
}