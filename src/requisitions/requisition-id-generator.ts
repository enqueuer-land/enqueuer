import {DateController} from "../dates/date-controller";

export class RequisitionIdGenerator {

    private requisition: string;

    public constructor(requisition: any) {
        this.requisition = requisition as string;
    }

    public generateId(): string {
        return "enqueuer_" + this.calculateHash() + "_"+ new DateController().getStringOnlyNumbers();
    }
    
    private calculateHash(): number {
        return Math.abs((this.requisition + '').split("")
            .reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a
            }, 0));
    }

}