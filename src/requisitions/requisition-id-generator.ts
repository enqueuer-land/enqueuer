import {DateController} from "../timers/date-controller";
var hash = require('object-hash');

export class RequisitionIdGenerator {

    private requisition: string;

    public constructor(requisition: any) {
        this.requisition = requisition as string;
    }

    public generateId(): string {
        return new DateController().getStringOnlyNumbers() +
                "_" +
                hash(this.requisition).substr(0, 8);
    }

}