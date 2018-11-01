import {RequisitionModel} from '../models/inputs/requisition-model';
import {Logger} from '../loggers/logger';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';

export class RequisitionMultiplier {
    private readonly requisition: RequisitionModel;
    private readonly iterations?: number;

    public constructor (requisition: RequisitionModel) {
        this.requisition = requisition;
        this.iterations = this.evaluateIterations();
    }

    public multiply(): RequisitionModel[] {

        if (this.iterations === undefined) {
            return [this.requisition];
        }

        if (!this.iterations) {
            Logger.debug(`No iteration was found`);
            return [];
        }

        let requisitions: RequisitionModel[] = [];
        for (let x = 0; x < this.iterations; ++x) {
            const clone: RequisitionModel = {...this.requisition} as RequisitionModel;
            clone.name = clone.name + ` [${x}]`;
            requisitions = requisitions.concat(clone);
        }
        return requisitions;
    }

    private evaluateIterations(): number | undefined {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        let iterations: any = {
            iterations: this.requisition.iterations
        };

        try {
            return (placeHolderReplacer.addVariableMap(Store.getData())
                .replace(iterations) as any).iterations;
        } catch (err) {
            return undefined;
        }
    }
}
