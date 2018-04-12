import {Logger} from "../loggers/logger";
import {MultiPublisher} from "../publishers/multi-publisher";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";
import {Report} from "../reporters/report";
import {Configuration} from "../configurations/configuration";

export class RequisitionStarter {

    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: RequisitionModel) {
        Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new RequisitionRunner(requisition);
    }

    public start(): Promise<Report> {
        return new Promise((resolve) => {
            return this.requisitionRunner.start(
                (requisitionResultReport: Report) => resolve(requisitionResultReport));
        });
    }
}

