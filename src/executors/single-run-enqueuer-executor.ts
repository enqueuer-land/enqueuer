import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reporters/report";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunRequisitionInput} from "../requisitions/single-run-requisition-input";
import {Injectable} from "../injector/injector";
import {Configuration} from "../configurations/configuration";
import {RequisitionStarter} from "../requisitions/requisition-starter";
import {Logger} from "../loggers/logger";
const fs = require("fs");
const prettyjson = require('prettyjson');

@Injectable(enqueuerConfiguration => enqueuerConfiguration["single-run"])
export class SingleRunEnqueuerExecutor extends EnqueuerExecutor {

    private outputFilename: string;
    private multiPublisher: MultiPublisher;
    private singleRunRequisitionInput: SingleRunRequisitionInput;
    private reportMerge: Report;

    constructor(enqueuerConfiguration: any) {
        super();
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunRequisitionInput =
            new SingleRunRequisitionInput(singleRunConfiguration.fileNamePattern);

        this.reportMerge = {
            valid: true,
            errorsDescription: [],
            requisitions: {}
        }
    }

    public async init(): Promise<void> {
        return this.singleRunRequisitionInput.syncDir();
    }

    public execute(): Promise<Report> {
        return new Promise((resolve) => {
            this.singleRunRequisitionInput.onNoMoreFilesToBeRead(() => {
                Logger.info("There is no more requisition to be ran");
                this.persistSummary(this.reportMerge);
                return resolve(this.reportMerge);
            });
            this.singleRunRequisitionInput.receiveRequisition()
                .then(requisition => new RequisitionStarter(requisition).start())
                .then(report => this.mergeNewReport(report))
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then( () => resolve(this.execute())) //Run the next one
                .catch((err) => {
                    this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                    Logger.error(err);
                })
        });
    }

    private mergeNewReport(newReport: Report): Report {
        this.reportMerge.requisitions[newReport.id] = newReport.valid;
        this.reportMerge.valid = this.reportMerge.valid && newReport.valid;
        newReport.errorsDescription.forEach(newError => {
            this.reportMerge.errorsDescription.push(`[Requisition][${newReport.id}]${newError}`)
        })
    return newReport;
    }

    private persistSummary(report: Report) {
        const options = {
            defaultIndentation: 4,
            keysColor: "white",
            dashColor: "grey"
        };
        Logger.info(`Reports summary:`)
        console.log(prettyjson.render(report, options));
        if (this.outputFilename)
            fs.writeFileSync(this.outputFilename, JSON.stringify(report, null, 3));
    };

}