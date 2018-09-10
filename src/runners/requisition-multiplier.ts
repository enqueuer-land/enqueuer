import {RequisitionModel} from '../models/inputs/requisition-model';
import {Logger} from '../loggers/logger';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';

export class RequisitionMultiplier {
    private requisition: RequisitionModel;

    public constructor (requisition: RequisitionModel) {
        this.requisition = requisition;

    }

    public multiply(): RequisitionModel[] {

        if (this.requisition.iterations === undefined) {
            return [this.requisition];
        }

        if (!this.requisition.iterations) {
            Logger.debug(`No iteration was found`);
            return [];
        }

        const iterations = this.evaluateIterations();
        let requisitions: RequisitionModel[] = [];
        for (let x = 0; x < iterations; ++x) {
            const clone: RequisitionModel = {...this.requisition} as RequisitionModel;
            clone.name = clone.name + ` [${x}]`;
            requisitions = requisitions.concat(clone);
        }
        return requisitions;
    }

    private evaluateIterations(): number {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        let iterations: any = {
            iterations: this.requisition.iterations
        };

        return (placeHolderReplacer.addVariableMap(Store.getData())
            .replace(iterations) as any).iterations || 0;
    }
}