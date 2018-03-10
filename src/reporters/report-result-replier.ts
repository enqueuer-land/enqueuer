import {Publisher} from "../publishers/publisher";
import {Logger} from "../loggers/logger";
import {Container} from "../injector/injector";

export class ReportResultReplier {

    private repliers: Publisher[] = [];

    public constructor(reportersAttributes: any) {

        reportersAttributes.forEach((report: any) => {
            Logger.debug(`Instantiating replier: ${report.type}`);
            const publisher = Container().Publisher.create(report);
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
