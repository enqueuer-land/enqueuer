const whyIsNodeRunning = require('why-is-node-running') // should be your first require
import {RequisitionReader} from "./requisition-reader";
import {RequisitionParser} from "../requisition/requisition-parser";
import {MultiPublisherFactory} from "../publish/multi-publisher-factory";
import {RequisitionRunner} from "./requisition-runner";

export class Enqueuer {

    private requisitionParser: RequisitionParser = new RequisitionParser();

    public execute(configReaders: any): void {

        configReaders
            .forEach((configReader: any) => {
                let reader = new RequisitionReader(configReader)

                console.log(`Connecting ${configReader.protocol}`);
                reader.connect()
                        .then(() => this.startReader(reader))
                        .catch( err => console.error(err))
            });
    }

    private startReader(reader: RequisitionReader) {
        reader.receiveMessage()
            .then((messageReceived: string) => {
                console.log(`${reader.getSubscriptionProtocol()} got a message`);
                this.processRequisition(messageReceived);
                return this.startReader(reader); //runs again
            })
            .catch((err) => {
                console.error(err);
            });
    }

    private processRequisition(messageReceived: string): void {
        try {
            const parsedRequisition: any = this.requisitionParser.parse(messageReceived);
            const requisitionRunner: RequisitionRunner = new RequisitionRunner(parsedRequisition);

            requisitionRunner.start((report: string) => {
                new MultiPublisherFactory(report)
                    .createReportPublishers(parsedRequisition.reports)
                    .forEach( publisher => publisher.publish());
                console.log("Requisition is over");

                // return this.processRequisition(requisition); //Do it again
                // whyIsNodeRunning();
            });
        } catch (err) {
            console.error(err);
        }
    }
}