import {EnqueuerExecutor} from "./enqueuer-executor";
import {MultiPublisher} from "../publishers/multi-publisher";
import {SingleRunInput} from "./single-run-input";
import {Configuration} from "../configurations/configuration";
import {Logger} from "../loggers/logger";
import {Container, Injectable} from "conditional-injector";
import {RunnableRunner} from "../runnables/runnable-runner";
import {ResultCreator} from "../result-creator/ResultCreator";

@Injectable({predicate: enqueuerConfiguration => enqueuerConfiguration["single-run"]})
export class SingleRunExecutor extends EnqueuerExecutor {

    private multiPublisher: MultiPublisher;
    private singleRunInput: SingleRunInput;
    private resultCreator: ResultCreator;

    constructor(enqueuerConfiguration: any) {
        super();
        Logger.info("Executing in Single-Run mode");
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.resultCreator = Container.subclassesOf(ResultCreator).create(enqueuerConfiguration["single-run"].report);

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.singleRunInput = new SingleRunInput(singleRunConfiguration.fileNamePattern);
    }

    public async init(): Promise<void> {
        Logger.info("Initializing Single-Run mode");
        return this.singleRunInput.syncDir();
    }

    public execute(): Promise<boolean> {
        return new Promise((resolve) => {
            this.singleRunInput.onNoMoreFilesToBeRead(() => {
                Logger.info("There is no more requisition to be ran");
                this.resultCreator.create();
                return resolve(this.resultCreator.isValid());
            });
            this.singleRunInput.receiveRequisition()
                .then(runnable => new RunnableRunner(runnable).run())
                .then(report => {
                    this.resultCreator.addTestSuite(report);
                    return report;
                })
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then( () => resolve(this.execute())) //Runs the next one
                .catch((err) => {
                    Logger.error(`Error reported: ${JSON.stringify(err, null, 4)}`);
                    this.resultCreator.addError(err);
                    this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                    resolve(this.execute()); //Runs the next one
                })
        });
    }

}