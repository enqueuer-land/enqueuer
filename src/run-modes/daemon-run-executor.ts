import {DaemonInput} from './daemon-run-input-adapters/daemon-input';
import {Logger} from '../loggers/logger';
import {MultiPublisher} from '../publishers/multi-publisher';
import {EnqueuerExecutor} from './enqueuer-executor';
import {Container, Injectable} from 'conditional-injector';
import {MultiRequisitionRunner} from '../requisition-runners/multi-requisition-runner';
import * as output from '../models/outputs/requisition-model';
import {ConfigurationValues} from '../configurations/configuration-values';
import {DaemonInputRequisition} from './daemon-run-input-adapters/daemon-input-requisition';
import {ConsoleResultCreator} from './single-run-result-creators/console-result-creator';

@Injectable({predicate: (configuration: ConfigurationValues) => configuration.runMode && configuration.runMode.daemon != null})
export class DaemonRunExecutor extends EnqueuerExecutor {

    private daemonInputs: DaemonInput[];
    private multiPublisher: MultiPublisher;

    public constructor(configuration: ConfigurationValues) {
        super();
        const daemonMode = configuration.runMode.daemon;
        Logger.info('Executing in Daemon mode');

        this.multiPublisher = new MultiPublisher(configuration.outputs);
        this.daemonInputs = daemonMode.map((input: any) => Container.subclassesOf(DaemonInput).create(input));
    }

    public execute(): Promise<boolean> {
        return new Promise(() => {
            this.daemonInputs
                .forEach((input: DaemonInput) => {
                    input.subscribe()
                        .then(() => this.startReader(input))
                        .catch( (err: any) => {
                            Logger.error(err);
                            input.unsubscribe().catch();
                        });
                });
        });
    }

    private startReader(input: DaemonInput) {
        input.receiveMessage()
            .then((requisition: DaemonInputRequisition) => this.handleRequisitionReceived(requisition))
            .catch( (err) => {
                Logger.error(err);
                input.sendResponse(err).catch(console.log.bind(console));
                this.multiPublisher.publish(err).catch(console.log.bind(console));
                this.startReader(input);
            });
    }

    private handleRequisitionReceived(message: DaemonInputRequisition) {
        const resultCreator = new ConsoleResultCreator();
        return new MultiRequisitionRunner(message.input, message.type).run()
            .then( (report: output.RequisitionModel) => message.output = report)
            .then( () => message.output && resultCreator.addTestSuite(message.type, message.output))
            .then( () => resultCreator.create())
            .then( () => message.daemon.sendResponse(message))
            .then(() => message.daemon.cleanUp())
            .then( () => this.multiPublisher.publish(message.output))
            .then(() => this.startReader(message.daemon));
    }
}