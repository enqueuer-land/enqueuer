import {Publisher} from "../publishers/publisher";
import {PublisherFactory} from "../publishers/publisher-factory";
import {Logger} from "../loggers/logger";

export class ReportersFactory {

    private payload: string;

    constructor(payload: string) {
        this.payload = payload;
    }

    public createReporters(reportersAttributes: any): Publisher[] {
        const publisherFactory: PublisherFactory = new PublisherFactory();

        let reportRepliers: Publisher[] = [];
        reportersAttributes.forEach((report: any) => {
            report.payload = this.payload;
            const publisher = publisherFactory.createPublisher(report);
            Logger.debug(`Instantiating publisher: ${publisher.constructor.name}`);
            reportRepliers.push(publisher);
        });
        return reportRepliers;
    }
}
