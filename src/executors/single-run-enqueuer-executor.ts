import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reporters/report";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunRequisitionInput} from "../requisitions/single-run-requisition-input";
import {Injectable} from "../injector/injector";
import {Configuration} from "../configurations/configuration";
import {RequisitionStarter} from "../requisitions/requisition-starter";
import {Logger} from "../loggers/logger";

@Injectable(enqueuerConfiguration => enqueuerConfiguration["single-run"])
export class SingleRunEnqueuerExecutor extends EnqueuerExecutor {

    private multiPublisher: MultiPublisher;
    private singleRunRequisitionInput: SingleRunRequisitionInput;
    private reportMerge: Report;

    constructor(enqueuerConfiguration: any) {
        super();
        Logger.info("Executing in SingleRun mode");
        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunRequisitionInput =
            new SingleRunRequisitionInput(enqueuerConfiguration["single-run"].fileNamePattern);
        this.reportMerge = {
            valid: true,
            errorsDescription: []
        }
    }

    public execute(): Promise<Report> {
        return new Promise((resolve) => {
            this.singleRunRequisitionInput.receiveRequisition()
                .then(requisition => {
                    this.multiPublisher.publish(JSON.stringify(requisition));
                    new RequisitionStarter(requisition).start()
                        .then(report => {
                            this.mergeNewReport(report, requisition.id);
                            resolve(this.execute()); //Run the next one
                        });
                })
                .catch(() => {
                    Logger.info("There is no more requisitions to be ran");
                    resolve(this.reportMerge)
                })
        });
    }

    private mergeNewReport(newReport: Report, id: string): void {
        this.reportMerge.valid = this.reportMerge.valid && newReport.valid;
        newReport.errorsDescription.forEach(newError => {
            this.reportMerge.errorsDescription.push(`[Requisition][${id}] ${newError}`)
        })
    }



}