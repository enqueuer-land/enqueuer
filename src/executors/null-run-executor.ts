import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reports/report";
import {Injectable} from "conditional-injector";

@Injectable()
export class NullRunExecutor extends EnqueuerExecutor {
    private enqueuerConfiguration: any;

    constructor(enqueuerConfiguration: any) {
        super();
        this.enqueuerConfiguration = enqueuerConfiguration;
    }

    public async init(): Promise<void> {
        throw new Error(`Impossible to instantiate new executor from: ${this.enqueuerConfiguration}`);
    }

    public execute(): Promise<Report> {
        return Promise.reject(new Error(`Impossible to instantiate new executor from: ${this.enqueuerConfiguration}`));
    }
}