import {Logger} from '../loggers/logger';
import {RequisitionReporter} from '../reporters/requisition-reporter';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {Runner} from './runner';
import {Injectable} from 'conditional-injector';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';

@Injectable()
export class RequisitionRunner extends Runner {

    private requisitionModel: input.RequisitionModel;

    public constructor(requisition: input.RequisitionModel) {
        super();
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        Logger.debug(`Initializing requisition '${requisition.name}'`);
        this.requisitionModel = placeHolderReplacer.addVariableMap(Store.getData())
                            .replace(requisition) as input.RequisitionModel;

        Logger.info(`Starting requisition '${this.requisitionModel.name}'`);
    }

    public run(): Promise<output.RequisitionModel> {
        Logger.info(`Running requisition '${this.requisitionModel.name}'`);
        return new Promise((resolve) => {
            try {
                const requisitionReporter = new RequisitionReporter(this.requisitionModel);
                requisitionReporter.start(
                    () => {
                        const report = requisitionReporter.getReport();
                        Logger.info(`Requisition '${this.requisitionModel.name}' is over (${report.valid})`);
                        resolve(report);
                    });
            } catch (err) {
                Logger.error(`Error running requisition '${this.requisitionModel.name}'`);
                const report: output.RequisitionModel = this.createRunningError(err);
                resolve(report);
            }
        });
    }

    private createRunningError(err: any): output.RequisitionModel {
        return {
            type: 'requisition',
            valid: false,
            tests: [{
                valid: false,
                name: 'Requisition ran',
                description: err
            }],
            name: this.requisitionModel.name,
            time: {
                startTime: '',
                endTime: '',
                totalTime: 0
            },
            subscriptions: [],
            startEvent: {}
        };
    }
}