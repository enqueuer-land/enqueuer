import {Logger} from "../loggers/logger";
import {RequisitionReporter} from "../reporters/requisition-reporter";
import * as input from "../models/inputs/requisition-model";
import * as output from "../models/outputs/requisition-model";
import {Runner} from "./runner";
import {Injectable} from "conditional-injector";

@Injectable()
export class RequisitionRunner extends Runner {

    private requisitionReporter: RequisitionReporter;

    private requisitionName: string;

    public constructor(requisition: input.RequisitionModel) {
        super();
        this.requisitionName = requisition.name;
        Logger.info(`Starting requisition '${requisition.name}'`);
        this.requisitionReporter = new RequisitionReporter(requisition);
    }

    public run(): Promise<output.RequisitionModel> {
        return new Promise((resolve) => {
            return this.requisitionReporter.start(
                () => {
                    Logger.info(`Requisition '${this.requisitionName}' is over`);
                    resolve(this.requisitionReporter.getReport())
                });
        });
    }
}

