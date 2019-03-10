import {RequisitionModel} from '../models/inputs/requisition-model';
import * as fs from 'fs';
import {RequisitionParentCreator} from '../components/requisition-parent-creator';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';

export class RequisitionFileParser {
    private readonly filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    public parse(): RequisitionModel {
        const fileBufferContent = fs.readFileSync(this.filename).toString();
        const requisition: any = DynamicModulesManager
            .getInstance().getObjectParserManager()
            .tryToParseWithParsers(fileBufferContent, ['yml', 'json']);
        if (Array.isArray(requisition)) {
            return new RequisitionParentCreator().create(this.filename, requisition);
        }
        if (!requisition.name) {
            requisition.name = this.filename;
        }
        if (!this.isValidRequisition(requisition)) {
            throw 'File ' + this.filename + ' is not a valid requisition. ' +
            'Unable to find: \'onInit\', \'onFinish\', \'requisitions\', \'publishers\' nor \'subscriptions\'';
        }

        return requisition;
    }

    private isValidRequisition(requisition: RequisitionModel): boolean {
        return requisition.onInit !== undefined ||
            requisition.onFinish !== undefined ||
            (Array.isArray(requisition.requisitions) && requisition.requisitions.length > 0) ||
            (Array.isArray(requisition.publishers) && requisition.publishers.length > 0) ||
            (Array.isArray(requisition.subscriptions) && requisition.subscriptions.length > 0);
    }

}
