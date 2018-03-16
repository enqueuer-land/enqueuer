import {Publisher} from "./publisher";
import {Logger} from "../loggers/logger";
import {PublisherModel} from "../requisitions/models/publisher-model";
import {Container} from "../injector/container";

export class MultiPublisher {

    private repliers: Publisher[] = [];

    public constructor(reportersAttributes: PublisherModel[]) {
        reportersAttributes.forEach((report: PublisherModel) => {
            Logger.debug(`Instantiating publisher ${report.type}`);
            const publisher = Container.get(Publisher).createFromPredicate(report);
            this.repliers.push(publisher);
        });
    }

    public publish(payload: string): void {
        this.repliers.forEach( reporter => {
            reporter.payload = payload;
            reporter.publish()
                .catch(err => {
                    Logger.error(`Error publishing to ${err}`)
                });
        })
    }
}
