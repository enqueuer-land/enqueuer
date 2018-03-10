import {DateController} from "../dates/date-controller";

export class RequisitionIdGenerator {

    private requisition: any;

    public constructor(requisition: any) {
        this.requisition = JSON.parse(JSON.stringify(requisition));
    }

    public insertId(): any {
        const id: string = this.generateId();
        this.requisition.id = id;
        return this.requisition;
    }

    private generateId(): string {
        return "enqueuer_" + new DateController().getDateOnlyNumbers();
    }

}