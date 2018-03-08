import {Publisher} from "../publishers/publisher";
import {PublisherFactory} from "../publishers/publisher-factory";
import {Logger} from "../loggers/logger";

export class ReportReplier {

    private reportRepliers: Publisher[] = [];

    constructor(reportersAttributes: any) {
        const publisherFactory: PublisherFactory = new PublisherFactory();

        reportersAttributes.forEach((report: any) => {
            const publisher = publisherFactory.createPublisher(report);
            Logger.debug(`Instantiating publisher: ${publisher.constructor.name}`);
            this.reportRepliers.push(publisher);
        });
    }

    publish(resultReport: string): any {
        this.reportRepliers.forEach( reporter => {
            reporter.payload = resultReport;
            reporter.publish()
                .catch(err=> Logger.error(err));
        })
    }
}
