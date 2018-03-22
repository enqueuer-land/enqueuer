import {Enqueuer} from "./enqueuer";
import {RequisitionInput} from "./requisitions/requisition-input";
import {Configuration} from "./configurations/configuration";
import {MultiPublisher} from "./publishers/multi-publisher";

export class Starter {

    private enqueuer?: Enqueuer;

    constructor() {
        const configuration = new Configuration();

        const requisitionInputs: RequisitionInput[] =
            configuration.getInputs().map(input => new RequisitionInput(input));

        const multiPublisher: MultiPublisher = new MultiPublisher(configuration.getOutputs());

        this.enqueuer = new Enqueuer(requisitionInputs, multiPublisher);
        this.enqueuer.setSingleRunMode(configuration.isSingleRunMode());
    }

    public start(): void {
        if (this.enqueuer)
            this.enqueuer.execute();
    }

}

