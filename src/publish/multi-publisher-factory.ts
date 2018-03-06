import {Publisher} from "./publisher";
import {PublisherFactory} from "./publisher-factory";
import {Logger} from "../log/logger";

export class MultiPublisherFactory {

    private payload: string;

    constructor(payload: string) {
        this.payload = payload;
    }

    public createReportPublishers(reportsAttributes: any): Publisher[] {
        const publisherFactory: PublisherFactory = new PublisherFactory();

        let reportRepliers: Publisher[] = [];
        reportsAttributes.forEach((report: any) => {
            report.payload = this.payload;
            const publisher = publisherFactory.createPublisher(report);
            Logger.debug(`Instantiating publisher: ${publisher.constructor.name}`);
            reportRepliers.push(publisher);
        });
        return reportRepliers;
    }
}
