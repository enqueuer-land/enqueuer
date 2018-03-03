const whyIsNodeRunning = require('why-is-node-running') // should be your first require
import { RequisitionReader } from "./requisition-reader";
import {Requisition} from "../service/requisition/requisition";
import {RequisitionParser} from "../service/requisition/requisition-parser";
import {ReportReplier} from "../report/report-replier";
import {ReportReplierFactory} from "../report/report-replier-factory";
import {EnqueuerService} from "../service/enqueuer-service";
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
            const enqueuerService: EnqueuerService = new EnqueuerService(parsedRequisition);
            enqueuerService.start((report: Report) => {
                reportRepliers.forEach( reportReplier => reportReplier.report(report));
                // return this.startService(requisition); //Do it again
                // whyIsNodeRunning();
            });
        } catch (err) {
            console.error(err);
        }
}
}