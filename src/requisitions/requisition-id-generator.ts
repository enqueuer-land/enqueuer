import {DateController} from "../dates/date-controller";

export class RequisitionIdGenerator {

    private requisition: string;

    public constructor(requisition: any) {
        this.requisition = requisition as string;
    }

    public generateId(): string {
        return "enqueuer_" + this.calculateHash() + new DateController().getStringOnlyNumbers();
    }
    
    private calculateHash() {
        var hash = 0;
        if (this.requisition.length == 0) return hash;
        for (let i = 0; i < this.requisition.length; ++i) {
            const char: number = this.requisition.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

}