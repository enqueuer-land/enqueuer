import {Publisher} from "../publish/publisher";
import {PublisherFactory} from "../publish/publisher-factory";
import {Logger} from "../log/logger";

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
