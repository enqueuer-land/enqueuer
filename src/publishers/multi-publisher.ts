import {Publisher} from "./publisher";
import {Logger} from "../loggers/logger";
import {PublisherModel} from "../models/inputs/publisher-model";
import {Container} from "conditional-injector";

export class MultiPublisher {

    private repliers: Publisher[] = [];

    public constructor(reportersAttributes: PublisherModel[]) {
        reportersAttributes.forEach((report: PublisherModel) => {
            Logger.debug(`Instantiating publisher ${report.type}`);
            const publisher = Container.subclassesOf(Publisher).create(report);
            this.repliers.push(publisher);
        });
    }

    public publish(payload: string): Promise<void[]> {
        return Promise.all(this.repliers.map(
            reporter => {
                        reporter.payload = payload;
                        return reporter.publish()
                    }));

    }
}
