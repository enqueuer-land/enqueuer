import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reporters/report";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunRequisitionInput} from "../requisitions/single-run-requisition-input";
import {Injectable} from "../injector/injector";
import {Configuration} from "../configurations/configuration";
import {RequisitionStarter} from "../requisitions/requisition-starter";
import {Logger} from "../loggers/logger";
const prettyjson = require('prettyjson');


let printReportSummary = function (report: Report) {
    const options = {
        defaultIndentation: 4,
        keysColor: "white",
        dashColor: "grey"
    };
    Logger.info(`Reports summary:`)
    console.log(prettyjson.render(report, options));
};

enum MultiExecutionType {
    Serial = "serial",
    Parallel = "parallel"
}

const multiTypeFromString = (stringType: string): MultiExecutionType => {
    if (stringType && stringType.toLowerCase() === MultiExecutionType.Parallel.toString().toLowerCase())
        return MultiExecutionType.Parallel;
    return MultiExecutionType.Serial;
}

@Injectable(enqueuerConfiguration => enqueuerConfiguration["single-run"])
export class SingleRunEnqueuerExecutor extends EnqueuerExecutor {

    private runningRequisitionsCounter = 0;
    private multiExecution?: MultiExecutionType;
    private outputFilename: string;
    private multiPublisher: MultiPublisher;
    private singleRunRequisitionInput: SingleRunRequisitionInput;
    private reportMerge: Report;

    constructor(enqueuerConfiguration: any) {
        super();
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];
        this.multiExecution = multiTypeFromString(singleRunConfiguration["multi-execution"]);

        Logger.info(`Executing in SingleRun, mode: ${this.multiExecution}`);
        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunRequisitionInput =
            new SingleRunRequisitionInput(singleRunConfiguration.fileNamePattern);

        this.reportMerge = {
            valid: true,
            errorsDescription: []
        }
    }

    public execute(): Promise<Report> {
        return new Promise((resolve) => {
            this.singleRunRequisitionInput.receiveRequisition()
                .then(requisition => {
                    this.multiPublisher.publish(JSON.stringify(requisition)).then().catch(console.log.bind(console));;

                    if (this.multiExecution == MultiExecutionType.Parallel)
                        resolve(this.execute()); //Run the next one
                    ++this.runningRequisitionsCounter;
                    new RequisitionStarter(requisition).start()
                        .then(report => {
                            --this.runningRequisitionsCounter;
                            Logger.info(`Remaining requisitions to receive report: ${this.runningRequisitionsCounter}`);

                            this.mergeNewReport(report, requisition.id);

                            if (this.multiExecution == MultiExecutionType.Serial)
                                resolve(this.execute()); //Run the next one
                            else if (this.runningRequisitionsCounter <= 0) {
                                printReportSummary(this.reportMerge);
                                resolve(this.reportMerge); //It's over
                            }
                        }).catch(console.log.bind(console));;
                })
                .catch(() => {
                    Logger.info("There is no more requisitions to be ran");
                    if (this.multiExecution == MultiExecutionType.Serial) {
                        printReportSummary(this.reportMerge);
                        resolve(this.reportMerge)
                    }
                })
        });
    }

    private mergeNewReport(newReport: Report, id: string): void {
        this.reportMerge.valid = this.reportMerge.valid && newReport.valid;
        newReport.errorsDescription.forEach(newError => {
            this.reportMerge.errorsDescription.push(`[Requisition][${id}]${newError}`)
        })
    }



}