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
        return "enqueuer_" + (1+Math.random()*4294967295).toString(16)
    }
}