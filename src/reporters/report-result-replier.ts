import {Publisher} from "../publishers/publisher";
import {PublisherFactory} from "../publishers/publisher-factory";
import {Logger} from "../loggers/logger";

export class ReportResultReplier {

    private repliers: Publisher[] = [];

    public constructor(reportersAttributes: any) {
        const publisherFactory: PublisherFactory = new PublisherFactory();

        reportersAttributes.forEach((report: any) => {
            Logger.debug(`Instantiating replier: ${report.type}`);
            const publisher = publisherFactory.createPublisher(report);
            this.repliers.push(publisher);
        });
    }

    public publish(resultReport: string): any {
        this.repliers.forEach( reporter => {
            reporter.payload = resultReport;
            reporter.publish()
                .catch(err=> Logger.error(err));
        })
    }
}
