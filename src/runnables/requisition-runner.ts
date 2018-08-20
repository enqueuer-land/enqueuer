import {Logger} from '../loggers/logger';
import {RequisitionReporter} from '../reporters/requisition-reporter';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {Runner} from './runner';
import {Injectable} from 'conditional-injector';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../testers/store';

@Injectable()
export class RequisitionRunner extends Runner {

    private requisitionReporter: RequisitionReporter;

    private requisitionName: string;

    public constructor(requisition: input.RequisitionModel) {
        super();
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        Logger.debug(`Updating replaceable variables in requisition '${requisition.name}'`);
        const replacedRequisition = placeHolderReplacer.addVariableMap(Store.getData())
                            .replace(requisition) as input.RequisitionModel;

        this.requisitionName = replacedRequisition.name;
        this.requisitionReporter = new RequisitionReporter(replacedRequisition);

        Logger.info(`Starting requisition '${replacedRequisition.name}'`);
    }

    public run(): Promise<output.RequisitionModel> {
        return new Promise((resolve) => {
            return this.requisitionReporter.start(
                () => {
                    const report = this.requisitionReporter.getReport();
                    Logger.info(`Requisition '${this.requisitionName}' is over (${report.valid})`);
                    resolve(report);
                });
        });
    }
}