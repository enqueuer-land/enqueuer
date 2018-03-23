import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "./reporters/report";
import {MultiPublisher} from "./publishers/multi-publisher";
import {SingleRunRequisitionInput} from "./requisitions/single-run-requisition-input";
import {Injectable} from "./injector/injector";
import {Configuration} from "./configurations/configuration";
import {RequisitionStarter} from "./requisitions/requisition-starter";
import {Logger} from "./loggers/logger";

@Injectable(enqueuerConfiguration => enqueuerConfiguration["single-run"])
export class SingleRunEnqueuerExecutor extends EnqueuerExecutor{

    private multiPublisher: MultiPublisher;
    private singleRunRequisitionInput: SingleRunRequisitionInput;

    constructor(enqueuerConfiguration: any) {
        Logger.info("Executing in SingleRun mode");
        super();
        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunRequisitionInput =
            new SingleRunRequisitionInput(enqueuerConfiguration["single-run"].fileNamePattern);
    }

    public execute(): Promise<Report> {
        return new Promise((resolve) => {
            this.singleRunRequisitionInput.receiveRequisition()
                .then(requisition => {
                    this.multiPublisher.publish(JSON.stringify(requisition));
                    new RequisitionStarter(requisition).start().then(report => {
                        console.log(report.valid);
                        //TODO: merge them all
                        resolve(report)
                    });

                })
                .catch(err => {
                    Logger.info(`Error receiving requisition: ${err}`)
                })
        });
    }

}