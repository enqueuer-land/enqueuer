import {Enqueuer} from "./enqueuer";
import {Configuration} from "./configurations/configuration";
import {RequisitionInput} from "./requisitions/requisition-input";
import {RequisitionOutput} from "./requisitions/requisition-output";

export class Starter {

    private enqueuer: Enqueuer;

    constructor() {
        const requisitionInputs: RequisitionInput[] =
            Configuration.getInstance().getInputs().map(input => new RequisitionInput(input));

        const requisitionOutputs: RequisitionOutput[] =
            Configuration.getInstance().getOutputs().map(output => new RequisitionOutput(output));

        this.enqueuer = new Enqueuer(requisitionInputs, requisitionOutputs);
    }

    public start(): void {
        this.enqueuer.execute();
    }

}

