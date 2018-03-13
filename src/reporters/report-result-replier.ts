import {Publisher} from "../publishers/publisher";
import {Logger} from "../loggers/logger";
import {PublisherModel} from "../requisitions/model/publisher-model";
import {Container} from "../injector/container";

export class ReportResultReplier {

    private repliers: Publisher[] = [];

    public constructor(reportersAttributes: PublisherModel[]) {
        reportersAttributes.forEach((report: PublisherModel) => {
            Logger.debug(`Instantiating replier ${report.type}`);
            const publisher = Container().Publisher.create(report);
            this.repliers.push(publisher);
        });
    }

    public publish(resultReport: string): void {
        this.repliers.forEach( reporter => {
            reporter.payload = resultReport;
            reporter.publish()
                .catch(err=> Logger.error(err));
        })
    }
}
