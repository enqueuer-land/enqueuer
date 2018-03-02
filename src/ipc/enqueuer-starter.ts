import { RequisitionReader } from "./requisition-reader";
import {UdsReader} from "./uds-reader";
import {Requisition} from "../service/requisition/requisition";
import {RequisitionParser} from "../service/requisition/requisition-parser";
import {ReportReplier} from "../report/report-replier";
import {ReportReplierFactory} from "../report/report-replier-factory";
import {EnqueuerService} from "../service/enqueuer-service";
import {Report} from "../report/report";
import {FileRequisitionReader} from "./file-requisition-reader";
import {StandardInputReader} from "./standard-input-reader";

const whyIsNodeRunning = require('why-is-node-running') // should be your first require

export class EnqueuerStarter {

    public start(): void {
        this.addAllReaders().forEach((reader: RequisitionReader) => this.startReader(reader));
    }

    private startReader(reader: RequisitionReader) {
        reader.start()
            .then((requisition: string) => {
                this.startService(requisition);
                this.startReader(reader);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    private addAllReaders(): RequisitionReader[] {
        let requisitionReaders: RequisitionReader[] = [];

        requisitionReaders.push(new FileRequisitionReader());
        requisitionReaders.push(new StandardInputReader());
        requisitionReaders.push(new UdsReader());
        return requisitionReaders;
    }

    private startService(requisition: string): void {
        const parsedRequisition: Requisition = new RequisitionParser().parse(requisition);
        const reportRepliers: ReportReplier[] = new ReportReplierFactory().createReplierFactory(parsedRequisition);
        const enqueuerService: EnqueuerService = new EnqueuerService(parsedRequisition);
        enqueuerService.start((report: Report) => {
            reportRepliers.forEach( reportReplier => reportReplier.report(report));
            whyIsNodeRunning();
        });
    }
}