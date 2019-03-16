import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionAdopter} from '../components/requisition-adopter';
import {Logger} from '../loggers/logger';
import {RequisitionFileParser} from './requisition-file-parser';

export class RequisitionImporter {

    public import(requisition: RequisitionModel): RequisitionModel {
        if (requisition.import) {
            try {
                const imported = new RequisitionFileParser().parseFile(requisition.import);
                const merged = Object.assign({}, imported, requisition);
                return new RequisitionAdopter(merged).getRequisition();
            } catch (e) {
                const message = `Error importing requisition '${requisition.import}': ${e}`;
                Logger.error(message);
                throw message;
            }
        }
        return requisition;
    }
}
