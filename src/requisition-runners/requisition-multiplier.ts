import {RequisitionModel} from '../models/inputs/requisition-model';
import {Logger} from '../loggers/logger';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';
import {IterationsEvaluator} from './iterations-evaluator';
import {HashComponentCreator} from '../object-notations/hash-component-creator';
import {RequisitionParentCreator} from './requisition-parent-creator';

export class RequisitionMultiplier {
    private readonly requisition: RequisitionModel;
    private readonly iterations?: number;

    public constructor(requisition: RequisitionModel) {
        this.requisition = requisition;
        this.iterations = this.evaluateIterations();
    }

    public multiply(): RequisitionModel | undefined {

        if (this.iterations === undefined || this.iterations === 1) {
            return this.requisition;
        }

        if (this.iterations <= 0) {
            return undefined;
        }

        if (!this.iterations) {
            Logger.debug(`No iteration was found`);
            return undefined;
        }
        return this.cloneIt();
    }

    private cloneIt(): RequisitionModel {
        const result = new RequisitionParentCreator().create(this.requisition.name);
        const parentBkp = this.requisition.parent;
        delete this.requisition.parent;
        const stringifiedRequisition = JSON.stringify(this.requisition);
        for (let x = 0; x < this.iterations!; ++x) {
            const clone: RequisitionModel = JSON.parse(stringifiedRequisition) as RequisitionModel;
            clone.id = result.id;
            clone.parent = result;
            clone.iterations = 1;
            clone.name = clone.name + ` [${x}]`;
            result.requisitions!.push(new HashComponentCreator().refresh(clone));
        }
        result.parent = parentBkp;
        return result;
    }

    private evaluateIterations(): number | undefined {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        let iterations: any = {
            iterations: this.requisition.iterations
        };

        try {
            const replaced = (placeHolderReplacer.addVariableMap(Store.getData())
                .replace(iterations) as any);
            return new IterationsEvaluator().evaluate(replaced);
        } catch (err) {
            return undefined;
        }
    }

}
