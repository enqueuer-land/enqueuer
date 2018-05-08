import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reports/report";
import {Injectable} from "conditional-injector";

@Injectable()
export class NullRunExecutor extends EnqueuerExecutor {
    private enqueuerConfiguration: string;

    constructor(enqueuerConfiguration: any) {
        super();
        this.enqueuerConfiguration = JSON.stringify(enqueuerConfiguration, null, 2);
    }

    public async init(): Promise<void> {
        throw new Error(`Impossible to instantiate new executor from: ${this.enqueuerConfiguration}`);
    }

    public execute(): Promise<Report> {
        return Promise.reject(new Error(`Impossible to instantiate new executor from: ${this.enqueuerConfiguration}`));
    }
}