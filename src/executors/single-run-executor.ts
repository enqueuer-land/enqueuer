import {EnqueuerExecutor} from "./enqueuer-executor";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunInput} from "./single-run-input";
import {Configuration} from "../configurations/configuration";
import {Logger} from "../loggers/logger";
import {Injectable} from "conditional-injector";
import {RunnableRunner} from "../runnables/runnable-runner";
import {SingleRunResultModel} from "../models/outputs/single-run-result-model";

const fs = require("fs");
const prettyjson = require('prettyjson');

@Injectable({predicate: enqueuerConfiguration => enqueuerConfiguration["single-run"]})
export class SingleRunExecutor extends EnqueuerExecutor {

    private outputFilename: string;
    private multiPublisher: MultiPublisher;
    private singleRunInput: SingleRunInput;
    private report: SingleRunResultModel;

    constructor(enqueuerConfiguration: any) {
        super();
        Logger.info("Executing in Single-Run mode");
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunInput =
            new SingleRunInput(singleRunConfiguration.fileNamePattern);

        this.report = {
            name: singleRunConfiguration["name"] || "single-run-title",
            tests: {},
            valid: true,
            runnables: {}
        };
    }

    public async init(): Promise<void> {
        Logger.info("Initializing Single-Run mode");
        return this.singleRunInput.syncDir();
    }

    public execute(): Promise<SingleRunResultModel> {
        return new Promise((resolve) => {
            this.singleRunInput.onNoMoreFilesToBeRead(() => {
                Logger.info("There is no more requisition to be ran");
                this.persistSummary();
                return resolve(this.report);
            });
            this.singleRunInput.receiveRequisition()
                .then(runnable => new RunnableRunner(runnable).run())
                .then(report => {
                    this.report.runnables[report.name] = report;
                    this.report.valid = this.report.valid && report.valid;
                    return report;
                })
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then( () => resolve(this.execute())) //Run the next one
                .catch((err) => {
                    this.report.valid = false;
                    this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                    Logger.error(err);
                    resolve(this.execute());
                })
        });
    }

    private persistSummary() {
        const options = {
            defaultIndentation: 4,
            keysColor: "white",
            dashColor: "grey",
            inlineArrays: true
        };
        Logger.debug(`Reports summary: ${JSON.stringify(this.report, null, 4)}`)
        console.log(prettyjson.render(this.report, options));
        if (this.outputFilename)
            fs.writeFileSync(this.outputFilename, JSON.stringify(this.report, null, 4));
    };

}