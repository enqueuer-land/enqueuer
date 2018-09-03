import {DaemonRunInput} from './daemon-run-input';
import {Logger} from '../loggers/logger';
import {MultiPublisher} from '../publishers/multi-publisher';
import {EnqueuerExecutor} from './enqueuer-executor';
import {Configuration} from '../configurations/configuration';
import {Injectable} from 'conditional-injector';
import {MultiRequisitionRunner} from '../runners/multi-requisition-runner';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';

@Injectable({predicate: enqueuerConfiguration => enqueuerConfiguration['daemon']})
export class DaemonExecutor extends EnqueuerExecutor {

    private requisitionInputs: DaemonRunInput[];
    private multiPublisher: MultiPublisher;

    public constructor(enqueuerConfiguration: any) {
        super();
        Logger.info('Executing in Daemon mode');
        const configuration = new Configuration();

        this.multiPublisher = new MultiPublisher(configuration.getOutputs());
        this.requisitionInputs = enqueuerConfiguration['daemon']
                .map((input: any) => new DaemonRunInput(input));
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