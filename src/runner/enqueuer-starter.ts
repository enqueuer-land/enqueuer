const whyIsNodeRunning = require('why-is-node-running') // should be your first require
import { RequisitionReader } from "../reader/requisition-reader";
import {Requisition} from "../requisition/requisition";
import {RequisitionParser} from "../requisition/requisition-parser";
import {ReportReplier} from "../report/replier/report-replier";
import {ReportReplierFactory} from "../report/replier/report-replier-factory";
import {RequisitionRunner} from "./requisition-runner";
import {Report} from "../report/report";

export class EnqueuerStarter {

    public start(requisitionReaders: RequisitionReader[]): void {
        requisitionReaders.forEach((reader: RequisitionReader) => this.startReader(reader));
    }

    private startReader(reader: RequisitionReader) {
        reader.start()
            .then((requisitions: string) => {
                this.startService(requisitions);
                return this.startReader(reader); //runs again
            })
            .catch((err) => {
                console.error(err);
            });
    }

    private startService(requisition: string): void {
        try {
            const parsedRequisition: Requisition = new RequisitionParser().parse(requisition);
            const reportRepliers: ReportReplier[] = new ReportReplierFactory().createReplierFactory(parsedRequisition);
            const requisitionRunner: RequisitionRunner = new RequisitionRunner(parsedRequisition);
            requisitionRunner.start((report: Report) => {
                reportRepliers.forEach( reportReplier => reportReplier.report(report));
                console.log("Requisition is over");
                // return this.startService(requisition); //Do it again
                // whyIsNodeRunning();
            });
        } catch (err) {
            console.error(err);
        }
}
}