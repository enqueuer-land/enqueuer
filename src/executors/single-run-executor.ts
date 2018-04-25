import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reports/report";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunInput} from "./single-run-input";
import {Configuration} from "../configurations/configuration";
import {Logger} from "../loggers/logger";
import {Injectable} from "conditional-injector";
import {RunnableRunner} from "../runnables/runnable-runner";
import {ReportCompositor} from "../reports/report-compositor";

const fs = require("fs");
const prettyjson = require('prettyjson');

@Injectable({predicate: enqueuerConfiguration => enqueuerConfiguration["single-run"]})
export class SingleRunExecutor extends EnqueuerExecutor {

    private outputFilename: string;
    private multiPublisher: MultiPublisher;
    private singleRunInput: SingleRunInput;
    private reportCompositor: ReportCompositor;
    private summary: any = {summary: {}};

    constructor(enqueuerConfiguration: any) {
        super();
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunInput =
            new SingleRunInput(singleRunConfiguration.fileNamePattern);

        this.reportCompositor = new ReportCompositor(singleRunConfiguration["name"] || "single-run-title");
    }

    public async init(): Promise<void> {
        return this.singleRunInput.syncDir();
    }

    public execute(): Promise<Report> {
        return new Promise((resolve) => {
            this.singleRunInput.onNoMoreFilesToBeRead(() => {
                Logger.info("There is no more requisition to be ran");
                this.persistSummary();
                return resolve(this.reportCompositor.snapshot());
            });
            this.singleRunInput.receiveRequisition()
                .then(runnable => new RunnableRunner(runnable).run())
                .then(report => {this.reportCompositor.addSubReport(report); return this.addToSummary(report)})
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then( () => resolve(this.execute())) //Run the next one
                .catch((err) => {
                    this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                    Logger.error(err);
                    resolve(this.execute());
                })
        });
    }

    private addToSummary(report: Report): Report {
        this.summary.summary[report.name] = report.valid;
        return report;
    }

    private persistSummary() {
        const options = {
            defaultIndentation: 4,
            keysColor: "white",
            dashColor: "grey"
        };
        const snapshot = this.reportCompositor.snapshot();
        Logger.info(`Reports summary:`)
        this.summary.valid = snapshot.valid;
        if (snapshot.errorsDescription)
            this.summary.errorsDescription = snapshot.errorsDescription;
        console.log(prettyjson.render(this.summary, options));
        if (this.outputFilename)
            fs.writeFileSync(this.outputFilename, JSON.stringify(snapshot, null, 4));
    };

}