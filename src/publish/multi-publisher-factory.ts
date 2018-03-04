import {Publisher} from "./publisher";
import {PublisherFactory} from "./publisher-factory";

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
            reportRepliers.push(publisherFactory.createPublisher(report))
        });
        return reportRepliers;
    }
}
