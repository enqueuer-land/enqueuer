import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionAdopter} from '../components/requisition-adopter';
import {RequisitionValidator} from './requisition-validator';
import {Logger} from '../loggers/logger';

export class RequisitionImporter {

    public import(requisition: RequisitionModel): RequisitionModel {
        const importValue = requisition.import;
        if (importValue) {
            const imported: any = Array.isArray(importValue) ? {requisitions: importValue} : importValue;
            const requisitionValidator = new RequisitionValidator();
            if (!requisitionValidator.validate(imported)) {
                const message = `Error importing ${JSON.stringify(importValue)}: ${requisitionValidator.getErrorMessage()}`;
                Logger.error(message);
                throw message;
            }
            imported.name = imported.name || 'Imported Requisition';

            const merged = Object.assign({}, imported, requisition);
            return new RequisitionAdopter(merged).getRequisition();
        }
        return requisition;
    }
}
