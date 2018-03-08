const whyIsNodeRunning = require('why-is-node-running') // should be your first require
import {RequisitionReader} from "./requisitions/requisition-reader";
import {RequisitionParser} from "./requisitions/requisition-parser";
import {ReportReplier} from "./reporters/reporters-factory";
import {RequisitionRunner} from "./requisitions/requisition-runner";
import {Logger} from "./loggers/logger";

export class Enqueuer {

    private requisitionParser: RequisitionParser = new RequisitionParser();

    public execute(configReaders: any): void {
        configReaders
            .forEach((configReader: any) => {
                let reader = new RequisitionReader(configReader)

                Logger.info(`Starting reader ${configReader.type}`);
                reader.connect()
                        .then(() => this.startReader(reader))
                        .catch( (err: string) => {
                            Logger.error(err);
                            reader.unsubscribe();
                        })
            });
    }

    private startReader(reader: RequisitionReader) {
        reader.receiveMessage()
            .then((messageReceived: string) => {
                Logger.info(`${reader.getSubscriptionType()} got a message`);
                this.processRequisition(messageReceived);
                return this.startReader(reader); //runs again
            })
            .catch( (err: string) => {
                Logger.error(err);
                reader.unsubscribe();
            })
    }

    private processRequisition(messageReceived: string): void {
        try {
            this.requisitionParser.parse(messageReceived)
                .then((requisition: any) => {
                    const requisitionRunner: RequisitionRunner = new RequisitionRunner(requisition);
                    requisitionRunner.start((requisitionResultReport: string) => {
                        Logger.info("Requisition is over");
                        new ReportReplier(requisition.reports)
                            .publish(requisitionResultReport);
                      })
                })
                .catch((error: any) => {
                    Logger.error(error);
                });

            // return this.processRequisition(requisition); //Do it again
            // whyIsNodeRunning();
        } catch (err) {
            Logger.error(err);
        }
    }
}