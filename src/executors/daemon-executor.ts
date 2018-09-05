import {DaemonRunInput} from './daemon-run-input';
import {Logger} from '../loggers/logger';
import {MultiPublisher} from '../publishers/multi-publisher';
import {EnqueuerExecutor} from './enqueuer-executor';
import {Injectable} from 'conditional-injector';
import {MultiRequisitionRunner} from '../runners/multi-requisition-runner';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {ConfigurationValues} from '../configurations/configuration-values';

@Injectable({predicate: (configuration: ConfigurationValues) => configuration.runMode && configuration.runMode.daemon != null})
export class DaemonExecutor extends EnqueuerExecutor {

    private requisitionInputs: DaemonRunInput[];
    private multiPublisher: MultiPublisher;

    public constructor(configuration: ConfigurationValues) {
        super();
        const daemonMode = configuration.runMode.daemon;
        Logger.info('Executing in Daemon mode');

        this.multiPublisher = new MultiPublisher(configuration.outputs);
        this.requisitionInputs = daemonMode.map((input: any) => new DaemonRunInput(input));
    }

    public execute(): Promise<boolean> {
        return new Promise(() => {
            this.requisitionInputs
                .forEach((input: DaemonRunInput) => {
                    input.connect()
                        .then(() => {
                            return this.startReader(input);
                        })
                        .catch( (err: string) => {
                            Logger.error(err);
                            input.unsubscribe();
                        });
                });
        });
    }

    private startReader(input: DaemonRunInput) {
        input.receiveMessage()
            .then( (requisitions: input.RequisitionModel[]) => new MultiRequisitionRunner(requisitions, input.getType()).run())
            .then( (report: output.RequisitionModel) => this.multiPublisher.publish(report))
            .then(() => this.startReader(input))
            .catch( (err) => {
                Logger.error(err);
                this.multiPublisher.publish(JSON.stringify(err)).then(() => this.startReader(input));
            });
    }

}