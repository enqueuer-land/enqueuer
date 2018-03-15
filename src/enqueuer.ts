import {RequisitionStarter} from "./requisitions/requisition-starter";
import {RequisitionInput} from "./requisitions/requisition-input";
import {Logger} from "./loggers/logger";
import {RequisitionOutput} from "./requisitions/requisition-output";
import {RequisitionModel} from "./requisitions/models/requisition-model";

export class Enqueuer {

    private requisitionInputs: RequisitionInput[];
    private requisitionOutputs: RequisitionOutput[];

    public constructor(requisitionInputs: RequisitionInput[], requisitionOutputs: RequisitionOutput[]) {
        this.requisitionInputs = requisitionInputs;
        this.requisitionOutputs = requisitionOutputs;
    }

    public execute(): void {
        this.requisitionInputs
            .forEach((input: RequisitionInput) => {
                input.connect()
                    .then(() =>
                        this.startReader(input))
                    .catch( (err: string) => {
                        Logger.error(err);
                        input.unsubscribe();
                    });
            });
    }

    private startReader(input: RequisitionInput) {
        input.receiveMessage()
            .then((requisition: RequisitionModel) => {
                this.reportRequisitionReceived(requisition);
                new RequisitionStarter(requisition).start();
                return this.startReader(input); //runs again
            })
            .catch( (err) => {
                Logger.error(err);
                this.reportRequisitionReceived(err);
                return this.startReader(input); //runs again
            })
    }

    private reportRequisitionReceived(requisition: RequisitionModel): void {
        this.requisitionOutputs.forEach(output => {
            output.publish(JSON.stringify(requisition, null, 2));
        })
    }

}