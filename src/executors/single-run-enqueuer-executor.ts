import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reports/report";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunInput} from "./single-run-input";
import {Configuration} from "../configurations/configuration";
import {Logger} from "../loggers/logger";
import {Injectable} from "conditional-injector";
import {RunnableRunner} from "../runnables/runnable-runner";
import {ReportMerger} from "../reports/report-merger";

const fs = require("fs");
const prettyjson = require('prettyjson');

@Injectable({predicate: enqueuerConfiguration => enqueuerConfiguration["single-run"]})
export class SingleRunEnqueuerExecutor extends EnqueuerExecutor {

    private outputFilename: string;
    private multiPublisher: MultiPublisher;
    private singleRunInput: SingleRunInput;
    private reportMerger: ReportMerger;

    constructor(enqueuerConfiguration: any) {
        super();
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunInput =
            new SingleRunInput(singleRunConfiguration.fileNamePattern);

        this.reportMerger = new ReportMerger("SingleRun");
    }

    public async init(): Promise<void> {
        return this.singleRunInput.syncDir();
    }

    public execute(): Promise<Report> {
        return new Promise((resolve) => {
            this.singleRunInput.onNoMoreFilesToBeRead(() => {
                Logger.info("There is no more requisition to be ran");
                this.persistSummary(this.reportMerger.getReport());
                return resolve(this.reportMerger.getReport());
            });
            this.singleRunInput.receiveRequisition()
                .then(runnable => new RunnableRunner(runnable).run())
                .then(report => this.reportMerger.addReport(report))
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then( () => resolve(this.execute())) //Run the next one
                .catch((err) => {
                    this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                    Logger.error(err);
                })
        });
    }

    private persistSummary(report: Report) {
        const options = {
            defaultIndentation: 4,
            keysColor: "white",
            dashColor: "grey"
        };
        Logger.info(`Reports summary:`)
        const toBePersisted = {
            valid: report.valid,
            errorsDescription: report.errorsDescription
        }
        console.log(prettyjson.render(toBePersisted, options));

        if (this.outputFilename)
            fs.writeFileSync(this.outputFilename, JSON.stringify(toBePersisted, null, 4));
    };

}