import {RequisitionStarter} from "./requisitions/requisition-starter";
import {RequisitionInput} from "./requisitions/requisition-input";
import {Logger} from "./loggers/logger";
import {RequisitionModel} from "./requisitions/models/requisition-model";
import {MultiPublisher} from "./publishers/multi-publisher";

export class Enqueuer {

    private requisitionInputs: RequisitionInput[];
    private multiPublisher: MultiPublisher;

    public constructor(requisitionInputs: RequisitionInput[], multiPublisher: MultiPublisher) {
        this.requisitionInputs = requisitionInputs;
        this.multiPublisher = multiPublisher;
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
        this.multiPublisher.publish(JSON.stringify(requisition));
    }

}