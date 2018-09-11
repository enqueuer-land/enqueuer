import {DaemonInput} from './daemon-input';
import {Logger} from '../loggers/logger';
import {MultiPublisher} from '../publishers/multi-publisher';
import {EnqueuerExecutor} from './enqueuer-executor';
import {Injectable} from 'conditional-injector';
import {MultiRequisitionRunner} from '../runners/multi-requisition-runner';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {ConfigurationValues} from '../configurations/configuration-values';
import {Store} from '../configurations/store';

@Injectable({predicate: (configuration: ConfigurationValues) => configuration.runMode && configuration.runMode.daemon != null})
export class DaemonRunExecutor extends EnqueuerExecutor {

    private daemonInputs: DaemonInput[];
    private multiPublisher: MultiPublisher;

    public constructor(configuration: ConfigurationValues) {
        super();
        const daemonMode = configuration.runMode.daemon;
        Logger.info('Executing in Daemon mode');

        this.multiPublisher = new MultiPublisher(configuration.outputs);
        this.daemonInputs = daemonMode.map((input: any) => new DaemonInput(input));
    }

    public execute(): Promise<boolean> {
        return new Promise(() => {
            this.daemonInputs
                .forEach((input: DaemonInput) => {
                    input.subscribe()
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

    private startReader(input: DaemonInput) {
        input.receiveMessage()
            .then( (requisitions: input.RequisitionModel[]) => new MultiRequisitionRunner(requisitions, input.getType()).run())
            .then( (report: output.RequisitionModel) => {
                const message = {
                    ...report,
                    store: DaemonRunExecutor.decycle(Store.getData())
                };
                return this.multiPublisher.publish(message);
            })
            .then(() => this.startReader(input))
            .catch( (err) => {
                Logger.error(err);
                this.multiPublisher.publish(err)
                    .then(() => {
                        this.startReader(input);
                    })
                    .catch((err) => {
                        Logger.error(err);
                        this.startReader(input);
                    });
            });
    }

    private static decycle(valueToStringify: any): any {
        const cache = new Map();
        const stringified = JSON.stringify(valueToStringify, (key, value) => {
            if (typeof(value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
}