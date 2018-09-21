import {DaemonInput} from './daemon-run-input/daemon-input';
import {Logger} from '../loggers/logger';
import {MultiPublisher} from '../publishers/multi-publisher';
import {EnqueuerExecutor} from './enqueuer-executor';
import {Container, Injectable} from 'conditional-injector';
import {MultiRequisitionRunner} from '../requisition-runners/multi-requisition-runner';
import * as output from '../models/outputs/requisition-model';
import {ConfigurationValues} from '../configurations/configuration-values';
import {DaemonInputRequisition} from './daemon-run-input/daemon-input-requisition';
import {ConsoleResultCreator} from './single-run-result-creators/console-result-creator';
import Signals = NodeJS.Signals;
import {RequisitionParser} from '../requisition-runners/requisition-parser';
import {RequisitionModel} from '../models/inputs/requisition-model';

@Injectable({predicate: (configuration: ConfigurationValues) => configuration.runMode && configuration.runMode.daemon != null})
export class DaemonRunExecutor extends EnqueuerExecutor {
    private daemonInputs: DaemonInput[];
    private multiPublisher: MultiPublisher;
    private daemonInputsLength: number;
    private parser: RequisitionParser;
    private reject: (reason?: any) => void = () => {/*do nothing*/};

    public constructor(configuration: ConfigurationValues) {
        super();
        const daemonMode = configuration.runMode.daemon;
        Logger.info('Executing in Daemon mode');

        this.multiPublisher = new MultiPublisher(configuration.outputs);
        this.daemonInputs = daemonMode.map((input: any) => Container.subclassesOf(DaemonInput).create(input));
        this.daemonInputsLength = this.daemonInputs.length;
        this.parser = new RequisitionParser();
        process.on('SIGINT', (handleKillSignal: Signals) => this.handleKillSignal(handleKillSignal));
        process.on('SIGTERM', (handleKillSignal: Signals) => this.handleKillSignal(handleKillSignal));
    }

    public execute(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.reject = reject;
            this.daemonInputs
                .forEach((input: DaemonInput) => {
                    try {
                        input.subscribe((requisition: DaemonInputRequisition) => this.handleRequisitionReceived(requisition));
                    } catch (err) {
                        this.unsubscribe(err, input);
                    }
                });
        });
    }

    private unsubscribe(err: any, input: DaemonInput) {
        Logger.error(`Unsubscribing from daemon input: ${err}`);
        input.unsubscribe().catch((err) => Logger.warning(`Error unsubscribing to input: ${err}`));
        --this.daemonInputsLength;
        if (this.daemonInputsLength <= 0) {
            const message = `Daemon mode has no input able to listen from`;
            Logger.fatal(message);
            this.reject(message);
        }
    }

    private handleRequisitionReceived(message: DaemonInputRequisition) {
        let requisitionModels;
        try {
            requisitionModels = this.parser.parse(message.input);
        } catch (err) {
            message.output = err;
            return this.publishError(message);
        }
        return this.runRequisition(requisitionModels, message);
    }

    private async publishError(message: DaemonInputRequisition) {
        return this.sendResponse(message)
            .then(() => this.multiPublisher.publish(message.output));
    }

    private async runRequisition(requisitionModels: RequisitionModel[], message: DaemonInputRequisition) {
        return new MultiRequisitionRunner(requisitionModels, message.type).run()
            .then((report: output.RequisitionModel) => message.output = report)
            .then(() => this.registerTest(message))
            .then(() => this.sendResponse(message))
            .then(() => this.multiPublisher.publish(message.output));
    }

    private async sendResponse(message: DaemonInputRequisition) {
        await message.daemon.sendResponse(message);
        await message.daemon.cleanUp(message);
    }

    private registerTest(message: DaemonInputRequisition) {
        if (message.output) {
            const resultCreator = new ConsoleResultCreator();
            resultCreator.addTestSuite(message.type, message.output);
            resultCreator.create();
        }
    }

    private async handleKillSignal(handleKillSignal: Signals): Promise<any> {
        const message = `Daemon runner handling kill signal ${handleKillSignal}`;
        Logger.fatal(message);
        await Promise.all(this.daemonInputs.map((input) => input.unsubscribe()));
        this.reject(message);
    }

}