import {Enqueuer} from "./enqueuer";
import {RequisitionInput} from "./requisitions/requisition-input";
import {RequisitionOutput} from "./requisitions/requisition-output";
import {Configuration} from "./configurations/configuration";

export class Starter {

    private enqueuer: Enqueuer;

    constructor() {
        const configuration = new Configuration();

        const requisitionInputs: RequisitionInput[] =
            configuration.getInputs().map(input => new RequisitionInput(input));

        const requisitionOutputs: RequisitionOutput[] =
            configuration.getOutputs().map(output => new RequisitionOutput(output));

        this.enqueuer = new Enqueuer(requisitionInputs, requisitionOutputs);
    }

    public start(): void {
        this.enqueuer.execute();
    }

}

