import {Logger} from "../loggers/logger";
import {MultiPublisher} from "../publishers/multi-publisher";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";
import {Report} from "../reporters/report";
import {Configuration} from "../configurations/configuration";

export class RequisitionStarter {

    private requisitionRunner: RequisitionRunner;

    private requisitionId: string;

    public constructor(requisition: RequisitionModel) {
        this.requisitionId = requisition.id;
        Logger.info(`Starting requisition ${this.requisitionId}`);
        this.requisitionRunner = new RequisitionRunner(requisition);
    }

    public start(): Promise<Report> {
        return new Promise((resolve) => {
            return this.requisitionRunner.start(
                (requisitionResultReport: Report) => {
                    Logger.info(`Requisition ${this.requisitionId} is over`);
                    resolve(requisitionResultReport)
                });
        });
    }
}

