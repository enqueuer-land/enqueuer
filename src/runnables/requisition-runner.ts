import {Logger} from "../loggers/logger";
import {RequisitionModel} from "../models/requisition-model";
import {Report} from "../reports/report";
import {RequisitionReporter} from "../reporters/requisition-reporter";
import {Runner} from "./runner";
import {Injectable} from "conditional-injector";

@Injectable()
export class RequisitionRunner extends Runner {

    private requisitionReporter: RequisitionReporter;

    private requisitionName: string;

    public constructor(requisition: RequisitionModel) {
        super();
        this.requisitionName = requisition.name;
        Logger.info(`Starting requisition '${requisition.name}'`);
        this.requisitionReporter = new RequisitionReporter(requisition);
    }

    public run(): Promise<Report> {
        return new Promise((resolve) => {
            return this.requisitionReporter.start(
                () => {
                    Logger.info(`Requisition '${this.requisitionName}' is over`);
                    resolve(this.requisitionReporter.getReport())
                });
        });
    }
}

